import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ExternalLink, X, Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_CERTIFICATES_COL_ID } from '../lib/appwrite';
import './Certificate.css';

interface Certificate {
    $id: string;
    title: string;
    issuer: string;
    date: string;
    expiry: string;
    description: string;
    image: string;
    link: string;
}

const fallbackCertificatesData: Certificate[] = [
    {
        $id: '1',
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: 'Jan 2025',
        expiry: 'Jan 2028',
        description: 'Demonstrated advanced knowledge of the AWS Cloud setup, including compute, networking, storage, and database services.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80',
        link: '#'
    },
    {
        $id: '2',
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
    const [selectedCert, setSelectedCert] = useState<string | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CERTIFICATES_COL_ID
                );
                if (response.documents.length > 0) {
                    setCertificates(response.documents as unknown as Certificate[]);
                } else {
                    setCertificates(fallbackCertificatesData);
                }
            } catch (error) {
                console.error('Failed to load certificates from Appwrite, using fallback:', error);
                setCertificates(fallbackCertificatesData);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

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

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <Loader2 className="spinner" size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    <div className="cert-grid">
                        {certificates.map((cert, index) => (
                            <motion.div
                                key={cert.$id}
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
                                        onClick={() => setSelectedCert(cert.$id)}
                                    >
                                        More Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

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

                            {certificates.filter(c => c.$id === selectedCert).map(cert => (
                                <motion.div
                                    key={cert.$id}
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
