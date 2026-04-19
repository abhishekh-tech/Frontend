import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Palette, BookOpen, GraduationCap, BookOpenCheck, Trash2, Loader, Music, Dumbbell } from 'lucide-react';
import FeatureCard from '../../components/shared/FeatureCard';
import { fetchWithAuth } from '../../utils/api';

const CATEGORY_ICONS = {
  PROGRAMMING: Code2,
  DESIGN: Palette,
  LANGUAGES: Globe,
  BUSINESS: BookOpen,
  MUSIC: Music,
  FITNESS: Dumbbell,
  OTHER: GraduationCap,
};

const ICON_OPTIONS = [Code2, Globe, Palette, BookOpen, GraduationCap];

const contentLabel = (c) => {
  const t = c.content?.type;
  if (t === 'video') return '🎬 Video';
  if (t === 'pdf') return '📄 PDF';
  if (t === 'text-file' || t === 'text') return '📝 Text';
  return '📦 Material';
};

const TeacherMyClasses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/courses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(
          data.map((course, idx) => ({
            ...course,
            icon: CATEGORY_ICONS[course.category] || ICON_OPTIONS[idx % ICON_OPTIONS.length],
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      showToast('error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Delete "${courseTitle}"? This cannot be undone.`)) return;
    setDeletingId(courseId);
    try {
      const res = await fetchWithAuth(`/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }
      setCourses(prev => prev.filter(c => c._id !== courseId));
      showToast('success', `"${courseTitle}" deleted.`);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000,
          padding: '0.85rem 1.4rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {toast.msg}
        </div>
      )}

      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>My Classes</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} published`}
          </p>
        </div>
        <Link to="/dashboard/teacher" className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.9rem' }}>
          + New Course
        </Link>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading your classes…</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <BookOpenCheck size={44} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.85 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            You have not published any courses yet. Create your first class from the teacher overview.
          </p>
          <Link to="/dashboard/teacher" className="btn btn-primary">
            Go to Overview
          </Link>
        </div>
      ) : (
        <div className="skills-grid" style={{ paddingTop: 0 }}>
          {courses.map((course) => (
            <FeatureCard
              key={course._id}
              icon={course.icon}
              category={course.category}
              title={course.title}
              desc={course.desc || 'No description provided.'}
              author={course.author || 'You'}
              actionButton={
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', pointerEvents: 'none', opacity: 0.9 }}>
                    {contentLabel(course)}
                  </span>
                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    disabled={deletingId === course._id}
                    title="Delete course"
                    style={{
                      background: 'none',
                      border: '1px solid rgba(239,68,68,0.35)',
                      borderRadius: '6px',
                      padding: '0.3rem 0.5rem',
                      cursor: 'pointer',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {deletingId === course._id ? <Loader size={13} /> : <Trash2 size={13} />}
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TeacherMyClasses;
