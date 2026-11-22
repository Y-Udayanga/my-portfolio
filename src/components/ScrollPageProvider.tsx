import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PUBLIC_PAGES, normalizePath, publicPageIndex, type PublicPath } from '../navigation/pages';

const PageNavContext = createContext<(to: string) => void>(() => {});

export const usePageNav = () => useContext(PageNavContext);

const isFormField = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

const canScrollInside = (target: EventTarget | null, deltaY: number) => {
    if (!(target instanceof Element)) return false;
    let el: Element | null = target;
    while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
            const atTop = el.scrollTop <= 1;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
            if (deltaY > 0 && !atBottom) return true;
            if (deltaY < 0 && !atTop) return true;
        }
        el = el.parentElement;
    }
    return false;
};

const pageEdge = (deltaY: number) => {
    const scroller = document.scrollingElement ?? document.documentElement;
    const atTop = scroller.scrollTop <= 2;
    const atBottom = scroller.scrollTop + window.innerHeight >= scroller.scrollHeight - 2;
    if (deltaY > 0) return atBottom;
    if (deltaY < 0) return atTop;
    return false;
};

const ScrollPageProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathRef = useRef(location.pathname);
    const lockRef = useRef(false);
    const wheelAccum = useRef(0);

    useEffect(() => {
        pathRef.current = location.pathname;
    }, [location.pathname]);

    const go = useCallback((to: string) => {
        const destination = normalizePath(to);
        const current = normalizePath(pathRef.current);
        if (destination === current || lockRef.current) return;
        if (publicPageIndex(destination) < 0) return;

        lockRef.current = true;
        wheelAccum.current = 0;

        navigate(destination);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        window.setTimeout(() => {
            lockRef.current = false;
        }, 500);
    }, [navigate]);

    useEffect(() => {
        const stepBy = (direction: 1 | -1) => {
            const index = publicPageIndex(pathRef.current);
            if (index < 0) return;
            const next = PUBLIC_PAGES[index + direction];
            if (!next) return;
            go(next.path);
        };

        const onWheel = (event: WheelEvent) => {
            if (lockRef.current || isFormField(event.target) || canScrollInside(event.target, event.deltaY)) {
                wheelAccum.current = 0;
                return;
            }
            if (!pageEdge(event.deltaY)) {
                wheelAccum.current = 0;
                return;
            }

            wheelAccum.current += event.deltaY;
            if (Math.abs(wheelAccum.current) < 70) return;

            const direction = wheelAccum.current > 0 ? 1 : -1;
            const index = publicPageIndex(pathRef.current);
            const nextIndex = index + direction;
            if (index < 0 || nextIndex < 0 || nextIndex >= PUBLIC_PAGES.length) {
                wheelAccum.current = 0;
                return;
            }

            event.preventDefault();
            stepBy(direction);
        };

        let touchStartY = 0;
        const onTouchStart = (event: TouchEvent) => {
            touchStartY = event.touches[0]?.clientY ?? 0;
        };
        const onTouchEnd = (event: TouchEvent) => {
            if (lockRef.current || isFormField(event.target)) return;
            const endY = event.changedTouches[0]?.clientY ?? touchStartY;
            const delta = touchStartY - endY;
            if (Math.abs(delta) < 64) return;
            if (canScrollInside(event.target, delta) || !pageEdge(delta)) return;
            stepBy(delta > 0 ? 1 : -1);
        };

        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = (event.target as Element | null)?.closest?.('a');
            if (!anchor) return;
            if (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            let path: string;
            try {
                const url = new URL(href, window.location.href);
                if (url.origin !== window.location.origin) return;
                path = normalizePath(url.pathname);
            } catch {
                return;
            }
            if (publicPageIndex(path) < 0) return;
            event.preventDefault();
            event.stopPropagation();
            go(path as PublicPath);
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('click', onClick, true);

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('click', onClick, true);
        };
    }, [go]);

    return <PageNavContext.Provider value={go}>{children}</PageNavContext.Provider>;
};

export default ScrollPageProvider;
