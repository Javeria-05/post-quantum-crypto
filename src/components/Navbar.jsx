import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleProtectedNav = (route, name) => {
    if (user) {
      navigate(route);
      setMenuOpen(false);
    } else {
      setModalMessage(`Please login to access ${name}`);
      setShowModal(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LEFT - LOGO */}
        <div className="logo" onClick={() => navigate('/')}>
          QuantumSafe
        </div>

        {/* RIGHT SIDE */}
        <div className={`nav-right ${menuOpen ? 'show' : ''}`}>

          {/* LINKS */}
          <button onClick={() => navigate('/')} className="nav-link">Home</button>
          <button onClick={() => handleProtectedNav('/dashboard', 'Dashboard')} className="nav-link">Dashboard</button>
          <button onClick={() => handleProtectedNav('/history', 'History')} className="nav-link">History</button>
          <button onClick={() => handleProtectedNav('/settings', 'Settings')} className="nav-link">Settings</button>

          {/* THEME */}
          <button className="nav-link" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* AUTH */}
          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <button
                className="nav-link"
                onClick={() => {
                  setModalMessage("Please sign in to continue");
                  setShowModal(true);
                }}
              >
                Sign in
              </button>

              <button
                className="nav-link"
                onClick={() => {
                  setModalMessage("Create your account");
                  setShowModal(true);
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* HAMBURGER */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🔒 Login Required</h3>
            <p>{modalMessage}</p>

            <div className="modal-actions">
              <button onClick={() => navigate('/login')}>
                Sign in
              </button>
              <button className="primary-btn" onClick={() => navigate('/signup')}>
                Sign up
              </button>
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
        }

        .nav-container {
          max-width: 1200px;
          margin: auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--primary);
          cursor: pointer;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--text);
          cursor: pointer;
          font-size: 1rem;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .logout-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
        }

        .primary-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.8rem;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .hamburger {
            display: block;
          }

          .nav-right {
            display: none;
            flex-direction: column;
            width: 100%;
            margin-top: 1rem;
          }

          .nav-right.show {
            display: flex;
          }

          .nav-link, .logout-btn {
            width: 100%;
            text-align: center;
          }
        }

        .modal-overlay {
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
          text-align: center;
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
      `}</style>
    </nav>
  );
}