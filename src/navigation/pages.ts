export const PUBLIC_PAGES = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Hackathon', path: '/hackathon' },
    { name: 'Certificate', path: '/certificate' },
    { name: 'Resume', path: '/resume' },
    { name: 'Contact', path: '/contact' },
] as const;

export type PublicPath = (typeof PUBLIC_PAGES)[number]['path'];

export const normalizePath = (pathname: string) => {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }
    return pathname || '/';
};

export const publicPageIndex = (pathname: string) =>
    PUBLIC_PAGES.findIndex((page) => page.path === normalizePath(pathname));
