import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { addActivity } from '../services/historyService';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import Benchmark from '../components/Benchmark';
import FileVault from '../components/FileVault';  // 👈 Import FileVault

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// File download helper (keep for message encryption downloads)
function downloadFile(data, filename, type = 'application/octet-stream') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [message, setMessage] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptPrivateKey, setDecryptPrivateKey] = useState('');
  const [encryptedToDecrypt, setEncryptedToDecrypt] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');

  // 1. GENERATE KEYS
  const generateKeys = async () => {
    try {
      const keys = ml_kem768.keygen();
      const pubB64 = toBase64(keys.publicKey);
      const privB64 = toBase64(keys.secretKey);
      
      setPublicKey(pubB64);
      setPrivateKey(privB64);
      setRecipientPublicKey(pubB64);

      if (auth.currentUser) {
        await addActivity(auth.currentUser.uid, 'key_generation', {
          publicKeyLength: keys.publicKey.length
        });
      }
    } catch (error) {
      alert('Key generation failed: ' + error.message);
    }
  };

  // 2. ENCRYPT MESSAGE
  const handleEncrypt = async () => {
    try {
      if (!recipientPublicKey || !message) {
        alert('Please provide public key and message');
        return;
      }

      const pubKey = fromBase64(recipientPublicKey);
      const { cipherText, sharedSecret } = ml_kem768.encapsulate(pubKey);
      
      const msgBytes = encoder.encode(message);
      const encrypted = new Uint8Array(msgBytes.length);
      for (let i = 0; i < msgBytes.length; i++) {
        encrypted[i] = msgBytes[i] ^ sharedSecret[i % sharedSecret.length];
      }

      const result = {
        cipherText: toBase64(cipherText),
        encrypted: toBase64(encrypted),
        length: msgBytes.length
      };

      setEncryptedResult(JSON.stringify(result));

      if (auth.currentUser) {
        await addActivity(auth.currentUser.uid, 'encryption', {
          messageLength: message.length
        });
      }
    } catch (error) {
      alert('Encryption failed: ' + error.message);
    }
  };

  // 3. DECRYPT MESSAGE
  const handleDecrypt = async () => {
    try {
      if (!decryptPrivateKey || !encryptedToDecrypt) {
        alert('Please provide private key and encrypted message');
        return;
      }

      const { cipherText: ctB64, encrypted: encB64, length } = JSON.parse(encryptedToDecrypt);
      
      const privKey = fromBase64(decryptPrivateKey);
      const cipherText = fromBase64(ctB64);
      const encrypted = fromBase64(encB64);

      const sharedSecret = ml_kem768.decapsulate(cipherText, privKey);

      const decrypted = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        decrypted[i] = encrypted[i] ^ sharedSecret[i % sharedSecret.length];
      }

      setDecryptedResult(decoder.decode(decrypted));

      if (auth.currentUser) {
        await addActivity(auth.currentUser.uid, 'decryption', {
          messageLength: length
        });
      }
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Quantum-Safe Dashboard</h1>
      
      {/* Main Dashboard Grid - Message Encryption Section */}
      <div className="dashboard-grid">
        {/* Key Generation Card */}
        <div className="dashboard-card">
          <h2>🔑 Generate Keys</h2>
          <button className="btn" onClick={generateKeys} style={{ width: '100%', marginBottom: '1rem' }}>
            Generate New ML-KEM Keys
          </button>
          
          <div className="form-group">
            <label>Public Key (share this)</label>
            <textarea value={publicKey} readOnly rows="3" />
          </div>
          
          <div className="form-group">
            <label>Private Key (keep secret!)</label>
            <textarea value={privateKey} readOnly rows="3" />
          </div>
        </div>

        {/* Encryption Card */}
        <div className="dashboard-card">
          <h2>📨 Encrypt Message</h2>
          
          <div className="form-group">
            <label>Recipient's Public Key</label>
            <textarea 
              value={recipientPublicKey}
              onChange={(e) => setRecipientPublicKey(e.target.value)}
              rows="3"
              placeholder="Paste public key here..."
            />
          </div>

          <div className="form-group">
            <label>Message to Encrypt</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Enter secret message..."
            />
          </div>

          <button className="btn" onClick={handleEncrypt} style={{ width: '100%' }}>
            Encrypt
          </button>

          {encryptedResult && (
            <div className="form-group">
              <label>Encrypted Result</label>
              <textarea value={encryptedResult} readOnly rows="4" />
            </div>
          )}
        </div>

        {/* Decryption Card */}
        <div className="dashboard-card">
          <h2>🔓 Decrypt Message</h2>
          
          <div className="form-group">
            <label>Your Private Key</label>
            <textarea
              value={decryptPrivateKey}
              onChange={(e) => setDecryptPrivateKey(e.target.value)}
              rows="3"
              placeholder="Paste your private key here..."
            />
          </div>

          <div className="form-group">
            <label>Encrypted Message (JSON)</label>
            <textarea
              value={encryptedToDecrypt}
              onChange={(e) => setEncryptedToDecrypt(e.target.value)}
              rows="4"
              placeholder="Paste encrypted JSON here..."
            />
          </div>

          <button className="btn" onClick={handleDecrypt} style={{ width: '100%' }}>
            Decrypt
          </button>

          {decryptedResult && (
            <div className="form-group">
              <label>Decrypted Message</label>
              <textarea value={decryptedResult} readOnly rows="3" />
            </div>
          )}
        </div>
      </div>

      {/* 👉 File Vault Component - Advanced File Encryption (Independent) */}
      <FileVault publicKey={publicKey} privateKey={privateKey} />

      {/* 👉 Benchmark Component */}
      <div style={{ marginTop: '3rem' }}>
        <Benchmark />
      </div>
    </div>
  );
}