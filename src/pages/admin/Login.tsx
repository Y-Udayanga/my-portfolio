import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import './Login.css';

export default function Login() {
    const { user, login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            navigate('/admin');
        }
    }, [user, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/admin');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err?.message || 'Invalid email or password. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-overlay"></div>
            <div className="login-container">
                <a href="/" className="back-to-home">
                    <ArrowLeft size={16} />
                    <span>Back to Portfolio</span>
                </a>

                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo-glow"></div>
                        <h1>System Admin</h1>
                        <p>Authenticate to access the dashboard portal</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertTriangle size={18} className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`login-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="spinner"></span>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
