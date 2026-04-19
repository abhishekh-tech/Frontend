import React, { useState, useEffect } from 'react';
import { User, Loader, UsersRound } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const statusColor = (s) => {
  if (s === 'completed') return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' };
  if (s === 'dropped')   return { bg: 'rgba(239,68,68,0.12)', color: '#f87171' };
  return { bg: 'rgba(99,102,241,0.12)', color: 'var(--primary)' };
};

const TeacherStudents = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetchWithAuth('/enrollments');
        if (!res.ok) throw new Error('Failed to fetch enrollments');
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Could not load enrollment data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Students</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${enrollments.length} enrollment${enrollments.length !== 1 ? 's' : ''} across all classes`}
          </p>
        </div>
        {/* Stat chips */}
        {!loading && enrollments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['active', 'completed', 'dropped'].map(s => {
              const count = enrollments.filter(e => e.status === s).length;
              if (count === 0) return null;
              const { bg, color } = statusColor(s);
              return (
                <span key={s} style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', background: bg, color, fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  {count} {s}
                </span>
              );
            })}
          </div>
        )}
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading students…</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
          {error}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <UsersRound size={48} style={{ color: 'var(--primary)', opacity: 0.4, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No students enrolled yet. Courses that learners join will appear here.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'minmax(140px, 1fr) minmax(180px, 1.6fr) minmax(110px, 140px) minmax(80px, 100px) minmax(90px, 110px)',
            gap: '1rem',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
            fontWeight: 700,
          }}>
            <span>Student</span>
            <span>Course</span>
            <span>Progress</span>
            <span>Status</span>
            <span>Enrolled On</span>
          </div>

          {enrollments.map((e) => {
            const studentName = e.user?.name || 'Unknown Student';
            const studentEmail = e.user?.email || '';
            const courseTitle = e.course?.title || 'Unknown Course';
            const { bg, color } = statusColor(e.status);
            const enrolledOn = e.createdAt
              ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—';

            return (
              <div
                key={e._id}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 1fr) minmax(180px, 1.6fr) minmax(110px, 140px) minmax(80px, 100px) minmax(90px, 110px)',
                  gap: '1rem',
                  alignItems: 'center',
                  color: 'var(--text-main)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e2 => e2.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e2 => e2.currentTarget.style.background = 'transparent'}
              >
                {/* Student */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentName}</div>
                    {studentEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentEmail}</div>}
                  </div>
                </div>

                {/* Course */}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {courseTitle}
                </span>

                {/* Progress bar */}
                <div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '0.3rem' }}>
                    <div style={{ width: `${e.progress || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.progress || 0}%</span>
                </div>

                {/* Status badge */}
                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: bg, color, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', width: 'fit-content' }}>
                  {e.status || 'active'}
                </span>

                {/* Enrolled on */}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{enrolledOn}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TeacherStudents;
