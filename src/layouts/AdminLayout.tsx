import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Award, Mail, LogOut, ExternalLink } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/projects', label: 'Projects', icon: FolderKanban, exact: false },
        { path: '/admin/certificates', label: 'Certificates', icon: Award, exact: false },
        { path: '/admin/messages', label: 'Messages', icon: Mail, exact: false },
    ];

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path) && location.pathname !== '/admin/login';
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <span className="logo-glow"></span>
                        <h2>Admin Portal</h2>
                    </div>
                    {user && (
                        <div className="admin-user-info">
                            <span className="user-avatar">{user.email[0].toUpperCase()}</span>
                            <span className="user-email" title={user.email}>{user.email}</span>
                        </div>
                    )}
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${active ? 'active' : ''}`}
                            >
                                <Icon size={20} className="nav-icon" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link to="/" className="admin-nav-item view-site">
                        <ExternalLink size={20} className="nav-icon" />
                        <span>View Portfolio</span>
                    </Link>
                    <button onClick={handleLogout} className="admin-nav-item logout-btn">
                        <LogOut size={20} className="nav-icon" />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-content-wrapper">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">
                        {location.pathname === '/admin' && 'Dashboard Overview'}
                        {location.pathname.startsWith('/admin/projects') && 'Manage Projects'}
                        {location.pathname.startsWith('/admin/certificates') && 'Manage Certificates'}
                        {location.pathname.startsWith('/admin/messages') && 'Inbox Messages'}
                    </h1>
                    <div className="admin-system-status">
                        <span className="status-dot online"></span>
                        <span className="status-text">Appwrite connected</span>
                    </div>
                </div>
                <div className="admin-main-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
