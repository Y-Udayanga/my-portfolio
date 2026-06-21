import React, { useState, useEffect } from 'react';
import { databases, storage, APPWRITE_DATABASE_ID, APPWRITE_PROJECTS_COL_ID, APPWRITE_STORAGE_BUCKET_ID } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { Plus, Edit2, Trash2, X, ExternalLink, Loader2 } from 'lucide-react';
import './ManageProjects.css';

interface Project {
    $id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    link: string;
}

export default function ManageProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formImage, setFormImage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formLink, setFormLink] = useState('');
    const [formTags, setFormTags] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_PROJECTS_COL_ID,
                [Query.orderDesc('$createdAt')]
            );
            setProjects(response.documents as unknown as Project[]);
        } catch (err: any) {
            console.error('Error fetching projects:', err);
            setError('Failed to retrieve projects from Appwrite database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openCreateModal = () => {
        setEditingProject(null);
        setFormTitle('');
        setFormDesc('');
        setFormImage('');
        setFormLink('');
        setFormTags('');
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormTitle(project.title);
        setFormDesc(project.description);
        setFormImage(project.image);
        setImageFile(null);
        setFormLink(project.link);
        setFormTags(project.tags ? project.tags.join(', ') : '');
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await databases.deleteDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_PROJECTS_COL_ID,
                id
            );
            setProjects(prev => prev.filter(p => p.$id !== id));
        } catch (err: any) {
            console.error('Delete failed:', err);
            alert('Failed to delete project. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        const tagsArray = formTags
            ? formTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        let finalImageUrl = formImage;

        try {
            if (imageFile) {
                const uploadedFile = await storage.createFile(
                    APPWRITE_STORAGE_BUCKET_ID,
                    ID.unique(),
                    imageFile
                );
                finalImageUrl = storage.getFileView(APPWRITE_STORAGE_BUCKET_ID, uploadedFile.$id).toString();
            }

            const projectData = {
                title: formTitle,
                description: formDesc,
                image: finalImageUrl,
                link: formLink,
                tags: tagsArray
            };

            if (editingProject) {
                // Update
                const response = await databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PROJECTS_COL_ID,
                    editingProject.$id,
                    projectData
                );
                setProjects(prev => prev.map(p => p.$id === editingProject.$id ? (response as unknown as Project) : p));
            } else {
                // Create
                const response = await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PROJECTS_COL_ID,
                    ID.unique(),
                    projectData
                );
                setProjects(prev => [response as unknown as Project, ...prev]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Save failed:', err);
            setFormError(err?.message || 'An error occurred while saving the project.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manage-projects-page">
            <div className="page-header-actions">
                <p className="page-subtitle">Add, edit, or remove projects shown on your live portfolio.</p>
                <button onClick={openCreateModal} className="btn-add-item">
                    <Plus size={18} />
                    <span>Add Project</span>
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading projects list...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-projects-state">
                    <p>No projects found. Click the button above to add your first project!</p>
                </div>
            ) : (
                <div className="admin-projects-grid">
                    {projects.map((project) => (
                        <div key={project.$id} className="admin-project-card">
                            <div className="project-card-image">
                                <img src={project.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80'} alt={project.title} />
                            </div>
                            <div className="project-card-details">
                                <h3>{project.title}</h3>
                                <p className="desc-text">{project.description}</p>
                                <div className="tags-container">
                                    {project.tags && project.tags.map(tag => (
                                        <span key={tag} className="project-tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="card-actions">
                                    <a href={project.link} target="_blank" rel="noreferrer" className="action-link">
                                        <ExternalLink size={16} />
                                        <span>Link</span>
                                    </a>
                                    <div className="button-group">
                                        <button onClick={() => openEditModal(project)} className="btn-edit" title="Edit project">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(project.$id)} className="btn-delete" title="Delete project">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                            <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                                <X size={20} />
                            </button>
                        </div>

                        {formError && <div className="form-error-banner">{formError}</div>}

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="proj-title">Project Title</label>
                                <input
                                    type="text"
                                    id="proj-title"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g., E-Commerce Platform"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="proj-desc">Description</label>
                                <textarea
                                    id="proj-desc"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Brief summary of the project, features, stack..."
                                    required
                                    disabled={submitting}
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="proj-image-file">Upload Image</label>
                                <input
                                    type="file"
                                    id="proj-image-file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setImageFile(e.target.files[0]);
                                            setFormImage('');
                                        }
                                    }}
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="proj-image">Or Image URL</label>
                                <input
                                    type="url"
                                    id="proj-image"
                                    value={formImage}
                                    onChange={(e) => {
                                        setFormImage(e.target.value);
                                        setImageFile(null);
                                    }}
                                    placeholder="https://images.unsplash.com/..."
                                    required={!imageFile && !formImage}
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="proj-link">Live Project URL</label>
                                <input
                                    type="url"
                                    id="proj-link"
                                    value={formLink}
                                    onChange={(e) => setFormLink(e.target.value)}
                                    placeholder="https://github.com/username/project or live URL"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="proj-tags">Tags (Comma-separated)</label>
                                <input
                                    type="text"
                                    id="proj-tags"
                                    value={formTags}
                                    onChange={(e) => setFormTags(e.target.value)}
                                    placeholder="React, Node.js, Express, MongoDB"
                                    disabled={submitting}
                                />
                                <span className="input-hint">Separate multiple technologies with commas.</span>
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
                                        <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
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
