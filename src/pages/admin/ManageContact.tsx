import React, { useState, useEffect } from 'react';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_CONTACT_COL_ID } from '../../lib/appwrite';
import { Loader2, Save, UserCog, Mail, Phone, MapPin, Github, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import './ManageContact.css';

interface ContactInfo {
    $id: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
}

export default function ManageContact() {
    const [contact, setContact] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        location: '',
        github: '',
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: ''
    });

    useEffect(() => {
        const fetchContact = async () => {
            try {
                setLoading(true);
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CONTACT_COL_ID
                );
                
                if (response.documents.length > 0) {
                    const data = response.documents[0] as unknown as ContactInfo;
                    setContact(data);
                    setFormData({
                        email: data.email || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        github: data.github || '',
                        linkedin: data.linkedin || '',
                        twitter: data.twitter || '',
                        instagram: data.instagram || '',
                        facebook: data.facebook || ''
                    });
                }
            } catch (err: any) {
                console.error('Error fetching contact info:', err);
                setError('Failed to load contact information.');
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (contact) {
                await databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CONTACT_COL_ID,
                    contact.$id,
                    formData
                );
            } else {
                // If it doesn't exist for some reason, create it
                const response = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CONTACT_COL_ID,
                    'unique()',
                    formData
                );
                setContact(response as unknown as ContactInfo);
            }
            setSuccessMessage('Contact details updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving contact info:', err);
            setError('Failed to save contact information.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="manage-contact-page">
            <div className="contact-header">
                <div className="contact-icon-box">
                    <UserCog size={32} />
                </div>
                <div>
                    <h2>Contact Information</h2>
                    <p>Update the contact details that will be displayed on your portfolio.</p>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}
            {successMessage && <div className="success-banner">{successMessage}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading contact details...</p>
                </div>
            ) : (
                <div className="contact-form-container">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-section-title">General Info</div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone Number / WhatsApp</label>
                                <div className="input-with-icon">
                                    <Phone className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <div className="input-with-icon">
                                <MapPin className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="form-section-title mt-4">Social Links</div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>GitHub URL</label>
                                <div className="input-with-icon">
                                    <Github className="input-icon" size={18} />
                                    <input
                                        type="url"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>LinkedIn URL</label>
                                <div className="input-with-icon">
                                    <Linkedin className="input-icon" size={18} />
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>X (Twitter) URL</label>
                                <div className="input-with-icon">
                                    <Twitter className="input-icon" size={18} />
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        placeholder="https://x.com/username"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Instagram URL</label>
                                <div className="input-with-icon">
                                    <Instagram className="input-icon" size={18} />
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        placeholder="https://instagram.com/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Facebook URL</label>
                                <div className="input-with-icon">
                                    <Facebook className="input-icon" size={18} />
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={formData.facebook}
                                        onChange={handleChange}
                                        placeholder="https://facebook.com/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-footer">
                            <button type="submit" className="btn-submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="btn-spinner" size={18} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
