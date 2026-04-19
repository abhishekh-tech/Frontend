import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Code2, Globe, BookOpen, GraduationCap, Music, Dumbbell, Loader } from 'lucide-react';
import FeatureCard from '../../components/shared/FeatureCard';
import { fetchWithAuth, API_BASE_URL } from '../../utils/api';

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

const LearnerOverview = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [selectedCourseContent, setSelectedCourseContent] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch both enrollments + all courses ──────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [enrollRes, coursesRes] = await Promise.all([
      const [enrollRes, coursesRes] = await Promise.all([
        fetchWithAuth('/enrollments'),
        fetchWithAuth('/courses'),
      ]);
      ]);
      const [enrollData, coursesData] = await Promise.all([
        enrollRes.json(),
        coursesRes.json(),
      ]);

      const myEnrollments = Array.isArray(enrollData) ? enrollData : [];
      const allCourses = Array.isArray(coursesData) ? coursesData : [];

      // IDs of courses already enrolled in
      const enrolledIds = new Set(
        myEnrollments.map(e => e.course?._id || e.course)
      );

      // Enrolled courses — pull course data from populated enrollment
      const enrolled = myEnrollments.map((e, idx) => {
        const course = e.course || {};
        return {
          _id: course._id || e._id,
          enrollmentId: e._id,
          icon: CATEGORY_ICONS[course.category] || ICON_OPTIONS[idx % ICON_OPTIONS.length],
          category: course.category || 'OTHER',
          title: course.title || 'Unknown Course',
          desc: course.desc || '',
          author: course.author || 'Instructor',
          progress: e.progress || 0,
          status: e.status || 'active',
          content: course.content,
        };
      });

      // Available = all courses not already enrolled
      const available = allCourses
        .filter(c => !enrolledIds.has(c._id))
        .map((c, idx) => ({
          ...c,
          icon: CATEGORY_ICONS[c.category] || ICON_OPTIONS[idx % ICON_OPTIONS.length],
        }));

      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Enroll action ─────────────────────────────────────────────────────────

  const enrollCourse = async (course) => {
    setEnrollingId(course._id);
    try {
      const res = await fetchWithAuth('/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: course._id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Enrollment failed');
      }
      showToast('success', `Enrolled in "${course.title}"!`);
      fetchData(); // Refresh both lists
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  // ── Fetch Text Content ───────────────────────────────────────────────────
  useEffect(() => {
    if (selectedCourseContent && selectedCourseContent.content?.type === 'text') {
      const fetchText = async () => {
        setTextLoading(true);
        setTextContent('');
        try {
          const res = await fetchWithAuth(`/courses/${selectedCourseContent._id}/stream`);
          const text = await res.text();
          setTextContent(text);
        } catch (err) {
          console.error('Text fetch error:', err);
          setTextContent('Failed to load text content.');
        } finally {
          setTextLoading(false);
        }
      };
      fetchText();
    } else {
      setTextContent('');
    }
  }, [selectedCourseContent]);

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

      {/* Course content viewer modal */}
      {selectedCourseContent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedCourseContent(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}
            >✕</button>
            <div style={{ paddingRight: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>{selectedCourseContent.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>by {selectedCourseContent.author}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {selectedCourseContent.content?.type === 'video' ? '🎬 Video Preview' : selectedCourseContent.content?.type === 'pdf' ? '📄 PDF Document Preview' : '📝 Text Preview'}
                </p>

                {/* Video Player */}
                {selectedCourseContent.content?.type === 'video' && (
                  <div style={{ textAlign: 'center' }}>
                    <video controls style={{ width: '100%', maxHeight: '500px', backgroundColor: '#000', borderRadius: '6px' }}>
                      <source src={`${API_BASE_URL}/courses/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}`} type={selectedCourseContent.content.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* PDF Preview */}
                {selectedCourseContent.content?.type === 'pdf' && (
                  <div style={{ width: '100%', height: '500px', borderRadius: '6px', overflow: 'hidden', background: '#333' }}>
                    <iframe
                      src={`${API_BASE_URL}/courses/${selectedCourseContent._id}/stream?token=${localStorage.getItem('token')}#toolbar=0`}
                      width="100%"
                      height="100%"
                      title="PDF Preview"
                      style={{ border: 'none' }}
                    ></iframe>
                  </div>
                )}

                {/* Text Preview */}
                {selectedCourseContent.content?.type === 'text' && (
                  <div style={{ width: '100%', maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {textLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}><Loader size={20} className="animate-spin" /> Loading text content...</div>
                    ) : (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {textContent}
                      </pre>
                    )}
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>{selectedCourseContent.content?.fileName}</p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `${API_BASE_URL}/courses/${selectedCourseContent._id}/download?token=${localStorage.getItem('token')}`;
                      link.download = selectedCourseContent.content.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                      background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', 
                      border: '1px solid var(--primary)', padding: '0.5rem 1rem', 
                      borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                  >
                    ⬇ Download
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCourseContent(null)} 
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ready to continue your learning journey?</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div className="stat-card">
          <span className="stat-title">Active Enrollments</span>
          <span className="stat-value">{loading ? '…' : enrolledCourses.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Available Courses</span>
          <span className="stat-value">{loading ? '…' : availableCourses.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Courses Platform-wide</span>
          <span className="stat-value">{loading ? '…' : enrolledCourses.length + availableCourses.length}</span>
        </div>
      </div>

      {/* Active Enrollments */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Enrollments</h2>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader size={18} /> Loading your enrollments…
          </div>
        ) : enrolledCourses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't enrolled in any courses yet. Enroll from the list below!</p>
        ) : (
          <div className="skills-grid" style={{ paddingTop: 0 }}>
            {enrolledCourses.map(course => (
              <FeatureCard
                key={course._id}
                icon={course.icon}
                category={course.category}
                title={course.title}
                desc={course.desc || `Progress: ${course.progress}%`}
                author={course.author}
                actionButton={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{course.progress}%</span>
                    </div>
                    <button
                      onClick={() => setSelectedCourseContent(course)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      View Content
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Available Courses</h2>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader size={18} /> Loading courses…
          </div>
        ) : availableCourses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            {enrolledCourses.length > 0
              ? "You're enrolled in all available courses. 🎉"
              : 'No courses available yet. Check back soon!'}
          </p>
        ) : (
          <div className="skills-grid" style={{ paddingTop: 0 }}>
            {availableCourses.map(course => (
              <FeatureCard
                key={course._id}
                icon={course.icon}
                category={course.category}
                title={course.title}
                desc={course.desc}
                author={course.author}
                actionButton={
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedCourseContent(course)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                    >
                      View Content
                    </button>
                    <button
                      onClick={() => enrollCourse(course)}
                      disabled={enrollingId === course._id}
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1, zIndex: 10 }}
                    >
                      {enrollingId === course._id ? <Loader size={13} /> : 'Enroll'}
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default LearnerOverview;
