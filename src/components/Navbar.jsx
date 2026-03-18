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
      setModalMessage(`Please login to access ${name}`);
      setShowModal(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo - Left */}
        <Link to="/" className="logo" onClick={closeMenu}>
          QuantumSafe
        </Link>

        {/* Hamburger - Right (Mobile only) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? 'show' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          
          <button
            onClick={() => handleProtectedNav('/dashboard', 'Dashboard')}
            className="nav-link"
          >
            Dashboard
          </button>

          <button
            onClick={() => handleProtectedNav('/history', 'History')}
            className="nav-link"
          >
            History
          </button>

          <button
            onClick={() => handleProtectedNav('/settings', 'Settings')}
            className="nav-link"
          >
            Settings
          </button>

          <button
            onClick={() => {
              toggleDarkMode();
              closeMenu();
            }}
            className="theme-toggle nav-link"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

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
                className="nav-link"
              >
                Sign in
              </button>

              <button
                onClick={() => {
                  setModalMessage("Create an account to get started");
                  setShowModal(true);
                }}
                className="nav-link"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>🔒 Login Required</h3>
            <p>{modalMessage}</p>
            <div className="modal-actions">
              <button onClick={() => { setShowModal(false); navigate('/login'); }}>Sign in</button>
              <button onClick={() => { setShowModal(false); navigate('/signup'); }}>Sign up</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          background: var(--card-bg);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
        }

        .nav-link {
          color: var(--text) !important;  /* Force normal text color */
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          background: transparent !important;  /* No background */
          border: none;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: var(--primary) !important;  /* Hover effect */
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
          transition: transform 0.2s ease;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: var(--text);
          padding: 0.25rem 0.5rem;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .nav-container {
            padding: 0.75rem 1rem;
          }

          .hamburger {
            display: block;
          }

          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            border-bottom: 1px solid var(--border);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .nav-links.show {
            display: flex;
          }

          .nav-link, .logout-btn {
            width: 100%;
            text-align: center;
            padding: 0.75rem;
          }
          
          .nav-link {
            color: var(--text) !important;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-box {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 12px;
          width: 100%;
          max-width: 320px;
          position: relative;
          text-align: center;
        }

        .modal-close {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--gray);
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .modal-actions button {
          flex: 1;
          padding: 0.6rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
        }
      `}</style>
    </nav>
  );
}