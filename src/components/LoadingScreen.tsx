import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const bootLines = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING QUANTUM PROCESSORS...',
  '> ESTABLISHING SECURE LINK...',
  '> HOLOGRAPHIC DISPLAY ONLINE...',
  '> WELCOME PROTOCOL ACTIVATED',
];

const welcomeMessage =
  "Welcome to my digital space. I'm Yasindu Udayanga — a Software Engineer crafting the future, one line of code at a time.";

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [phase, setPhase] = useState<'boot' | 'identity' | 'welcome' | 'enter'>('boot');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typedWelcome, setTypedWelcome] = useState('');
  const [hasSpoken, setHasSpoken] = useState(false);

  // Phase 1: Boot sequence — reveal lines one by one
  useEffect(() => {
    if (phase !== 'boot') return;

    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        const next = prev + 1;
        if (next >= bootLines.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('identity'), 400);
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Identity reveal → auto-advance to welcome
  useEffect(() => {
    if (phase !== 'identity') return;
    const timer = setTimeout(() => setPhase('welcome'), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Phase 3: Typewriter welcome text
  useEffect(() => {
    if (phase !== 'welcome') return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedWelcome(welcomeMessage.slice(0, i));
      if (i >= welcomeMessage.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('enter'), 600);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase]);

  // Speak the welcome message
  const speakWelcome = useCallback(() => {
    if (hasSpoken) return;
    setHasSpoken(true);

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Try to pick a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('samantha'))
      );
      if (preferred) {
        utterance.voice = preferred;
      } else {
        const english = voices.find((v) => v.lang.startsWith('en'));
        if (english) utterance.voice = english;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, [hasSpoken]);

  // Pre-load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleEnter = () => {
    speakWelcome();
    // Small delay for voice to start, then transition
    setTimeout(() => {
      onLoadingComplete();
    }, 500);
  };

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#050a18',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        padding: '2rem',
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'radial-gradient(circle, rgba(0, 240, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.5,
        }}
      />

      {/* Horizontal scan line */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
          opacity: 0.5,
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', width: '100%' }}>
        {/* Phase 1: Boot Sequence */}
        <AnimatePresence>
          {(phase === 'boot' || phase === 'identity' || phase === 'welcome' || phase === 'enter') && (
            <motion.div
              style={{ marginBottom: '2rem' }}
              initial={{ opacity: 1 }}
              animate={{ opacity: phase === 'boot' ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
            >
              {bootLines.slice(0, visibleLines).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                    color:
                      i === visibleLines - 1 && phase === 'boot'
                        ? '#00f0ff'
                        : 'rgba(0, 240, 255, 0.4)',
                    marginBottom: '0.4rem',
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: Identity Reveal */}
        <AnimatePresence>
          {(phase === 'identity' || phase === 'welcome' || phase === 'enter') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
              <motion.h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  background:
                    'linear-gradient(135deg, #00f0ff, #a855f7, #f637ec)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.75rem',
                }}
                animate={{
                  textShadow: [
                    '0 0 20px rgba(0,240,255,0)',
                    '0 0 20px rgba(0,240,255,0.3)',
                    '0 0 20px rgba(0,240,255,0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                YASINDU UDAYANGA
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                  color: 'rgba(0, 240, 255, 0.6)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Software Engineer · 2030
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: Welcome Message Typewriter */}
        <AnimatePresence>
          {(phase === 'welcome' || phase === 'enter') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                textAlign: 'center',
                marginBottom: '2.5rem',
                padding: '1.5rem 2rem',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                borderRadius: '1rem',
                background: 'rgba(0, 240, 255, 0.03)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  color: '#94a3c0',
                  lineHeight: 1.8,
                  minHeight: '3.6rem',
                }}
              >
                {typedWelcome}
                {phase === 'welcome' && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '3px',
                      height: '1em',
                      backgroundColor: '#00f0ff',
                      marginLeft: '4px',
                      verticalAlign: 'text-bottom',
                      animation: 'blink-cursor 1s step-end infinite',
                    }}
                  />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: Enter Button */}
        <AnimatePresence>
          {phase === 'enter' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '1rem 3rem',
                  border: '1px solid #00f0ff',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(168,85,247,0.1))',
                  color: '#00f0ff',
                  cursor: 'pointer',
                  boxShadow:
                    '0 0 20px rgba(0,240,255,0.2), 0 0 60px rgba(0,240,255,0.08), inset 0 0 20px rgba(0,240,255,0.05)',
                  transition: 'all 0.3s ease',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,240,255,0.2), 0 0 60px rgba(0,240,255,0.08)',
                    '0 0 30px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.15)',
                    '0 0 20px rgba(0,240,255,0.2), 0 0 60px rgba(0,240,255,0.08)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ▶ ENTER PORTFOLIO
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.3))',
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            color: 'rgba(0, 240, 255, 0.3)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          SYS.V2030
        </span>
        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(0,240,255,0.3), transparent)',
          }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
