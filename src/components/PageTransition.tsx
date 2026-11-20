import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const supportsViewTransition = () =>
    typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

const PageTransition = ({ children }: PageTransitionProps) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (supportsViewTransition() || reducedMotion) {
        return <div className="page-stage">{children}</div>;
    }

    const direction = document.documentElement.dataset.vtDir === 'back' ? -1 : 1;

    return (
        <motion.div
            className="page-stage"
            initial={{ opacity: 0, y: 56 * direction, filter: 'blur(10px)', scale: 1.015 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: -40 * direction, filter: 'blur(8px)', scale: 0.985 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
