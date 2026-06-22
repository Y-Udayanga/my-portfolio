import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ImageCarousel from '../components/ImageCarousel';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_PROJECTS_COL_ID } from '../lib/appwrite';
import './Projects.css';

interface Project {
    $id: string;
    title: string;
    description: string;
    image: string;
    images?: string[];
    tags: string[];
    link: string;
}

const fallbackProjectsData: Project[] = [
    {
        $id: '1',
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce application built with React, Spring Boot, and PostgreSQL. Features user authentication, payment processing, and an admin dashboard.',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80',
        tags: ['React', 'Spring Boot', 'Tailwind', 'PostgreSQL'],
        link: '#'
    },
    {
        $id: '2',
        title: 'AI Dashboard',
        description: 'An interactive data visualization dashboard integrating various machine learning models to provide real-time business insights.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
        tags: ['Angular', 'TypeScript', 'Python', 'D3.js'],
        link: '#'
    },
    {
        $id: '3',
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
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PROJECTS_COL_ID
                );
                if (response.documents.length > 0) {
                    setProjects(response.documents as unknown as Project[]);
                } else {
                    setProjects(fallbackProjectsData);
                }
            } catch (error) {
                console.error('Failed to load projects from Appwrite, using fallback:', error);
                setProjects(fallbackProjectsData);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <Loader2 className="spinner" size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    <motion.div
                        className="projects-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {projects.map((project) => (
                            <motion.div key={project.$id} className="project-card" variants={itemVariants}>
                                <div className="project-card-border" />
                                <div className="project-card-inner">
                                    <div className="project-image-container">
                                        <img src={project.image} alt={project.title} className="project-image" />
                                        <div className="project-overlay">
                                            <a href={project.link} className="btn btn-primary overlay-btn" target="_blank" rel="noreferrer">
                                                View Live <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="project-content">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-desc">{project.description}</p>

                                        <div className="project-tags">
                                            {project.tags && project.tags.map(tag => (
                                                <span key={tag} className="tag font-mono">{tag}</span>
                                            ))}
                                        </div>

                                        <button onClick={() => setSelectedProject(project.$id)} className="btn btn-outline more-details-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                                            More Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Modal for Project Details */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="modal-backdrop" onClick={() => setSelectedProject(null)} />

                            {projects.filter(p => p.$id === selectedProject).map(project => (
                                <motion.div
                                    key={project.$id}
                                    className="modal-content"
                                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                >
                                    <div className="modal-border" />
                                    <div className="modal-inner">
                                        <button className="close-modal-btn" onClick={() => setSelectedProject(null)}>
                                            <X size={20} />
                                        </button>

                                        {project.images && project.images.length > 0 ? (
                                            <ImageCarousel images={project.images} altText={project.title} />
                                        ) : (
                                            <img src={project.image} alt={project.title} className="modal-image" />
                                        )}

                                        <div className="modal-details">
                                            <h2 className="heading-3" style={{ marginBottom: '1rem' }}>{project.title}</h2>
                                            
                                            <div className="project-tags" style={{ marginBottom: '1.5rem' }}>
                                                {project.tags && project.tags.map(tag => (
                                                    <span key={tag} className="tag font-mono">{tag}</span>
                                                ))}
                                            </div>

                                            <p className="modal-desc">{project.description}</p>

                                            <a href={project.link} className="btn btn-primary validation-btn" target="_blank" rel="noreferrer">
                                                View Live Project <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default Projects;
