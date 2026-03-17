import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="logo" onClick={closeMenu}>QuantumSafe</Link>
          
          {/* Hamburger menu for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text)'
            }}
            className="hamburger"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? 'show' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          <Link to="/history" onClick={closeMenu}>History</Link>
          <Link to="/settings" onClick={closeMenu}>Settings</Link>
          
          {/* Dark mode toggle button */}
          <button 
            onClick={() => {
              toggleDarkMode();
              closeMenu();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <button onClick={() => {
              handleLogout();
              closeMenu();
            }}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/signup" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu styles */}
      <style>{`
        @media only screen and (max-width: 600px) {
          .nav-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
          }

          .hamburger {
            display: block !important;
          }

          .nav-links {
            display: none;
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: var(--card-bg);
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-bottom: 1px solid var(--border);
            z-index: 1000;
          }

          .nav-links.show {
            display: flex;
          }

          .nav-links a, .nav-links button {
            width: 100%;
            text-align: center;
            padding: 0.75rem !important;
          }

          .nav-links button {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </nav>
  );
}