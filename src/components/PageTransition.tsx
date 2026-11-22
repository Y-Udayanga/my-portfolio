import { type ReactNode, useEffect } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return <div className="page-stage" style={{ width: '100%' }}>{children}</div>;
};

export default PageTransition;
