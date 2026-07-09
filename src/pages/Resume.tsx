import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { storage, APPWRITE_STORAGE_BUCKET_ID } from '../lib/appwrite';
import './Resume.css';

const Resume = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            // Optional: verify the file exists first (throws 404 if not)
            await storage.getFile(APPWRITE_STORAGE_BUCKET_ID, 'my-cv-pdf');
            
            // Generate the download URL
            const result = storage.getFileDownload(APPWRITE_STORAGE_BUCKET_ID, 'my-cv-pdf');
            
            const link = document.createElement('a');
            link.href = result.href; // result is a URL object
            link.download = 'Yasindu_Udayanga_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsDownloading(false);
            setIsDownloaded(true);
            setTimeout(() => setIsDownloaded(false), 3000);
        } catch (error) {
            console.error('Error downloading CV:', error);
            setIsDownloading(false);
            alert('CV is currently unavailable. The admin may need to upload it first.');
        }
    };

    return (
        <PageTransition>
            <div className="resume-container container">
                <div className="resume-content-wrapper">
                    <motion.div
                        className="resume-info"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="section-label font-mono">{'// DOWNLOAD'}</p>
                        <h1 className="heading-2">My <span className="text-gradient">Resume</span></h1>
                        <p className="resume-desc">
                            Get a comprehensive overview of my experience, education, and skills. My resume highlights my journey in software engineering and front-end development.
                        </p>

                        <motion.button
                            className={`download-btn ${isDownloading ? 'downloading' : ''} ${isDownloaded ? 'downloaded' : ''}`}
                            onClick={handleDownload}
                            whileHover={{ scale: isDownloading || isDownloaded ? 1 : 1.05 }}
                            whileTap={{ scale: isDownloading || isDownloaded ? 1 : 0.95 }}
                            disabled={isDownloading || isDownloaded}
                        >
                            <div className="btn-content">
                                {isDownloading ? (
                                    <motion.div
                                        className="spinner"
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    />
                                ) : isDownloaded ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="success-icon"
                                    >
                                        <CheckCircle size={22} />
                                    </motion.div>
                                ) : (
                                    <Download size={22} />
                                )}

                                <span className="btn-text font-mono">
                                    {isDownloading ? 'Downloading...' : isDownloaded ? 'Downloaded!' : 'Download Resume'}
                                </span>
                            </div>

                            {/* Progress bar effect inside the button */}
                            {isDownloading && (
                                <motion.div
                                    className="progress-bar"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5, ease: "linear" }}
                                />
                            )}
                        </motion.button>
                    </motion.div>

                    <motion.div
                        className="resume-preview"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="resume-preview-border" />
                        <div className="resume-preview-inner">
                            <div className="preview-header">
                                <div className="dots">
                                    <span className="dot-indicator red"></span>
                                    <span className="dot-indicator yellow"></span>
                                    <span className="dot-indicator green"></span>
                                </div>
                                <div className="preview-title font-mono">Yasindu_Udayanga_Resume.pdf</div>
                            </div>

                            <div className="preview-body">
                                <FileText size={70} className="preview-icon" />
                                <div className="preview-lines">
                                    <div className="line title-line"></div>
                                    <div className="line text-line"></div>
                                    <div className="line text-line short"></div>

                                    <div className="line subtitle-line"></div>
                                    <div className="line text-line"></div>
                                    <div className="line text-line"></div>
                                    <div className="line text-line short"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Resume;
