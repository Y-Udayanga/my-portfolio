import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Award, Radio, Code, Palette, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import './Home.css';

const useTypewriter = (text: string, speed = 50, delay = 500) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const delayTimer = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(delayTimer);
    }, [text, speed, delay]);

    return { displayed, done };
};

const holoCards = [
    {
        title: 'Projects',
        subtitle: 'View my work',
        icon: Rocket,
        path: '/projects',
        color: '#00f0ff',
        delay: 0.6,
    },
    {
        title: 'Certificate',
        subtitle: 'My credentials',
        icon: Award,
        path: '/certificate',
        color: '#a855f7',
        delay: 0.8,
    },
    {
        title: 'Contact',
        subtitle: 'Get in touch',
        icon: Radio,
        path: '/contact',
        color: '#f637ec',
        delay: 1.0,
    },
];

const Home = () => {
    const greeting = useTypewriter('Hello, I am', 60, 300);

    return (
        <PageTransition>
            <div className="home-container container">
                <div className="hero-section">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="greeting font-mono">
                            {greeting.displayed}
                            {!greeting.done && <span className="typewriter-blink" />}
                        </span>

                        <h1 className="heading-1 title glitch-hover">
                            Yasindu <span className="text-gradient">Udayanga</span>
                        </h1>
                        <h2 className="heading-3 subtitle">
                            BSc (Hons) Computer Science Undergraduate
                        </h2>
                        <p className="description">
                            I build clean, user-friendly web applications and continuously improve my technical skills. Passionate about AI, machine learning, and modern front-end development.
                        </p>

                        <div className="cta-group">
                            <Link to="/projects" className="btn btn-primary">
                                View My Work <ArrowRight size={20} />
                            </Link>
                            <Link to="/contact" className="btn btn-outline">
                                Contact Me
                            </Link>
                        </div>

                        <div className="tech-stack-preview font-mono">
                            <span>React</span>
                            <span className="dot">•</span>
                            <span>Angular</span>
                            <span className="dot">•</span>
                            <span>Spring Boot</span>
                            <span className="dot">•</span>
                            <span>UI/UX</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {/* Floating skill cards */}
                        <div className="floating-card card-1">
                            <Code size={20} />
                            <span>Clean Code</span>
                        </div>
                        <div className="floating-card card-2">
                            <Palette size={20} />
                            <span>Modern UI</span>
                        </div>
                        <div className="floating-card card-3">
                            <Zap size={20} />
                            <span>Fast Perf</span>
                        </div>

                        {/* Central holographic shape */}
                        <div className="holo-shape-container">
                            <div className="holo-ring ring-1" />
                            <div className="holo-ring ring-2" />
                            <div className="holo-ring ring-3" />
                            <div className="holo-core" />
                        </div>
                    </motion.div>
                </div>

                {/* ── Three Holographic Navigation Cards ── */}
                <div className="holo-nav-section">
                    <motion.p
                        className="holo-nav-label font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {'// EXPLORE'}
                    </motion.p>

                    <div className="holo-nav-grid">
                        {holoCards.map((card) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: card.delay }}
                            >
                                <Link to={card.path} className="holo-nav-card">
                                    <div className="holo-card-border" style={{ '--card-color': card.color } as React.CSSProperties} />
                                    <div className="holo-card-inner">
                                        <div className="holo-card-icon" style={{ color: card.color }}>
                                            <card.icon size={28} />
                                        </div>
                                        <h3 className="holo-card-title">{card.title}</h3>
                                        <p className="holo-card-subtitle">{card.subtitle}</p>
                                        <ArrowRight size={16} className="holo-card-arrow" style={{ color: card.color }} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
