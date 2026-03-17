import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext'; // 👈 Import

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme(); // 👈 Use theme

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">QuantumSafe</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/history">History</Link>
          <Link to="/settings">Settings</Link>
          
          {/* Dark mode toggle button */}
          <button 
            onClick={toggleDarkMode}
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
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}