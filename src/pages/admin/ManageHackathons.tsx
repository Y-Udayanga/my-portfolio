import { useEffect, useState, type FormEvent } from 'react';
import { ID, Query } from 'appwrite';
import { Edit2, ExternalLink, Loader2, Plus, Trash2, Trophy, X } from 'lucide-react';
import {
    APPWRITE_DATABASE_ID,
    APPWRITE_HACKATHONS_COL_ID,
    APPWRITE_STORAGE_BUCKET_ID,
    databases,
    storage,
} from '../../lib/appwrite';
import type { HackathonPost } from '../Hackathon';
import './ManageCertificates.css';
import './ManageProjects.css';
import './ManageHackathons.css';

const emptyForm = {
    title: '',
    event: '',
    role: '',
    date: '',
    location: '',
    team: '',
    result: '',
    technologies: '',
    description: '',
    link: '',
    image: '',
};

export default function ManageHackathons() {
    const [posts, setPosts] = useState<HackathonPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<HackathonPost | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_HACKATHONS_COL_ID,
                [Query.orderDesc('$createdAt')]
            );
            setPosts(response.documents as unknown as HackathonPost[]);
            setError('');
        } catch (loadError) {
            console.error('Error fetching hackathons:', loadError);
            setError('Failed to retrieve hackathon posts from Appwrite.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setImageFile(null);
        setFormError('');
        setIsModalOpen(true);
    };

    const openEdit = (post: HackathonPost) => {
        setEditing(post);
        setForm({
            title: post.title || '',
            event: post.event || '',
            role: post.role || '',
            date: post.date || '',
            location: post.location || '',
            team: post.team || '',
            result: post.result || '',
            technologies: post.technologies || '',
            description: post.description || '',
            link: post.link || '',
            image: post.image || '',
        });
        setImageFile(null);
        setFormError('');
        setIsModalOpen(true);
    };

    const updateField = (key: keyof typeof emptyForm, value: string) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this hackathon post?')) return;
        try {
            await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_HACKATHONS_COL_ID, id);
            setPosts((current) => current.filter((post) => post.$id !== id));
        } catch (deleteError) {
            console.error('Delete failed:', deleteError);
            alert('Failed to delete this hackathon post.');
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setFormError('');

        try {
            let image = form.image;
            if (imageFile) {
                const uploaded = await storage.createFile(APPWRITE_STORAGE_BUCKET_ID, ID.unique(), imageFile);
                image = storage.getFileView(APPWRITE_STORAGE_BUCKET_ID, uploaded.$id).toString();
            }

            const data = { ...form, image };
            if (editing) {
                const response = await databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_HACKATHONS_COL_ID,
                    editing.$id,
                    data
                );
                setPosts((current) => current.map((post) => post.$id === editing.$id ? response as unknown as HackathonPost : post));
            } else {
                const response = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_HACKATHONS_COL_ID,
                    ID.unique(),
                    data
                );
                setPosts((current) => [response as unknown as HackathonPost, ...current]);
            }
            setIsModalOpen(false);
        } catch (saveError) {
            console.error('Save failed:', saveError);
            setFormError(saveError instanceof Error ? saveError.message : 'Could not save this hackathon post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manage-certs-page">
            <div className="page-header-actions">
                <p className="page-subtitle">Post the hackathons you joined. Each one appears on the public Hackathon page.</p>
                <button onClick={openCreate} className="btn-add-item">
                    <Plus size={18} />
                    <span>Post Hackathon</span>
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading hackathon posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-certs-state">
                    <p>No hackathon posts yet. Use the button above to publish your first one.</p>
                </div>
            ) : (
                <div className="admin-certs-grid">
                    {posts.map((post) => (
                        <div key={post.$id} className="admin-cert-card">
                            <div className="cert-card-header">
                                <div className="cert-icon-box">
                                    <Trophy size={24} />
                                </div>
                                <div className="cert-header-text">
                                    <h3>{post.title}</h3>
                                    <p className="issuer-text">{post.event}</p>
                                </div>
                            </div>
                            <div className="cert-card-body">
                                <div className="cert-meta-info">
                                    {post.date && <span><strong>Date:</strong> {post.date}</span>}
                                    {post.result && <span><strong>Result:</strong> {post.result}</span>}
                                </div>
                                <p className="desc-text">{post.description}</p>
                            </div>
                            <div className="cert-card-footer">
                                {post.link ? (
                                    <a href={post.link} target="_blank" rel="noreferrer" className="action-link">
                                        <ExternalLink size={16} />
                                        <span>Project link</span>
                                    </a>
                                ) : <span />}
                                <div className="button-group">
                                    <button onClick={() => openEdit(post)} className="btn-edit" title="Edit post">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(post.$id)} className="btn-delete" title="Delete post">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container hackathon-modal">
                        <div className="modal-header">
                            <h2>{editing ? 'Edit hackathon' : 'Post a hackathon'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal" type="button">
                                <X size={20} />
                            </button>
                        </div>
                        {formError && <div className="form-error-banner">{formError}</div>}
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="hack-title">Title</label>
                                <input id="hack-title" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="What you built, or the weekend's headline" required disabled={submitting} />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="hack-event">Hackathon</label>
                                    <input id="hack-event" value={form.event} onChange={(e) => updateField('event', e.target.value)} placeholder="Event name" required disabled={submitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="hack-role">Your role</label>
                                    <input id="hack-role" value={form.role} onChange={(e) => updateField('role', e.target.value)} placeholder="Team lead, frontend, FinOps" disabled={submitting} />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="hack-date">Date</label>
                                    <input id="hack-date" value={form.date} onChange={(e) => updateField('date', e.target.value)} placeholder="Mar 2026" disabled={submitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="hack-location">Location</label>
                                    <input id="hack-location" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Colombo or online" disabled={submitting} />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="hack-team">Team</label>
                                    <input id="hack-team" value={form.team} onChange={(e) => updateField('team', e.target.value)} placeholder="Team name or teammates" disabled={submitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="hack-result">Result</label>
                                    <input id="hack-result" value={form.result} onChange={(e) => updateField('result', e.target.value)} placeholder="Finalist, 2nd place, participant" disabled={submitting} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="hack-tech">Technologies</label>
                                <input id="hack-tech" value={form.technologies} onChange={(e) => updateField('technologies', e.target.value)} placeholder="React, Appwrite, Python" disabled={submitting} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hack-story">What you did</label>
                                <textarea id="hack-story" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="The problem, your contribution, and what the team shipped." required rows={6} disabled={submitting} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hack-image">Cover image</label>
                                <input id="hack-image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} disabled={submitting} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hack-image-url">Or image URL</label>
                                <input id="hack-image-url" type="url" value={form.image} onChange={(e) => updateField('image', e.target.value)} placeholder="https://" disabled={submitting} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hack-link">Project link</label>
                                <input id="hack-link" type="url" value={form.link} onChange={(e) => updateField('link', e.target.value)} placeholder="https://devpost.com/..." disabled={submitting} />
                            </div>
                            <div className="form-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel" disabled={submitting}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? <><Loader2 className="btn-spinner" size={16} /><span>Saving...</span></> : <span>{editing ? 'Save changes' : 'Publish'}</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
