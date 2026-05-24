import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import './Projects.css';

const projectsData = [
    {
        id: 1,
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce application built with React, Spring Boot, and PostgreSQL. Features user authentication, payment processing, and an admin dashboard.',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80',
        tags: ['React', 'Spring Boot', 'Tailwind', 'PostgreSQL'],
        link: '#'
    },
    {
        id: 2,
        title: 'AI Dashboard',
        description: 'An interactive data visualization dashboard integrating various machine learning models to provide real-time business insights.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
        tags: ['Angular', 'TypeScript', 'Python', 'D3.js'],
        link: '#'
    },
    {
        id: 3,
        title: 'Task Management System',
        description: 'A collaborative project management tool inspired by Trello, featuring real-time updates and seamless team workflow integration.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80',
        tags: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
        link: '#'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Projects = () => {
    return (
        <PageTransition>
            <div className="projects-container container">
                <div className="section-header">
                    <motion.p
                        className="section-label font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {'// MY WORK'}
                    </motion.p>
                    <motion.h1
                        className="heading-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        My <span className="text-gradient">Projects</span>
                    </motion.h1>
                    <motion.p
                        className="section-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        A selection of some of my most recent and impactful work.
                    </motion.p>
                </div>

                <motion.div
                    className="projects-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {projectsData.map((project) => (
                        <motion.div key={project.id} className="project-card" variants={itemVariants}>
                            <div className="project-card-border" />
                            <div className="project-card-inner">
                                <div className="project-image-container">
                                    <img src={project.image} alt={project.title} className="project-image" />
                                    <div className="project-overlay">
                                        <a href={project.link} className="btn btn-primary overlay-btn">
                                            View Live <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>

                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-desc">{project.description}</p>

                                    <div className="project-tags">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="tag font-mono">{tag}</span>
                                        ))}
                                    </div>

                                    <button className="btn btn-outline more-details-btn">
                                        More Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Projects;
