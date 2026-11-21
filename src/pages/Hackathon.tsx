import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink, Loader2, MapPin, Trophy, Users } from 'lucide-react';
import { Query } from 'appwrite';
import PageTransition from '../components/PageTransition';
import { APPWRITE_DATABASE_ID, APPWRITE_HACKATHONS_COL_ID, databases } from '../lib/appwrite';
import './Hackathon.css';

export interface HackathonPost {
    $id: string;
    title: string;
    event: string;
    role: string;
    date: string;
    location: string;
    team: string;
    result: string;
    technologies: string;
    description: string;
    link: string;
    image: string;
}

const techList = (value: string) =>
    value.split(',').map((item) => item.trim()).filter(Boolean);

const useHackathons = () => {
    const [posts, setPosts] = useState<HackathonPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_HACKATHONS_COL_ID,
                    [Query.orderDesc('$createdAt'), Query.limit(50)]
                );
                setPosts(response.documents as unknown as HackathonPost[]);
            } catch (loadError) {
                console.error('Failed to load hackathons:', loadError);
                setError('Hackathon stories could not be loaded right now.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return { posts, loading, error };
};

export const HackathonList = () => {
    const { posts, loading, error } = useHackathons();

    return (
        <PageTransition>
            <div className="hackathon-container container">
                <div className="hackathon-header">
                    <motion.p className="section-label font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {'// BUILD WEEKENDS'}
                    </motion.p>
                    <motion.h1 className="heading-2" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                        Hackathon <span className="text-gradient">Participation</span>
                    </motion.h1>
                    <motion.p className="hackathon-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        Events I joined, the teams I built with, and what we shipped.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="hackathon-status">
                        <Loader2 className="spinner" size={32} />
                    </div>
                ) : error ? (
                    <p className="hackathon-status-text">{error}</p>
                ) : posts.length === 0 ? (
                    <div className="hackathon-empty">
                        <Trophy size={36} />
                        <h2>No hackathon posts yet</h2>
                        <p>Stories you publish from the admin portal will appear on this page.</p>
                    </div>
                ) : (
                    <div className="hackathon-list">
                        {posts.map((post, index) => (
                            <motion.article
                                key={post.$id}
                                className="hackathon-card"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <div className="hackathon-card-border" />
                                <Link to={`/hackathon/${post.$id}`} className="hackathon-card-inner">
                                    {post.image && (
                                        <img src={post.image} alt="" className="hackathon-card-image" />
                                    )}
                                    <div className="hackathon-card-copy">
                                        <div className="hackathon-kicker">
                                            {post.date && <span>{post.date}</span>}
                                            {post.result && <span className="hackathon-result">{post.result}</span>}
                                        </div>
                                        <h2>{post.title}</h2>
                                        <p className="hackathon-event">{post.event}</p>
                                        <p className="hackathon-excerpt">
                                            {post.description.length > 180 ? `${post.description.slice(0, 180)}…` : post.description}
                                        </p>
                                        <span className="hackathon-read">Read the story</span>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export const HackathonDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState<HackathonPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const document = await databases.getDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_HACKATHONS_COL_ID,
                    id
                );
                setPost(document as unknown as HackathonPost);
            } catch (loadError) {
                console.error('Failed to load hackathon:', loadError);
                setMissing(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const technologies = post ? techList(post.technologies || '') : [];

    return (
        <PageTransition>
            <article className="hackathon-container hackathon-detail container">
                <Link to="/hackathon" className="hackathon-back">
                    <ArrowLeft size={16} />
                    All hackathons
                </Link>

                {loading ? (
                    <div className="hackathon-status">
                        <Loader2 className="spinner" size={32} />
                    </div>
                ) : missing || !post ? (
                    <div className="hackathon-empty">
                        <h2>This story is not available</h2>
                        <p>It may have been removed.</p>
                    </div>
                ) : (
                    <>
                        <p className="section-label font-mono">{post.event}</p>
                        <h1 className="heading-2">{post.title}</h1>
                        <div className="hackathon-meta">
                            {post.role && <span>{post.role}</span>}
                            {post.date && <span><Calendar size={14} /> {post.date}</span>}
                            {post.location && <span><MapPin size={14} /> {post.location}</span>}
                            {post.team && <span><Users size={14} /> {post.team}</span>}
                            {post.result && <span className="hackathon-result">{post.result}</span>}
                        </div>
                        {post.image && <img src={post.image} alt="" className="hackathon-hero-image" />}
                        <div className="hackathon-story">{post.description}</div>
                        {technologies.length > 0 && (
                            <div className="hackathon-tags">
                                {technologies.map((tech) => <span key={tech}>{tech}</span>)}
                            </div>
                        )}
                        {post.link && (
                            <a className="hackathon-link" href={post.link} target="_blank" rel="noreferrer">
                                <ExternalLink size={16} />
                                View project
                            </a>
                        )}
                    </>
                )}
            </article>
        </PageTransition>
    );
};
