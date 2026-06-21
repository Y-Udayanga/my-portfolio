import React, { useState, useEffect } from 'react';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_MESSAGES_COL_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { Mail, Trash2, Clock, Inbox, ChevronRight, Copy, Check, Loader2 } from 'lucide-react';
import './ViewMessages.css';

interface Message {
    $id: string;
    name: string;
    email: string;
    message: string;
    $createdAt: string;
}

export default function ViewMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_MESSAGES_COL_ID,
                [Query.limit(100)]
            );
            const docs = response.documents as unknown as Message[];
            docs.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
            setMessages(docs);
            
            // Only auto-select first message on desktop
            if (docs.length > 0 && window.innerWidth > 768) {
                setSelectedMsgId(docs[0].$id);
            }
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError('Failed to retrieve contact messages from Appwrite database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        
        // Handle resize to show/hide panes correctly
        const handleResize = () => {
            if (window.innerWidth > 768 && !selectedMsgId && messages.length > 0) {
                setSelectedMsgId(messages[0].$id);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [messages, selectedMsgId]);

    const selectedMessage = messages.find(m => m.$id === selectedMsgId);

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await databases.deleteDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_MESSAGES_COL_ID,
                id
            );
            
            const remaining = messages.filter(m => m.$id !== id);
            setMessages(remaining);
            
            if (selectedMsgId === id) {
                setSelectedMsgId(remaining.length > 0 ? remaining[0].$id : null);
            }
        } catch (err: any) {
            console.error('Delete failed:', err);
            alert('Failed to delete message. Please try again.');
        }
    };

    const copyEmail = () => {
        if (!selectedMessage) return;
        navigator.clipboard.writeText(selectedMessage.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString: string, verbose = false) => {
        const date = new Date(dateString);
        if (verbose) {
            return date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="view-messages-page">
            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Loading inbox messages...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="empty-inbox-state">
                    <Inbox size={48} className="empty-icon" />
                    <h3>Your Inbox is Empty</h3>
                    <p>When visitors fill out your contact form, their submissions will appear here.</p>
                </div>
            ) : (
                <div className={`inbox-container ${selectedMsgId ? 'message-selected' : ''}`}>
                    <div className="inbox-sidebar">
                        <div className="inbox-sidebar-header">
                            <span>{messages.length} messages</span>
                        </div>
                        <div className="inbox-list">
                            {messages.map((msg) => (
                                <div
                                    key={msg.$id}
                                    className={`inbox-item ${selectedMsgId === msg.$id ? 'active' : ''}`}
                                    onClick={() => setSelectedMsgId(msg.$id)}
                                >
                                    <div className="inbox-item-header">
                                        <span className="inbox-sender-name">{msg.name}</span>
                                        <span className="inbox-item-time">{formatDate(msg.$createdAt)}</span>
                                    </div>
                                    <span className="inbox-sender-email">{msg.email}</span>
                                    <p className="inbox-item-snippet">{msg.message}</p>
                                    <ChevronRight size={16} className="arrow-indicator" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="inbox-view-pane">
                        {selectedMessage ? (
                            <div className="message-detail">
                                <div className="detail-header">
                                    <button 
                                        className="mobile-back-btn" 
                                        onClick={() => setSelectedMsgId(null)}
                                    >
                                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                        <span>Back</span>
                                    </button>
                                    <div className="sender-avatar-large">
                                        {selectedMessage.name[0].toUpperCase()}
                                    </div>
                                    <div className="header-meta">
                                        <h2>{selectedMessage.name}</h2>
                                        <div className="email-actions">
                                            <span className="email-address">{selectedMessage.email}</span>
                                            <button onClick={copyEmail} className="btn-copy" title="Copy email address">
                                                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                                            </button>
                                            <a href={`mailto:${selectedMessage.email}`} className="btn-reply">
                                                <span>Reply via Email</span>
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(selectedMessage.$id, e)}
                                        className="btn-delete-msg"
                                        title="Delete message"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="detail-time">
                                    <Clock size={14} />
                                    <span>Received on {formatDate(selectedMessage.$createdAt, true)}</span>
                                </div>

                                <div className="detail-body">
                                    <p>{selectedMessage.message}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="no-selection-state">
                                <Mail size={40} className="empty-icon" />
                                <p>Select a message to read its contents</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
