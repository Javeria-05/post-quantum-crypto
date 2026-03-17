import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Hero Section - Ek hi button */}
      <section className="hero">
        <h1>QuantumSafe</h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>
          Post-Quantum Cryptography
        </h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Secure your data against quantum computers with ML-KEM 768, 
          the new NIST standard for quantum-safe encryption.
        </p>
        <button className="btn" onClick={() => navigate('/signup')}>
          Start Building
        </button>
      </section>

      {/* Features Cards */}
      <div className="cards-grid">
        <div className="card">
          <h3>🔐 Quantum-Safe Keys</h3>
          <p>Generate ML-KEM 768 key pairs resistant to quantum computer attacks.</p>
        </div>
        <div className="card">
          <h3>📨 Encrypt Messages</h3>
          <p>Use quantum-safe encryption that even quantum computers can't break.</p>
        </div>
        <div className="card">
          <h3>📊 Track History</h3>
          <p>Keep secure history of all your encryption operations.</p>
        </div>
      </div>

      {/* CTA Section - Signup ka duplicate hataya */}
      <section style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        borderRadius: '1.5rem',
        color: 'white',
        marginTop: '3rem'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to get started?</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
          Join developers building quantum-safe applications
        </p>
        <button 
          className="btn" 
          style={{ background: 'white', color: 'var(--primary)' }}
          onClick={() => navigate('/signup')}
        >
          Create Free Account
        </button>
      </section>
    </div>
  );
}