import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Certificate from './pages/Certificate';
import Resume from './pages/Resume';
import Contact from './pages/Contact';

// Admin Pages & Layouts
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageProjects from './pages/admin/ManageProjects';
import ManageCertificates from './pages/admin/ManageCertificates';
import ViewMessages from './pages/admin/ViewMessages';
import ManageContact from './pages/admin/ManageContact';

import './App.css';

import { client } from './lib/appwrite';

// Separate routing component to switch layouts based on URL pathname
const AppContent = ({ loading, setLoading }: { loading: boolean; setLoading: (loading: boolean) => void }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="certificates" element={<ManageCertificates />} />
          <Route path="messages" element={<ViewMessages />} />
          <Route path="contact" element={<ManageContact />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      {loading ? (
        <LoadingScreen onLoadingComplete={() => setLoading(false)} />
      ) : (
        <div className="app-container">
          {/* Dot-grid matrix background */}
          <div className="matrix-bg"></div>

          {/* Floating holographic orbs */}
          <div className="bg-orb-1"></div>
          <div className="bg-orb-2"></div>
          <div className="bg-orb-3"></div>

          {/* Subtle scan-line across entire viewport */}
          <div className="app-scan-line"></div>

          <Navbar />

          <main className="main-content">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/certificate" element={<Certificate />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ping Appwrite server to verify setup
    client.ping().catch(console.error);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent loading={loading} setLoading={setLoading} />
      </AuthProvider>
    </Router>
  );
}

export default App;
