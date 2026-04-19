import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const generateCredentialId = (courseTitle) => {
  const prefix = courseTitle
    ? courseTitle.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
    : 'CERT';
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SS-${prefix}-${year}-${rand}`;
};

// ── sub-components ────────────────────────────────────────────────────────────

const Toast = ({ type, message, onClose }) => (
  <div style={{
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
    backdropFilter: 'blur(12px)',
    color: type === 'success' ? '#4ade80' : '#f87171',
    fontWeight: 600,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.3s ease',
    maxWidth: '360px',
  }}>
    {type === 'success'
      ? <CheckCircle size={18} />
      : <AlertCircle size={18} />}
    <span style={{ flex: 1, fontSize: '0.9rem' }}>{message}</span>
    <button
      onClick={onClose}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
    >
      <X size={16} />
    </button>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const TeacherCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [issuerLabel, setIssuerLabel] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── fetch data ──────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [certsRes, enrollRes, coursesRes] = await Promise.all([
        fetchWithAuth('/certificates'),
        fetchWithAuth('/enrollments'),
        fetchWithAuth('/courses'),
      ]);
      const [certsData, enrollData, coursesData] = await Promise.all([
        certsRes.json(),
        enrollRes.json(),
        coursesRes.json(),
      ]);
      setCerts(Array.isArray(certsData) ? certsData : []);
      setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('error', 'Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── already-certified enrollment IDs ─────────────────────────────────────────
  const certifiedEnrollmentIds = new Set(
    certs.map(c => c.enrollment?._id || c.enrollment)
  );

  // Filter out enrollments that already have a certificate
  const availableEnrollments = enrollments.filter(
    e => !certifiedEnrollmentIds.has(e._id?.toString())
  );

  // ── issue certificate ─────────────────────────────────────────────────────────

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) {
      showToast('error', 'Please select an enrollment.');
      return;
    }

    const enrollment = enrollments.find(en => en._id === selectedEnrollment);
    if (!enrollment) return;

    const courseTitle =
      enrollment.course?.title ||
      courses.find(c => c._id === enrollment.course)?.title ||
      'Course';

    const payload = {
      learner: enrollment.user?._id || enrollment.user,
      course: enrollment.course?._id || enrollment.course,
      enrollment: enrollment._id,
      credentialId: generateCredentialId(courseTitle),
      courseTitleSnapshot: courseTitle,
      issuerLabel: issuerLabel || 'SkillSwap',
      pdfUrl: pdfUrl || undefined,
      status: 'active',
    };

    setSubmitting(true);
    try {
      const res = await fetchWithAuth('/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to issue certificate');
      }
      showToast('success', `Certificate issued for ${enrollment.user?.name || 'student'}!`);
      setShowForm(false);
      setSelectedEnrollment('');
      setIssuerLabel('');
      setPdfUrl('');
      fetchAll();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete certificate ────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Revoke this certificate? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetchWithAuth(`/certificates/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Certificate revoked successfully.');
      setCerts(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Certificates</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Issue and manage completion credentials for your students.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={18} />
          Issue Certificate
        </button>
      </header>

      {/* Issue form */}
      {showForm && (
        <div
          className="glass-panel"
          style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Award size={18} />
              </div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Issue New Certificate</h2>
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleIssue}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Enrollment picker */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Student Enrollment <span style={{ color: 'var(--secondary)' }}>*</span></label>
                {loading ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading enrollments…</p>
                ) : availableEnrollments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No eligible enrollments — all students already have certificates, or no enrollments exist.
                  </p>
                ) : (
                  <select
                    value={selectedEnrollment}
                    onChange={e => setSelectedEnrollment(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  >
                    <option value="">— Select enrollment —</option>
                    {availableEnrollments.map(en => {
                      const studentName = en.user?.name || en.user || 'Unknown Student';
                      const courseTitle = en.course?.title || courses.find(c => c._id === en.course)?.title || 'Unknown Course';
                      return (
                        <option key={en._id} value={en._id}>
                          {studentName} — {courseTitle}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Issuer label */}
              <div className="input-group">
                <label>Issuer Label</label>
                <input
                  type="text"
                  value={issuerLabel}
                  onChange={e => setIssuerLabel(e.target.value)}
                  placeholder="e.g. SkillSwap · Your Name"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>

              {/* PDF URL */}
              <div className="input-group">
                <label>PDF URL <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={e => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/cert.pdf"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || availableEnrollments.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitting ? <><Loader size={16} className="spin" /> Issuing…</> : <><Award size={16} /> Issue Certificate</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <span className="stat-title">Total Issued</span>
          <span className="stat-value">{loading ? '…' : certs.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Eligible Students</span>
          <span className="stat-value">{loading ? '…' : availableEnrollments.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Active</span>
          <span className="stat-value">{loading ? '…' : certs.filter(c => c.status === 'active').length}</span>
        </div>
      </div>

      {/* Certificate list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading certificates…</p>
        </div>
      ) : certs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Award size={48} style={{ color: 'var(--primary)', opacity: 0.4, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            No certificates issued yet. Select an enrollment above to get started.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Issue First Certificate
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {certs.map(c => {
            const studentName = c.learner?.name || 'Unknown Student';
            const courseTitle = c.courseTitleSnapshot || c.course?.title || 'Unknown Course';
            const issuedOn = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

            return (
              <div
                key={c._id}
                className="glass-panel"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: c.status === 'active' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.status === 'active' ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  <Award size={22} />
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <h2 style={{ fontSize: '1rem', margin: 0 }}>{courseTitle}</h2>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      background: c.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: c.status === 'active' ? '#4ade80' : '#f87171',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>{c.status}</span>
                  </div>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Awarded to <strong style={{ color: 'var(--text-main)' }}>{studentName}</strong>
                    {c.issuerLabel ? ` · Issued by ${c.issuerLabel}` : ''} · {issuedOn}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {c.credentialId}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {c.pdfUrl && (
                    <a
                      href={c.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.7rem',
                      fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      color: '#f87171',
                      borderColor: 'rgba(239,68,68,0.3)',
                    }}
                    title="Revoke certificate"
                  >
                    {deletingId === c._id
                      ? <Loader size={14} />
                      : <Trash2 size={14} />}
                    Revoke
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TeacherCertificates;
