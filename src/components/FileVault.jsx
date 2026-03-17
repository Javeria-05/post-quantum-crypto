import React, { useState, useCallback } from 'react';
import { auth } from '../firebase/config';
import { addActivity } from '../services/historyService';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileVault({ publicKey, privateKey }) {
  const [files, setFiles] = useState([]);
  const [encrypting, setEncrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedDecryptFile, setSelectedDecryptFile] = useState(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  // No size limit - accept all files
  const handleFiles = (fileList) => {
    const selectedFiles = Array.from(fileList);
    setFiles(selectedFiles);
    setError('');
    setSuccess('');
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    setError('');
    setSuccess('');
  };

  // ENCRYPT ALL FILES
  const encryptAllFiles = async () => {
    if (!publicKey) {
      setError('❌ Please generate keys first');
      return;
    }
    
    if (files.length === 0) {
      setError('❌ No files selected');
      return;
    }

    setEncrypting(true);
    setError('');
    setSuccess('');
    setProgress(0);

    try {
      const pubKey = fromBase64(publicKey);
      let completed = 0;

      for (const file of files) {
        // Read file
        const fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(new Uint8Array(e.target.result));
          reader.readAsArrayBuffer(file);
        });

        // Encrypt
        const { cipherText, sharedSecret } = ml_kem768.encapsulate(pubKey);
        
        const encrypted = new Uint8Array(fileData.length);
        for (let i = 0; i < fileData.length; i++) {
          encrypted[i] = fileData[i] ^ sharedSecret[i % sharedSecret.length];
        }
        
        // Prepare encrypted file
        const encryptedFileData = {
          version: '1.0',
          algorithm: 'ML-KEM-768',
          cipherText: toBase64(cipherText),
          data: toBase64(encrypted),
          filename: file.name,
          type: file.type,
          size: fileData.length,
          timestamp: new Date().toISOString()
        };
        
        // Download
        downloadFile(JSON.stringify(encryptedFileData, null, 2), `${file.name}.encrypted`);
        
        completed++;
        setProgress(Math.round((completed / files.length) * 100));

        // Save to history
        if (auth.currentUser) {
          await addActivity(auth.currentUser.uid, 'file_encryption', {
            filename: file.name,
            size: fileData.length
          });
        }
      }

      setSuccess(`✅ Successfully encrypted ${completed} file(s)!`);
      setFiles([]);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Encryption error:', error);
      setError('❌ Encryption failed: ' + error.message);
    } finally {
      setEncrypting(false);
    }
  };

  // DECRYPT FILE
  const decryptFile = async (file) => {
    setSelectedDecryptFile(file);
    
    if (!privateKey) {
      setError('❌ Please generate/use your private key first');
      return;
    }

    setEncrypting(true);
    setError('');
    setSuccess('');

    try {
      // Read encrypted file
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Parse JSON
      const encryptedData = JSON.parse(fileContent);
      
      // Validate format
      if (!encryptedData.cipherText || !encryptedData.data || !encryptedData.filename) {
        throw new Error('Invalid encrypted file format');
      }

      // Convert from base64
      const privKey = fromBase64(privateKey);
      const cipherText = fromBase64(encryptedData.cipherText);
      const encryptedBytes = fromBase64(encryptedData.data);
      
      // Decapsulate to get shared secret
      const sharedSecret = ml_kem768.decapsulate(cipherText, privKey);
      
      // XOR decryption
      const decrypted = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ sharedSecret[i % sharedSecret.length];
      }
      
      // Download decrypted file
      downloadFile(decrypted, `decrypted_${encryptedData.filename}`, encryptedData.type || 'application/octet-stream');
      
      setSuccess(`✅ Successfully decrypted: ${encryptedData.filename}`);
      setSelectedDecryptFile(null);
      
      // Save to history
      if (auth.currentUser) {
        await addActivity(auth.currentUser.uid, 'file_decryption', {
          filename: encryptedData.filename,
          size: encryptedBytes.length
        });
      }
      
    } catch (error) {
      console.error('Decryption error:', error);
      setError('❌ Decryption failed: ' + error.message);
    } finally {
      setEncrypting(false);
    }
  };

  return (
    <div className="dashboard-card" style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>📁</span>
        <h2 style={{ margin: 0 }}>File Vault</h2>
        <span style={{ 
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem',
          background: publicKey ? 'var(--success)' : 'var(--gray)',
          color: 'white',
          borderRadius: '2rem',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {publicKey ? '🔓 Keys Ready' : '🔒 Keys Required'}
        </span>
      </div>

      <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
        Securely encrypt/decrypt multiple files with quantum-safe encryption
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: dragActive ? 'var(--primary-light)' : 'var(--background)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>
          {dragActive ? '📂' : '📎'}
        </span>
        <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
          {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
          Supports any file type • No size limit
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h4 style={{ margin: 0 }}>Selected Files ({files.length})</h4>
            <button
              onClick={clearFiles}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--error)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Clear All
            </button>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {files.map((file, index) => (
              <div
                key={index}
                className="file-list-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--background)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📄</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                      {formatBytes(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {progress > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <span>Encryption Progress</span>
            <span style={{ fontWeight: '600' }}>{progress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--border)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#ef4444',
          color: 'white',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#22c55e',
          color: 'white',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          className="btn"
          onClick={encryptAllFiles}
          disabled={encrypting || files.length === 0 || !publicKey}
          style={{ 
            flex: 1,
            opacity: (encrypting || files.length === 0 || !publicKey) ? 0.6 : 1
          }}
        >
          {encrypting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Processing...
            </span>
          ) : (
            `Encrypt ${files.length} File${files.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>

      {/* Decrypt Files - Professional Section */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, var(--background) 0%, var(--card-bg) 100%)',
        borderRadius: '1rem',
        border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div className="decrypt-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            🔓
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>Decrypt Files</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--gray)' }}>
              Restore your encrypted files to original format
            </p>
          </div>
          
          {/* Status Badge */}
          <span className="decrypt-status" style={{
            marginLeft: 'auto',
            padding: '0.25rem 0.75rem',
            background: privateKey ? 'var(--success)' : 'var(--error)',
            color: 'white',
            borderRadius: '2rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {privateKey ? <span>✅ Key Ready</span> : <span>⚠️ Key Required</span>}
          </span>
        </div>

        {/* File Input Area */}
        <div style={{
          background: 'var(--background)',
          borderRadius: '12px',
          padding: '1rem',
          border: `2px dashed ${privateKey ? 'var(--primary)' : 'var(--border)'}`,
          transition: 'all 0.3s ease',
          opacity: privateKey ? 1 : 0.7,
          cursor: privateKey ? 'pointer' : 'not-allowed',
          position: 'relative'
        }}
        onClick={() => privateKey && document.getElementById('decryptInput').click()}
        >
          <input
            id="decryptInput"
            type="file"
            accept=".encrypted,application/json"
            onChange={(e) => {
              if (e.target.files[0] && privateKey) {
                decryptFile(e.target.files[0]);
              }
            }}
            disabled={!privateKey}
            style={{ display: 'none' }}
          />
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
              {privateKey ? '🔓' : '🔒'}
            </span>
            <p style={{ 
              fontWeight: '500', 
              marginBottom: '0.25rem',
              color: privateKey ? 'var(--text)' : 'var(--gray)'
            }}>
              {privateKey 
                ? 'Click to select encrypted file or drag & drop'
                : 'Generate private key first to decrypt'
              }
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
              Supports .encrypted files • No size limit
            </p>
          </div>

          {/* Selected File Info */}
          {selectedDecryptFile && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--card-bg)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid var(--success)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                  {selectedDecryptFile.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                  {formatBytes(selectedDecryptFile.size)} • Ready to decrypt
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDecryptFile(null);
                  document.getElementById('decryptInput').value = '';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {privateKey && (
          <div className="quick-actions" style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => document.getElementById('decryptInput').click()}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              📂 Browse Files
            </button>
            
            {selectedDecryptFile && (
              <button
                onClick={() => decryptFile(selectedDecryptFile)}
                className="btn"
                style={{ padding: '0.5rem 1.5rem' }}
              >
                🔓 Decrypt Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'var(--background)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--gray)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>🔐</span>
        <span>
          {publicKey && privateKey 
            ? 'Ready to encrypt/decrypt files'
            : 'Generate keys first to use File Vault'}
        </span>
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}