import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    Facebook,
    Instagram,
    Linkedin,
    Github,
    Twitter,
    Youtube,
    Send,
    CheckCircle,
    AlertCircle,
    Mail
} from 'lucide-react';
import { ID } from 'appwrite';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_MESSAGES_COL_ID } from '../lib/appwrite';
import PageTransition from '../components/PageTransition';
import './Contact.css';

// Using a custom icon for TikTok since Lucide doesn't have it natively
const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

// Using a custom icon for WhatsApp 
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const socialLinks = [
    { name: 'Email', icon: <Mail size={22} />, url: 'mailto:udayangayasindu84@gmail.com', color: '#f637ec' },
    { name: 'LinkedIn', icon: <Linkedin size={22} />, url: 'https://www.linkedin.com/in/yasindu-udayanga', color: '#0077b5' },
    { name: 'GitHub', icon: <Github size={22} />, url: 'https://github.com/Y-Udayanga', color: '#00f0ff' },
    { name: 'X', icon: <Twitter size={22} />, url: 'https://x.com/Y_Udayanga', color: '#1da1f2' },
    { name: 'Instagram', icon: <Instagram size={22} />, url: 'https://www.instagram.com/', color: '#e1306c' },
    { name: 'Facebook', icon: <Facebook size={22} />, url: 'https://www.facebook.com/', color: '#1877f2' },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, url: '', color: '#25d366' },
    { name: 'TikTok', icon: <TikTokIcon />, url: '', color: '#f637ec' },
    { name: 'YouTube', icon: <Youtube size={22} />, url: '', color: '#ff0000' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 15 } }
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id.replace('contact-', '')]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) return;

        setStatus('submitting');

        try {
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_MESSAGES_COL_ID,
                ID.unique(),
                {
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                }
            );

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });

            // Reset success message after a few seconds
            setTimeout(() => setStatus('idle'), 5000);

        } catch (error: any) {
            console.error('Failed to submit message:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again later.');

            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <PageTransition>
            <div className="contact-container container">
                <div className="contact-header">
                    <motion.p
                        className="section-label font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        {'// REACH OUT'}
                    </motion.p>
                    <motion.h1
                        className="heading-1"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Let's <span className="text-gradient">Connect</span>
                    </motion.h1>
                    <motion.p
                        className="contact-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                    </motion.p>
                </div>

                <div className="contact-content">
                    <motion.div
                        className="social-hub"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="social-hub-border" />
                        <div className="social-hub-inner">
                            <h2 className="heading-3 mb-4">Find me online</h2>
                            <p className="mb-6 text-tertiary-color">Follow me on my social media platforms to stay updated on my latest projects and coding journey.</p>

                            <motion.div
                                className="social-grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.name}
                                        href={social.url}
                                        className="social-btn"
                                        variants={itemVariants}
                                        whileHover={{
                                            scale: 1.08,
                                            boxShadow: `0 0 25px ${social.color}30`,
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ '--hover-color': social.color } as React.CSSProperties}
                                        aria-label={social.name}
                                    >
                                        <span className="social-icon">
                                            {social.icon}
                                        </span>
                                        <span className="social-name font-mono">{social.name}</span>
                                    </motion.a>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="contact-form-wrapper"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="contact-form-border" />
                        <div className="contact-form-inner">
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <h2 className="heading-3 mb-6">Send me a message</h2>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="contact-name"
                                        className="form-input"
                                        placeholder="Your Name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    />
                                    <label htmlFor="contact-name" className="form-label font-mono">Name</label>
                                    <div className="form-glow" />
                                </div>

                                <div className="form-group">
                                    <input
                                        type="email"
                                        id="contact-email"
                                        className="form-input"
                                        placeholder="Your Email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    />
                                    <label htmlFor="contact-email" className="form-label font-mono">Email</label>
                                    <div className="form-glow" />
                                </div>

                                <div className="form-group">
                                    <textarea
                                        id="contact-message"
                                        className="form-input form-textarea"
                                        placeholder="Your Message"
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    ></textarea>
                                    <label htmlFor="contact-message" className="form-label font-mono">Message</label>
                                    <div className="form-glow" />
                                </div>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="success-message"
                                            style={{ color: '#25d366', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                                        >
                                            <CheckCircle size={18} />
                                            <span>Message sent successfully! I'll get back to you soon.</span>
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="error-message"
                                            style={{ color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                                        >
                                            <AlertCircle size={18} />
                                            <span>{errorMessage}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    className="btn btn-primary submit-btn"
                                    disabled={status === 'submitting'}
                                >
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                    {status !== 'submitting' && <Send size={16} />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Contact;
