import React from 'react';

export default function History() {
  // Sample history data
  const history = [
    { id: 1, date: '2024-03-15', type: 'Encryption', message: 'Hello World' },
    { id: 2, date: '2024-03-14', type: 'Key Generation', message: 'ML-KEM Keys' },
    { id: 3, date: '2024-03-13', type: 'Decryption', message: 'Secret Message' },
  ];

  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Encryption History</h1>
      
      <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', color: 'white' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Message</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem' }}>{item.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: item.type === 'Encryption' ? 'var(--success)' : 
                               item.type === 'Key Generation' ? 'var(--primary)' : 'var(--secondary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    {item.type}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{item.message}</td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn-outline" style={{ padding: '0.25rem 1rem' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}