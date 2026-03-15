import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

console.log("✅ Library imported successfully");

// Helper functions
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM loaded");

    // Generate Keys
    document.getElementById('generateBtn').addEventListener('click', () => {
        try {
            const keys = ml_kem768.keygen();
            document.getElementById('publicKey').value = toBase64(keys.publicKey);
            document.getElementById('privateKey').value = toBase64(keys.secretKey);
            console.log("✅ Keys generated");
        } catch (e) {
            alert("Error: " + e.message);
        }
    });

    // Encrypt
    document.getElementById('encryptBtn').addEventListener('click', () => {
        const publicKeyBase64 = document.getElementById('publicKey').value;
        const message = document.getElementById('messageToEncrypt').value;
        
        if (!publicKeyBase64 || !message) {
            alert('Please generate keys and enter a message');
            return;
        }
        
        try {
            const publicKey = fromBase64(publicKeyBase64);
            const { cipherText, sharedSecret } = ml_kem768.encapsulate(publicKey);
            
            const messageBytes = encoder.encode(message);
            const encrypted = new Uint8Array(messageBytes.length);
            for (let i = 0; i < messageBytes.length; i++) {
                encrypted[i] = messageBytes[i] ^ sharedSecret[i % sharedSecret.length];
            }
            
            const result = {
                cipherText: toBase64(cipherText),
                encrypted: toBase64(encrypted),
                length: messageBytes.length
            };
            
            document.getElementById('encryptedResult').value = JSON.stringify(result);
        } catch (e) {
            alert('Encryption failed: ' + e.message);
        }
    });

    // Decrypt
    document.getElementById('decryptBtn').addEventListener('click', () => {
        const privateKeyBase64 = document.getElementById('privateKeyForDecrypt').value;
        const encryptedJson = document.getElementById('encryptedToDecrypt').value;
        
        if (!privateKeyBase64 || !encryptedJson) {
            alert('Please provide private key and encrypted message');
            return;
        }
        
        try {
            const { cipherText: cipherTextBase64, encrypted: encryptedBase64, length } = JSON.parse(encryptedJson);
            
            const privateKey = fromBase64(privateKeyBase64);
            const cipherText = fromBase64(cipherTextBase64);
            const encrypted = fromBase64(encryptedBase64);
            
            const sharedSecret = ml_kem768.decapsulate(cipherText, privateKey);
            
            const decrypted = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                decrypted[i] = encrypted[i] ^ sharedSecret[i % sharedSecret.length];
            }
            
            document.getElementById('decryptedResult').value = decoder.decode(decrypted);
        } catch (e) {
            alert('Decryption failed: ' + e.message);
        }
    });
});