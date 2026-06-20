import { motion } from 'framer-motion';
import { Download, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import './About.css';

const About = () => {
    return (
        <PageTransition>
            <div className="about-container container">
                <div className="about-header text-center">
                    <motion.p
                        className="section-label font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {'// WHO AM I'}
                    </motion.p>
                    <motion.h1
                        className="heading-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        About <span className="text-gradient">Me</span>
                    </motion.h1>
                </div>

                <div className="about-content">
                    <motion.div
                        className="about-image-container"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="about-image-border" />
                        <div className="about-image-inner">
                            <div className="about-image-wrapper">
                                <img
                                    src="/myphoto.png"
                                    alt="Yasindu Udayanga Working"
                                    className="about-image"
                                />
                                {/* Scan line on image */}
                                <div className="image-scan-line" />
                            </div>
                        </div>

                        <div className="experience-badge">
                            <span className="years">3+</span>
                            <span className="text">Years of<br />Experience</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="about-text"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h2 className="about-greeting mb-4">Hello, I'm Yasindu Udayanga</h2>

                        <p className="about-paragraph mb-4">
                            I am a BSc (Hons) Computer Science undergraduate at NSBM with hands-on experience in
                            <strong> Angular, React, Spring Boot, </strong> and modern front-end development. I enjoy building
                            clean, user-friendly web applications and continuously improving my technical skills.
                        </p>

                        <p className="about-paragraph mb-4">
                            Alongside my studies, I work as an <strong>Upwork freelancer</strong>, taking on real-world projects
                            that strengthen my problem-solving, communication, and teamwork abilities. I am also passionate about
                            <strong> AI and machine learning </strong>, and I actively explore new technologies to stay ahead in the industry.
                        </p>

                        <p className="about-paragraph mb-6">
                            My goal is to become a skilled software engineer who builds impactful digital solutions while
                            continuously learning and growing.
                        </p>

                        <div className="about-actions">
                            <Link to="/contact" className="btn btn-primary">
                                Contact Me <ChevronRight size={18} />
                            </Link>
                            <Link to="/resume" className="btn btn-outline">
                                Download CV <Download size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default About;
