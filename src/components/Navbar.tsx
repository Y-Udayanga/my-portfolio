import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Certificate', path: '/certificate' },
    { name: 'Resume', path: '/resume' },
    { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            {/* Scan line effect */}
            <div className="navbar-scan-line" />

            <div className="navbar-container container">
                <NavLink to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    <span className="logo-bracket">[</span>
                    <span className="logo-text">Y</span>
                    <span className="logo-dot text-gradient">.</span>
                    <span className="logo-text">U</span>
                    <span className="logo-bracket">]</span>
                </NavLink>

                {/* Desktop Menu */}
                <div className="navbar-links desktop-only">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-link-text">{link.name}</span>
                            <span className="nav-link-glow" />
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn mobile-only"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mobile-links">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <NavLink
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `mobile-link ${isActive ? 'active' : ''}`
                                        }
                                        onClick={closeMobileMenu}
                                    >
                                        {link.name}
                                    </NavLink>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
