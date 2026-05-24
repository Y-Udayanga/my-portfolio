import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Certificate from './pages/Certificate';
import Resume from './pages/Resume';
import Contact from './pages/Contact';

import './App.css';

// Component to handle exit animations on route change
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
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
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  // Fallback timeout just in case animation doesn't complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
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
            <AnimatedRoutes />
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
