import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_PROJECTS_COL_ID, APPWRITE_CERTIFICATES_COL_ID, APPWRITE_MESSAGES_COL_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { FolderKanban, Award, Mail, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import './Dashboard.css';

interface Message {
    $id: string;
    name: string;
    email: string;
    message: string;
    $createdAt: string;
}

export default function Dashboard() {
    const [projectCount, setProjectCount] = useState<number | null>(null);
    const [certCount, setCertCount] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [msgCount, setMsgCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch Project Count
                const projectsResponse = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PROJECTS_COL_ID,
                    [Query.limit(1)]
                );
                setProjectCount(projectsResponse.total);

                // Fetch Certificate Count
                const certsResponse = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_CERTIFICATES_COL_ID,
                    [Query.limit(1)]
                );
                setCertCount(certsResponse.total);

                // Fetch Messages and Count
                const messagesResponse = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_MESSAGES_COL_ID,
                    [Query.orderDesc('$createdAt'), Query.limit(3)]
                );
                setMessages(messagesResponse.documents as unknown as Message[]);
                setMsgCount(messagesResponse.total);

            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to fetch dashboard data. Please verify your Appwrite project permissions.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading overview stats...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {error && (
                <div className="dashboard-error">
                    <p>{error}</p>
                </div>
            )}

            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper projects">
                        <FolderKanban size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Projects</span>
                        <h3 className="stat-value">{projectCount !== null ? projectCount : '-'}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper certificates">
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Certificates</span>
                        <h3 className="stat-value">{certCount !== null ? certCount : '-'}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper messages">
                        <Mail size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Messages Received</span>
                        <h3 className="stat-value">{msgCount !== null ? msgCount : '-'}</h3>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-sections">
                <div className="recent-messages-section">
                    <div className="section-header">
                        <h2>Recent Messages</h2>
                        <Link to="/admin/messages" className="view-all-link">
                            <span>View All</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="messages-list">
                        {messages.length === 0 ? (
                            <div className="empty-messages">
                                <Mail size={40} className="empty-icon" />
                                <p>No messages received yet.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.$id} className="dashboard-message-card">
                                    <div className="message-header">
                                        <div className="sender-details">
                                            <span className="sender-avatar">{msg.name[0].toUpperCase()}</span>
                                            <div>
                                                <h4>{msg.name}</h4>
                                                <span className="sender-email">{msg.email}</span>
                                            </div>
                                        </div>
                                        <div className="message-time">
                                            <Clock size={12} />
                                            <span>{formatDate(msg.$createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className="message-snippet">{msg.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/admin/projects" className="action-button">
                            <PlusCircle size={20} />
                            <span>Add New Project</span>
                        </Link>
                        <Link to="/admin/certificates" className="action-button">
                            <PlusCircle size={20} />
                            <span>Add New Certificate</span>
                        </Link>
                    </div>

                    <div className="admin-tip-box">
                        <h4>Pro Tip</h4>
                        <p>
                            Changes you make to projects and certificates will update your live portfolio site instantly. Keep your credentials and showcases up to date!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
