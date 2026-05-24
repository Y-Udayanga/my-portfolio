import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ExternalLink, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import './Certificate.css';

const certificatesData = [
    {
        id: 1,
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: 'Jan 2025',
        expiry: 'Jan 2028',
        description: 'Demonstrated advanced knowledge of the AWS Cloud setup, including compute, networking, storage, and database services.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80',
        link: '#'
    },
    {
        id: 2,
        title: 'Meta Front-End Developer',
        issuer: 'Coursera (Meta)',
        date: 'Nov 2024',
        expiry: 'None',
        description: 'Mastered React, advanced UI design, and modern front-end engineering principles directly from Meta engineers.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
        link: '#'
    }
];

const Certificate = () => {
    const [selectedCert, setSelectedCert] = useState<number | null>(null);

    return (
        <PageTransition>
            <div className="certificate-container container">
                <div className="section-header">
                    <motion.p
                        className="section-label font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {'// CREDENTIALS'}
                    </motion.p>
                    <motion.h1
                        className="heading-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        My <span className="text-gradient">Certificates</span>
                    </motion.h1>
                </div>

                <div className="cert-grid">
                    {certificatesData.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            className="cert-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <div className="cert-card-border" />
                            <div className="cert-card-inner">
                                <div className="cert-icon-wrapper">
                                    <Award size={28} />
                                </div>
                                <img src={cert.image} alt={cert.title} className="cert-image-preview" />
                                <h3 className="cert-title">{cert.title}</h3>
                                <p className="cert-issuer font-mono">{cert.issuer}</p>

                                <button
                                    className="btn btn-outline cert-btn"
                                    onClick={() => setSelectedCert(cert.id)}
                                >
                                    More Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Modal for Certificate Details */}
                <AnimatePresence>
                    {selectedCert && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="modal-backdrop" onClick={() => setSelectedCert(null)} />

                            {certificatesData.filter(c => c.id === selectedCert).map(cert => (
                                <motion.div
                                    key={cert.id}
                                    className="modal-content"
                                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                >
                                    <div className="modal-border" />
                                    <div className="modal-inner">
                                        <button className="close-modal-btn" onClick={() => setSelectedCert(null)}>
                                            <X size={20} />
                                        </button>

                                        <img src={cert.image} alt={cert.title} className="modal-image" />

                                        <div className="modal-details">
                                            <h2 className="heading-3">{cert.title}</h2>
                                            <p className="modal-issuer font-mono">{cert.issuer}</p>
                                            <p className="modal-desc">{cert.description}</p>

                                            <div className="modal-meta font-mono">
                                                <div className="meta-item">
                                                    <Calendar size={14} />
                                                    <span>Issued: {cert.date}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <Calendar size={14} />
                                                    <span>Expires: {cert.expiry}</span>
                                                </div>
                                            </div>

                                            <a href={cert.link} className="btn btn-primary validation-btn" target="_blank" rel="noreferrer">
                                                Validation Link <ExternalLink size={16} />
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

export default Certificate;
