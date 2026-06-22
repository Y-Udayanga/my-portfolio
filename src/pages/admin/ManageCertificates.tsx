import React, { useState, useEffect } from 'react';
import { databases, storage, APPWRITE_DATABASE_ID, APPWRITE_CERTIFICATES_COL_ID, APPWRITE_STORAGE_BUCKET_ID } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { Plus, Edit2, Trash2, X, ExternalLink, Loader2, Award } from 'lucide-react';
import './ManageCertificates.css';

interface Certificate {
    $id: string;
    title: string;
    issuer: string;
    date: string;
    expiry: string;
    description: string;
    image: string;
    images?: string[];
    link: string;
}

export default function ManageCertificates() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formIssuer, setFormIssuer] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formExpiry, setFormExpiry] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formImage, setFormImage] = useState('');
    const [formImages, setFormImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [formLink, setFormLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_CERTIFICATES_COL_ID,
                [Query.orderDesc('$createdAt')]
            );
            setCertificates(response.documents as unknown as Certificate[]);
        } catch (err: any) {
            console.error('Error fetching certificates:', err);
            setError('Failed to retrieve certificates from Appwrite database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const openCreateModal = () => {
        setEditingCert(null);
        setFormTitle('');
        setFormIssuer('');
        setFormDate('');
        setFormExpiry('');
        setFormDesc('');
        setFormImage('');
        setFormImages([]);
        setImageFiles([]);
        setFormLink('');
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (cert: Certificate) => {
        setEditingCert(cert);
        setFormTitle(cert.title);
        setFormIssuer(cert.issuer);
        setFormDate(cert.date);
        setFormExpiry(cert.expiry || '');
        setFormDesc(cert.description);
        setFormImage(cert.image);
        setFormImages(cert.images || (cert.image ? [cert.image] : []));
        setImageFiles([]);
        setFormLink(cert.link);
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;
        try {
            await databases.deleteDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_CERTIFICATES_COL_ID,
                id
            );
            setCertificates(prev => prev.filter(c => c.$id !== id));
        } catch (err: any) {
            console.error('Delete failed:', err);
            alert('Failed to delete certificate. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        let finalImageUrl = formImage;
        const uploadedUrls: string[] = [];

        try {
            // Upload multiple files
            for (const file of imageFiles) {
                const uploadedFile = await storage.createFile(
                    APPWRITE_STORAGE_BUCKET_ID,
                    ID.unique(),
                    file
                );
                uploadedUrls.push(storage.getFileView(APPWRITE_STORAGE_BUCKET_ID, uploadedFile.$id).toString());
            }

            const finalImagesArray = [...formImages, ...uploadedUrls].filter(url => url.trim() !== '');
            if (!finalImageUrl && finalImagesArray.length > 0) {
                finalImageUrl = finalImagesArray[0];
            } else if (finalImagesArray.length === 0 && finalImageUrl) {
                finalImagesArray.push(finalImageUrl);
            }

            const certData = {
                title: formTitle,
                issuer: formIssuer,
                date: formDate,
                expiry: formExpiry || 'None',
                description: formDesc,
                image: finalImageUrl,
                images: finalImagesArray,
                link: formLink
            };

            if (editingCert) {
                // Update
                const response = await databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CERTIFICATES_COL_ID,
                    editingCert.$id,
                    certData
                );
                setCertificates(prev => prev.map(c => c.$id === editingCert.$id ? (response as unknown as Certificate) : c));
            } else {
                // Create
                const response = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CERTIFICATES_COL_ID,
                    ID.unique(),
                    certData
                );
                setCertificates(prev => [response as unknown as Certificate, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Save failed:', err);
            setFormError(err?.message || 'An error occurred while saving the certificate.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manage-certs-page">
            <div className="page-header-actions">
                <p className="page-subtitle">Add, edit, or remove certificates shown on your live portfolio.</p>
                <button onClick={openCreateModal} className="btn-add-item">
                    <Plus size={18} />
                    <span>Add Certificate</span>
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading certificates list...</p>
                </div>
            ) : certificates.length === 0 ? (
                <div className="empty-certs-state">
                    <p>No certificates found. Click the button above to add your first certificate!</p>
                </div>
            ) : (
                <div className="admin-certs-grid">
                    {certificates.map((cert) => (
                        <div key={cert.$id} className="admin-cert-card">
                            <div className="cert-card-header">
                                <div className="cert-icon-box">
                                    <Award size={24} />
                                </div>
                                <div className="cert-header-text">
                                    <h3>{cert.title}</h3>
                                    <p className="issuer-text">{cert.issuer}</p>
                                </div>
                            </div>
                            
                            <div className="cert-card-body">
                                <div className="cert-meta-info">
                                    <span><strong>Issued:</strong> {cert.date}</span>
                                    <span><strong>Expires:</strong> {cert.expiry}</span>
                                </div>
                                <p className="desc-text">{cert.description}</p>
                            </div>

                            <div className="cert-card-footer">
                                <a href={cert.link} target="_blank" rel="noreferrer" className="action-link">
                                    <ExternalLink size={16} />
                                    <span>Verify Link</span>
                                </a>
                                <div className="button-group">
                                    <button onClick={() => openEditModal(cert)} className="btn-edit" title="Edit certificate">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cert.$id)} className="btn-delete" title="Delete certificate">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>{editingCert ? 'Edit Certificate' : 'Create New Certificate'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                                <X size={20} />
                            </button>
                        </div>

                        {formError && <div className="form-error-banner">{formError}</div>}

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="cert-title">Certificate Title</label>
                                <input
                                    type="text"
                                    id="cert-title"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cert-issuer">Issuer Organization</label>
                                <input
                                    type="text"
                                    id="cert-issuer"
                                    value={formIssuer}
                                    onChange={(e) => setFormIssuer(e.target.value)}
                                    placeholder="e.g., Amazon Web Services"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="cert-date">Issue Date</label>
                                    <input
                                        type="text"
                                        id="cert-date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        placeholder="e.g., Jan 2025"
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cert-expiry">Expiry Date</label>
                                    <input
                                        type="text"
                                        id="cert-expiry"
                                        value={formExpiry}
                                        onChange={(e) => setFormExpiry(e.target.value)}
                                        placeholder="e.g., Jan 2028 or None"
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="cert-desc">Description</label>
                                <textarea
                                    id="cert-desc"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Explain what skills were verified by this certificate..."
                                    required
                                    disabled={submitting}
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cert-image-file">Upload Badge/Certificate Images</label>
                                <input
                                    type="file"
                                    id="cert-image-file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setImageFiles(Array.from(e.target.files));
                                            if (e.target.files.length > 0 && !formImage) {
                                                setFormImage('');
                                            }
                                        }
                                    }}
                                    disabled={submitting}
                                />
                                {imageFiles.length > 0 && (
                                    <div className="selected-files-list">
                                        <p className="input-hint">{imageFiles.length} file(s) selected.</p>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Existing / External Image URLs</label>
                                {formImages.map((url, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => {
                                                const newUrls = [...formImages];
                                                newUrls[idx] = e.target.value;
                                                setFormImages(newUrls);
                                                if (idx === 0) setFormImage(e.target.value);
                                            }}
                                            placeholder="https://images.unsplash.com/..."
                                            disabled={submitting}
                                        />
                                        <button
                                            type="button"
                                            className="btn-delete"
                                            style={{ padding: '8px', flexShrink: 0 }}
                                            onClick={() => {
                                                const newUrls = formImages.filter((_, i) => i !== idx);
                                                setFormImages(newUrls);
                                                if (idx === 0 && newUrls.length > 0) setFormImage(newUrls[0]);
                                                else if (idx === 0) setFormImage('');
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn-add-item"
                                    style={{ padding: '6px 12px', fontSize: '14px', width: 'fit-content' }}
                                    onClick={() => setFormImages([...formImages, ''])}
                                    disabled={submitting}
                                >
                                    <Plus size={14} /> Add URL
                                </button>
                            </div>

                            <div className="form-group">
                                <label htmlFor="cert-link">Validation/Credential URL</label>
                                <input
                                    type="url"
                                    id="cert-link"
                                    value={formLink}
                                    onChange={(e) => setFormLink(e.target.value)}
                                    placeholder="https://credly.com/... or verification page link"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-cancel"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="btn-spinner" size={16} />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>{editingCert ? 'Save Changes' : 'Create Certificate'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
