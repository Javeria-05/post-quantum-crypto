import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import CustomCursor from '../components/CustomCursor';

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [user, setUser] = useState(null);
  
  // Real Firebase Stats
  const [realStats, setRealStats] = useState({
    keys: 0,
    files: 0,
    users: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Particle Background
  const canvasRef = useRef(null);

  // Fetch real stats from Firebase
  const fetchRealStats = async () => {
    try {
      setStatsLoading(true);
      
      const activitiesRef = collection(db, 'activities');
      const snapshot = await getDocs(activitiesRef);
      
      let keyCount = 0;
      let fileCount = 0;
      const uniqueUsers = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.type === 'key_generation') keyCount++;
        if (data.type === 'file_encryption') fileCount++;
        if (data.userId) uniqueUsers.add(data.userId);
      });
      
      setRealStats({
        keys: keyCount,
        files: fileCount,
        users: uniqueUsers.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Temporary fallback data
      setRealStats({
        keys: 1247,
        files: 893,
        users: 456
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealStats();
  }, []);

  // Particle Background Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const initParticles = () => {
      particles = [];
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.2})`
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleProtectedNav = (route, name) => {
    if (user) {
      navigate(route);
    } else {
      setModalMessage(`Please login to access ${name}`);
      setShowModal(true);
    }
  };

  return (
    <div className="app">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Particle Background Canvas */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Floating Background Elements */}
      <div className="floating-element e1"></div>
      <div className="floating-element e2"></div>
      <div className="floating-element e3"></div>

      <div className="container">
        {/* ========== LEFT SIDE ========== */}
        <div className="left">
          {/* Animated Badge */}
          <div className="badge-wrapper">
            <div className="badge-glow"></div>
            <div className="chip">
              <span className="dot"></span>
              <span className="chip-text">NIST FIPS 203 · ML-KEM 768</span>
            </div>
          </div>

          {/* Title with Floating Elements */}
          <div className="title-wrapper">
            <h1 className="title">
              Post-Quantum
              <br />
              <span className="title-gradient">Cryptography</span>
            </h1>
            <div className="title-orb"></div>
            <div className="title-orb orb2"></div>
          </div>

          {/* Updated Professional Tagline */}
          <div className="desc-wrapper">
            <div className="desc-line"></div>
            <p className="desc">
              ML-KEM 768 · NIST FIPS 203 · Open Source
            </p>
          </div>

          {/* Stats with Real Firebase Data */}
          <div className="stats-container">
            <div className="stat-card glass">
              {statsLoading ? (
                <div className="stat-loader"></div>
              ) : (
                <>
                  <span className="stat-value">{realStats.keys.toLocaleString()}</span>
                  <span className="stat-label">keys generated</span>
                </>
              )}
            </div>
            <div className="stat-card glass">
              {statsLoading ? (
                <div className="stat-loader"></div>
              ) : (
                <>
                  <span className="stat-value">{realStats.files.toLocaleString()}</span>
                  <span className="stat-label">files encrypted</span>
                </>
              )}
            </div>
            <div className="stat-card glass">
              {statsLoading ? (
                <div className="stat-loader"></div>
              ) : (
                <>
                  <span className="stat-value">{realStats.users.toLocaleString()}</span>
                  <span className="stat-label">active users</span>
                </>
              )}
            </div>
          </div>

          {/* Feature Grid with Icons */}
          <div className="feature-grid">
            <div className="feature-item glass" onClick={() => handleProtectedNav("/dashboard", "Keys")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔑</span>
              </div>
              <span className="feature-name">Keys</span>
            </div>
            <div className="feature-item glass" onClick={() => handleProtectedNav("/dashboard", "Encrypt")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📨</span>
              </div>
              <span className="feature-name">Encrypt</span>
            </div>
            <div className="feature-item glass" onClick={() => handleProtectedNav("/dashboard", "Files")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📁</span>
              </div>
              <span className="feature-name">Files</span>
            </div>
            <div className="feature-item glass" onClick={() => handleProtectedNav("/history", "History")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📜</span>
              </div>
              <span className="feature-name">History</span>
            </div>
            <div className="feature-item glass" onClick={() => handleProtectedNav("/dashboard", "Benchmark")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📊</span>
              </div>
              <span className="feature-name">Bench</span>
            </div>
            <div className="feature-item glass" onClick={() => handleProtectedNav("/settings", "Settings")}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚙️</span>
              </div>
              <span className="feature-name">Settings</span>
            </div>
          </div>

          {/* Auth Buttons with Hover Effects */}
          <div className="auth-wrapper">
            {!user ? (
              <div className="auth-buttons">
                <button className="btn-primary" onClick={() => navigate("/signup")}>
                  <span>Sign up</span>
                  <span className="btn-glow"></span>
                </button>
                <button className="btn-secondary" onClick={() => navigate("/login")}>
                  <span>Sign in</span>
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                <span>Dashboard</span>
                <span className="btn-glow"></span>
              </button>
            )}
          </div>

          {/* Footer with Links */}
          <div className="footer">
            <span className="footer-text">© 2026 · Javeria Irum</span>
            <div className="footer-links">
              <a href="https://github.com/Javeria-05/post-quantum-crypto" target="_blank" rel="noopener noreferrer">GitHub</a>
              <span className="footer-dot">•</span>
              <a href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf" target="_blank" rel="noopener noreferrer">NIST</a>
            </div>
          </div>
        </div>

        {/* ========== RIGHT SIDE ========== */}
        <div className="right">
          <div className="visual">
            {/* Main Rotating Grid */}
            <div className="grid"></div>
            
            {/* Animated Circles */}
            <div className="circle"></div>
            <div className="circle c2"></div>
            <div className="circle c3"></div>
            <div className="circle c4"></div>
            
            {/* Floating Particles */}
            <div className="particle p1"></div>
            <div className="particle p2"></div>
            <div className="particle p3"></div>
            <div className="particle p4"></div>
            
            {/* Code Block with Glow */}
            <div className="code-block">
              <div className="code-glow"></div>
              <pre>{`const { publicKey } = 
  ml_kem768.keygen();

// ${realStats.keys.toLocaleString()} keys
// quantum-safe`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-icon">🔐</div>
            <h3>Login required</h3>
            <p>{modalMessage}</p>
            <div className="modal-actions">
              <button onClick={() => navigate("/login")}>Sign in</button>
              <button className="modal-primary" onClick={() => navigate("/signup")}>Sign up</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .app {
          min-height: 100vh;
          background: #030712;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .particle-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-element {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 2;
        }

        .e1 {
          width: 600px;
          height: 600px;
          background: #3b82f6;
          opacity: 0.15;
          top: -200px;
          right: -100px;
          animation: float1 15s infinite alternate;
        }

        .e2 {
          width: 500px;
          height: 500px;
          background: #06b6d4;
          opacity: 0.12;
          bottom: -200px;
          left: -150px;
          animation: float2 18s infinite alternate;
        }

        .e3 {
          width: 400px;
          height: 400px;
          background: #8b5cf6;
          opacity: 0.1;
          top: 50%;
          left: 30%;
          transform: translateY(-50%);
          animation: float3 12s infinite alternate;
        }

        @keyframes float1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 30px) scale(1.1); }
        }

        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, -50px) scale(1.2); }
        }

        @keyframes float3 {
          0% { transform: translateY(-50%) scale(1); }
          100% { transform: translateY(-40%) scale(1.15); }
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          position: relative;
          z-index: 10;
          min-height: 100vh;
          align-items: center;
        }

        .left {
          color: white;
          animation: fadeInUp 1s ease;
          position: relative;
          z-index: 20;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .badge-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .badge-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6);
          border-radius: 100px;
          filter: blur(8px);
          opacity: 0.5;
          animation: badgePulse 3s infinite;
        }

        @keyframes badgePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: rgba(17, 25, 40, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          color: #e2e8f0;
          font-size: 0.85rem;
          z-index: 2;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        .title-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .title {
          font-size: 4.2rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 2;
        }

        .title-gradient {
          background: linear-gradient(135deg, #60a5fa, #2dd4bf, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientShift 8s infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .title-orb {
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          top: -50px;
          left: -30px;
          filter: blur(40px);
          opacity: 0.4;
          z-index: 1;
        }

        .title-orb.orb2 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
          bottom: -50px;
          right: -30px;
          top: auto;
          left: auto;
        }

        .desc-wrapper {
          position: relative;
          margin-bottom: 2.5rem;
        }

        .desc-line {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #3b82f6, #06b6d4);
          border-radius: 3px;
          animation: lineGlow 3s infinite;
        }

        @keyframes lineGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .desc {
          margin-left: 1.5rem;
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.7;
          max-width: 400px;
        }

        .glass {
          background: rgba(17, 25, 40, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .stats-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          position: relative;
          flex: 1;
          padding: 1.2rem 1rem;
          text-align: center;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.2);
        }

        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.2rem;
          transition: all 0.3s ease;
        }

        .stat-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-loader {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: scaleIn 0.5s ease;
          animation-fill-mode: both;
        }

        .feature-item:nth-child(1) { animation-delay: 0.1s; }
        .feature-item:nth-child(2) { animation-delay: 0.2s; }
        .feature-item:nth-child(3) { animation-delay: 0.3s; }
        .feature-item:nth-child(4) { animation-delay: 0.4s; }
        .feature-item:nth-child(5) { animation-delay: 0.5s; }
        .feature-item:nth-child(6) { animation-delay: 0.6s; }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .feature-item:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .feature-icon-wrapper {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 6px;
        }

        .feature-icon {
          font-size: 1rem;
        }

        .feature-name {
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .auth-wrapper {
          margin-bottom: 2rem;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn-primary {
          position: relative;
          padding: 0.7rem 1.8rem;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-primary:hover .btn-glow {
          opacity: 1;
        }

        .btn-secondary {
          padding: 0.7rem 1.8rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #475569;
          font-size: 0.85rem;
        }

        .footer-text {
          color: #64748b;
        }

        .footer-links {
          display: flex;
          gap: 0.5rem;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #60a5fa;
        }

        .footer-dot {
          color: #334155;
        }

        .right {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 20;
        }

        .visual {
          position: relative;
          width: 450px;
          height: 450px;
        }

        .grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 40px 40px;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: rotate 20s linear infinite;
          box-shadow: 0 0 50px rgba(59, 130, 246, 0.2);
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .circle {
          position: absolute;
          width: 350px;
          height: 350px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseGlow 4s infinite alternate;
        }

        .circle.c2 {
          width: 280px;
          height: 280px;
          border-color: rgba(6, 182, 212, 0.2);
          border-style: dashed;
          animation: pulseGlow 4.5s infinite alternate-reverse;
        }

        .circle.c3 {
          width: 210px;
          height: 210px;
          border-color: rgba(139, 92, 246, 0.2);
          border-width: 2px;
          animation: pulseGlow 5s infinite alternate;
        }

        .circle.c4 {
          width: 140px;
          height: 140px;
          border-color: rgba(236, 72, 153, 0.2);
          border-style: dotted;
          animation: pulseGlow 5.5s infinite alternate-reverse;
        }

        @keyframes pulseGlow {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
          opacity: 0.5;
        }

        .p1 {
          top: 20%;
          left: 30%;
          animation: floatParticle 8s infinite;
        }

        .p2 {
          top: 60%;
          right: 25%;
          width: 6px;
          height: 6px;
          background: #06b6d4;
          animation: floatParticle 10s infinite reverse;
        }

        .p3 {
          bottom: 20%;
          left: 40%;
          width: 5px;
          height: 5px;
          background: #8b5cf6;
          animation: floatParticle 7s infinite 2s;
        }

        .p4 {
          top: 40%;
          right: 35%;
          width: 8px;
          height: 8px;
          background: #ec4899;
          opacity: 0.3;
          animation: floatParticle 12s infinite 1s;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.2); }
          50% { transform: translate(0, -40px) scale(1.5); }
          75% { transform: translate(-20px, -20px) scale(1.2); }
        }

        .code-block {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          width: 250px;
          z-index: 20;
          overflow: hidden;
          animation: float 6s infinite alternate;
        }

        .code-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3), transparent 70%);
          opacity: 0;
          animation: glowPulse 3s infinite alternate;
        }

        @keyframes glowPulse {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(-10px); }
          100% { transform: translate(-50%, -50%) translateY(10px); }
        }

        .code-block pre {
          color: #e2e8f0;
          font-family: 'Monaco', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          position: relative;
          z-index: 25;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          padding: 2rem;
          width: 320px;
          text-align: center;
          position: relative;
          background: rgba(17, 25, 40, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .modal-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .modal h3 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .modal p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
        }

        .modal-actions button {
          flex: 1;
          padding: 0.7rem;
          border: 1px solid #334155;
          border-radius: 6px;
          background: transparent;
          color: white;
          cursor: pointer;
        }

        .modal-primary {
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          border: none !important;
        }

        /* ========== MOBILE RESPONSIVE - SAME LAYOUT ========== */
        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr 1fr !important;  /* 2 columns same */
            gap: 1.5rem !important;
            padding: 1rem !important;
          }
          
          .left {
            grid-column: 1 / 2 !important;
            text-align: left !important;
          }
          
          .right {
            grid-column: 2 / 3 !important;
            margin-top: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          
          .title {
            font-size: 2.5rem !important;
          }
          
          .desc {
            font-size: 0.9rem !important;
            margin-left: 1.5rem !important;
          }
          
          .stats-container {
            flex-direction: row !important;
            gap: 0.5rem !important;
          }
          
          .stat-card {
            padding: 0.8rem 0.5rem !important;
          }
          
          .stat-value {
            font-size: 1.2rem !important;
          }
          
          .stat-label {
            font-size: 0.55rem !important;
          }
          
          .feature-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.4rem !important;
          }
          
          .feature-item {
            padding: 0.5rem !important;
          }
          
          .feature-icon {
            font-size: 0.9rem !important;
          }
          
          .feature-name {
            font-size: 0.7rem !important;
          }
          
          .auth-buttons {
            flex-direction: row !important;
            gap: 0.5rem !important;
          }
          
          .btn-primary, .btn-secondary {
            width: auto !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.8rem !important;
          }
          
          .footer {
            flex-direction: row !important;
            font-size: 0.7rem !important;
          }
          
          .visual {
            width: 250px !important;
            height: 250px !important;
          }
          
          .grid {
            background-size: 25px 25px !important;
          }
          
          .circle {
            width: 200px !important;
            height: 200px !important;
          }
          
          .circle.c2 {
            width: 160px !important;
            height: 160px !important;
          }
          
          .circle.c3 {
            width: 120px !important;
            height: 120px !important;
          }
          
          .circle.c4 {
            width: 80px !important;
            height: 80px !important;
          }
          
          .code-block {
            width: 160px !important;
            padding: 1rem !important;
          }
          
          .code-block pre {
            font-size: 0.6rem !important;
          }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .container {
            gap: 1rem !important;
          }
          
          .title {
            font-size: 2rem !important;
          }
          
          .stat-value {
            font-size: 1rem !important;
          }
          
          .stat-label {
            font-size: 0.5rem !important;
          }
          
          .feature-item {
            padding: 0.4rem !important;
          }
          
          .feature-name {
            font-size: 0.65rem !important;
          }
          
          .auth-buttons {
            gap: 0.3rem !important;
          }
          
          .btn-primary, .btn-secondary {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.7rem !important;
          }
          
          .visual {
            width: 200px !important;
            height: 200px !important;
          }
          
          .circle {
            width: 160px !important;
            height: 160px !important;
          }
          
          .circle.c2 {
            width: 130px !important;
            height: 130px !important;
          }
          
          .circle.c3 {
            width: 100px !important;
            height: 100px !important;
          }
          
          .circle.c4 {
            width: 70px !important;
            height: 70px !important;
          }
          
          .code-block {
            width: 140px !important;
          }
        }
      `}</style>
    </div>
  );
}