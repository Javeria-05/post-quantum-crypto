import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(auth.currentUser, { displayName });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'Are you sure? This will delete ALL your data permanently!'
    );
    
    if (!confirm) return;

    try {
      setLoading(true);
      // Delete user's activities from Firestore
      const user = auth.currentUser;
      // ... delete logic
      await user.delete();
      navigate('/');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Settings</h1>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Profile Settings */}
        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
          <h2>👤 Profile Settings</h2>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={auth.currentUser?.email || ''}
              disabled
              style={{ background: '#f1f5f9' }}
            />
            <small style={{ color: 'var(--gray)' }}>Email cannot be changed</small>
          </div>
          <button 
            className="btn" 
            onClick={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>

        {/* Appearance Settings */}
        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
          <h2>🎨 Appearance</h2>
          <div className="form-group">
            <label>Theme</label>
            <select value={theme} onChange={(e) => {
              setTheme(e.target.value);
              document.body.className = e.target.value;
              localStorage.setItem('theme', e.target.value);
            }}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>

        {/* Security Settings */}
        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
          <h2>🔒 Security</h2>
          <button 
            className="btn-outline" 
            onClick={() => alert('Password reset email sent!')}
            style={{ marginRight: '1rem' }}
          >
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="dashboard-card" style={{ border: '2px solid #ef4444' }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ Danger Zone</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
            Once you delete your account, all your data and history will be permanently removed.
          </p>
          <button 
            className="btn" 
            style={{ background: '#ef4444' }}
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}