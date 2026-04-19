import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const LearnerCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetchWithAuth('/certificates');
        if (!response.ok) throw new Error('Failed to fetch certificates');
        const data = await response.json();
        setCerts(data);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Certificates</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Proof of completion for courses you have finished. Download or share credentials when you connect your completion API.
        </p>
      </header>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading your certificates...
        </div>
      ) : certs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Award size={44} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.85 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            No certificates yet. Complete a course to earn your first credential.
          </p>
          <Link to="/dashboard/learner" className="btn btn-primary">
            View enrolled courses
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {certs.map((c) => (
            <div
              key={c._id || c.id}
              className="glass-panel"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Award size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.35rem' }}>{c.courseTitleSnapshot || c.courseTitle}</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {c.issuerLabel || c.issuer} · Completed {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.completedOn}
                </p>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {c.credentialId}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <a 
                  href={c.pdfUrl || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary" 
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  Download PDF
                </a>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} 
                  onClick={() => navigator.clipboard.writeText(c.credentialId)}
                >
                  Copy ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default LearnerCertificates;
