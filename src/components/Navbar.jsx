import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingRoute, setPendingRoute] = useState(null);
  const [pendingName, setPendingName] = useState('');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  const handleProtectedNav = (route, name) => {
    if (user) {
      navigate(route);
      closeMenu();
    } else {
      setPendingRoute(route);
      setPendingName(name);
      setModalMessage(`Please login to access ${name}`);
      setShowModal(true);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingRoute(null);
    setPendingName('');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LEFT - Only Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          QuantumSafe
        </Link>

        {/* RIGHT - All Links */}
        <div className={`nav-right ${menuOpen ? 'show' : ''}`}>
          
          {/* Home Link */}
          <Link 
            to="/" 
            className="nav-link"
            onClick={closeMenu}
          >
            Home
          </Link>
          
          <span 
            onClick={() => handleProtectedNav('/dashboard', 'Dashboard')}
            className="nav-link"
          >
            Dashboard
          </span>

          <span 
            onClick={() => handleProtectedNav('/history', 'History')}
            className="nav-link"
          >
            History
          </span>

          <span 
            onClick={() => handleProtectedNav('/settings', 'Settings')}
            className="nav-link"
          >
            Settings
          </span>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleDarkMode();
              closeMenu();
            }}
            className="theme-toggle"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
              className="logout-btn"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setModalMessage("Please sign in to continue");
                  setShowModal(true);
                }}
                className="nav-link auth-btn"
              >
                Sign in
              </button>

              <button
                onClick={() => {
                  setModalMessage("Create an account to get started");
                  setShowModal(true);
                }}
                className="nav-link auth-btn"
              >
                Sign up
              </button>
            </>
          )}

          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-bg" onClick={handleModalCancel}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleModalCancel}>✕</button>
            <h3 className="modal-heading">🔒 Login Required</h3>
            <p className="modal-msg">{modalMessage}</p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => { setShowModal(false); navigate('/login'); }}>Sign in</button>
              <button className="secondary-btn" onClick={() => { setShowModal(false); navigate('/signup'); }}>Sign up</button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .navbar {
          background: var(--card-bg);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: clamp(1.3rem, 4vw, 2rem);
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .logo:hover {
          color: var(--secondary);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-link {
          color: var(--text);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
          background: transparent;
          border: none;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .auth-btn {
          padding: 0.5rem 1rem;
        }

        .theme-toggle {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--text);
        }

        .theme-toggle:hover {
          color: var(--primary);
        }

        .logout-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text);
        }

        /* Mobile Responsive - Same Layout */
        @media only screen and (max-width: 768px) {
          .nav-container {
            padding: 0.75rem 1rem;
          }

          .nav-right {
            display: none;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--card-bg);
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-bottom: 1px solid var(--border);
            z-index: 1000;
            gap: 0.75rem;
          }

          .nav-right.show {
            display: flex;
          }

          .hamburger {
            display: block;
          }

          .nav-link, .theme-toggle, .logout-btn, .auth-btn {
            width: 100%;
            text-align: center;
            padding: 0.75rem;
          }
        }

        @media only screen and (max-width: 350px) {
          .logo {
            font-size: 1.1rem;
            white-space: normal;
          }
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-box {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 12px;
          width: 320px;
          position: relative;
          text-align: center;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          color: var(--gray);
        }

        .modal-heading {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .modal-msg {
          font-size: 0.9rem;
          margin-bottom: 1rem;
          color: var(--gray);
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
        }

        .primary-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
        }

        .secondary-btn {
          flex: 1;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>
    </nav>
  );
}