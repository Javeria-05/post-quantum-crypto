import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'single' or 'all'
  const [deleteId, setDeleteId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    try {
      // 👇 WITHOUT orderBy - no index needed
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', auth.currentUser.uid)
        // orderBy('timestamp', 'desc')  // Comment out temporarily
      );
      
      const querySnapshot = await getDocs(q);
      let activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      // Sort manually in JavaScript
      activitiesData.sort((a, b) => b.timestamp - a.timestamp);
      
      setActivities(activitiesData);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // View details
  const viewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  // Show delete confirmation
  const confirmDelete = (activityId) => {
    setDeleteType('single');
    setDeleteId(activityId);
    setShowDeleteConfirm(true);
  };

  // Show delete all confirmation
  const confirmDeleteAll = () => {
    setDeleteType('all');
    setShowDeleteConfirm(true);
  };

  // Handle confirmed delete
  const handleConfirmedDelete = async () => {
    setShowDeleteConfirm(false);
    
    if (deleteType === 'single' && deleteId) {
      try {
        await deleteDoc(doc(db, 'activities', deleteId));
        setActivities(prev => prev.filter(a => a.id !== deleteId));
        setSuccess('Activity deleted successfully!');
        
        if (selectedActivity?.id === deleteId) {
          closeModal();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting activity:', error);
        setError('Failed to delete activity');
        setTimeout(() => setError(''), 3000);
      }
    } else if (deleteType === 'all') {
      try {
        let deletedCount = 0;
        for (const activity of activities) {
          await deleteDoc(doc(db, 'activities', activity.id));
          deletedCount++;
        }
        setActivities([]);
        setSuccess(`${deletedCount} activities deleted successfully!`);
        closeModal();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error clearing activities:', error);
        setError('Failed to clear activities');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'encryption': return '🔐';
      case 'decryption': return '🔓';
      case 'key_generation': return '🔑';
      case 'file_encryption': return '📁';
      default: return '📄';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'encryption': return 'var(--primary)';
      case 'decryption': return 'var(--secondary)';
      case 'key_generation': return 'var(--success)';
      case 'file_encryption': return '#f59e0b';
      default: return 'var(--gray)';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 2rem'
        }} />
        <p style={{ color: 'var(--gray)' }}>Loading your encryption history...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Encryption History</h1>
          <p style={{ color: 'var(--gray)' }}>
            Track all your quantum-safe encryption activities
          </p>
        </div>

        {/* Filter and Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', 'encryption', 'decryption', 'key_generation', 'file_encryption'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === type ? 'var(--primary)' : 'transparent',
                color: filter === type ? 'white' : 'var(--text)',
                border: `2px solid ${filter === type ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              {type === 'all' ? 'All' : 
               type === 'encryption' ? 'Encryptions' :
               type === 'decryption' ? 'Decryptions' :
               type === 'key_generation' ? 'Keys' : 'Files'}
            </button>
          ))}

          {activities.length > 0 && (
            <button
              onClick={confirmDeleteAll}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '2px solid #ef4444',
                color: '#ef4444',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginLeft: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#ef4444';
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          background: '#ef444420',
          color: '#ef4444',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #ef4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          background: '#22c55e20',
          color: '#22c55e',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #22c55e'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activities.length}</div>
          <div style={{ color: 'var(--gray)' }}>Total Activities</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {activities.filter(a => a.type === 'encryption').length}
          </div>
          <div style={{ color: 'var(--gray)' }}>Encryptions</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔓</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {activities.filter(a => a.type === 'decryption').length}
          </div>
          <div style={{ color: 'var(--gray)' }}>Decryptions</div>
        </div>
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {activities.filter(a => a.type === 'key_generation').length}
          </div>
          <div style={{ color: 'var(--gray)' }}>Keys Generated</div>
        </div>
      </div>

      {/* History Table - Clean Version */}
      {filteredActivities.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📭</span>
          <h3>No activities found</h3>
          <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>
            {filter === 'all' 
              ? 'Start encrypting messages or files to see your history here!'
              : `No ${filter} activities found. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '450px'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'center', width: '60px' }}>#</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right', width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity, index) => (
                <tr key={activity.id} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => viewDetails(activity)}
                >
                  {/* Serial Number */}
                  <td style={{ 
                    padding: '1rem 0.5rem', 
                    textAlign: 'center',
                    color: 'var(--gray)',
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    {index + 1}
                  </td>
                  
                  {/* Type with Icon */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{getTypeIcon(activity.type)}</span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: getTypeColor(activity.type) + '20',
                        color: getTypeColor(activity.type),
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {activity.type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewDetails(activity);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          color: 'var(--text)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--primary)';
                          e.target.style.color = 'white';
                          e.target.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'var(--text)';
                          e.target.style.borderColor = 'var(--border)';
                        }}
                      >
                        Details
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(activity.id);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid #ef4444',
                          borderRadius: '0.5rem',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#ef4444';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#ef4444';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     {/* Details Modal */}
{showModal && selectedActivity && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  }} onClick={closeModal}>
    <div 
      className="dashboard-card"
      style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closeModal}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'var(--gray)'
        }}
      >
        ✕
      </button>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '3rem' }}>{getTypeIcon(selectedActivity.type)}</span>
        <h2 style={{ marginTop: '0.5rem' }}>
          {selectedActivity.type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Date & Time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--gray)' }}>Date & Time:</span>
          <span style={{ fontWeight: '500' }}>{formatDate(selectedActivity.timestamp)}</span>
        </div>

        {/* Details based on type */}
        {selectedActivity.type === 'key_generation' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>Public Key Size:</span>
              <span>{selectedActivity.details?.publicKeyLength || 1184} bytes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>Algorithm:</span>
              <span>ML-KEM-768</span>
            </div>
          </>
        )}

        {selectedActivity.type === 'encryption' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>Message Length:</span>
              <span>{selectedActivity.details?.messageLength || 'N/A'} characters</span>
            </div>
            {selectedActivity.details?.messagePreview && (
              <div style={{ padding: '0.5rem 0' }}>
                <span style={{ color: 'var(--gray)' }}>Message Preview:</span>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: 'var(--background)',
                  borderRadius: '0.5rem',
                  fontFamily: 'monospace'
                }}>
                  "{selectedActivity.details.messagePreview}"
                </div>
              </div>
            )}
          </>
        )}

        {selectedActivity.type === 'decryption' && (
          <div style={{ padding: '0.5rem 0' }}>
            <span style={{ color: 'var(--gray)' }}>Status:</span>
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'var(--success)20',
              color: 'var(--success)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              ✅ Successfully decrypted
            </div>
          </div>
        )}

        {selectedActivity.type === 'file_encryption' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>Filename:</span>
              <span>{selectedActivity.details?.filename || 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>File Size:</span>
              <span>{formatBytes(selectedActivity.details?.size)}</span>
            </div>
          </>
        )}

        {/* Activity ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--gray)' }}>Activity ID:</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedActivity.id}</span>
        </div>
      </div>

      {/* Close Button - Only this */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          onClick={closeModal}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--primary-dark)';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--primary)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>⚠️</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
              Confirm Delete
            </h3>
            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
              {deleteType === 'single' 
                ? 'Are you sure you want to delete this activity? This action cannot be undone.'
                : `Are you sure you want to delete all ${activities.length} activities? This action cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedDelete}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Helper function for bytes formatting
function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}