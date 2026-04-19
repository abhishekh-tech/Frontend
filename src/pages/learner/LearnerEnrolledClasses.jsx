import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Palette, BookOpen, GraduationCap, Music, Dumbbell, Loader, GraduationCap as GradCap } from 'lucide-react';
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

const statusBadge = (status) => {
  const map = {
    active:    { bg: 'rgba(99,102,241,0.15)',  color: 'var(--primary)', label: 'Active' },
    completed: { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',        label: 'Completed' },
    dropped:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',        label: 'Dropped' },
  };
  return map[status] || map.active;
};

const LearnerEnrolledClasses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetchWithAuth('/enrollments');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const mapped = enrollments.map((e, idx) => {
    const course = e.course || {};
    return {
      _id: course._id || e._id,
      icon: CATEGORY_ICONS[course.category] || GraduationCap,
      category: course.category || 'OTHER',
      title: course.title || 'Unknown Course',
      desc: course.desc || '',
      author: course.author || 'Instructor',
      progress: e.progress || 0,
      status: e.status || 'active',
      content: course.content,
      enrolledOn: e.createdAt,
    };
  });

  return (
    <>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Enrolled Classes</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Courses you are currently taking or have completed.
        </p>
      </header>

      {/* Summary chips */}
      {!loading && enrollments.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['active', 'completed', 'dropped'].map(s => {
            const count = enrollments.filter(e => e.status === s).length;
            if (count === 0) return null;
            const badge = statusBadge(s);
            return (
              <div key={s} className="stat-card" style={{ padding: '0.85rem 1.25rem', minWidth: 0 }}>
                <span className="stat-title" style={{ textTransform: 'capitalize' }}>{badge.label}</span>
                <span className="stat-value" style={{ color: badge.color, fontSize: '1.6rem' }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading your classes…</p>
        </div>
      ) : mapped.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <GradCap size={48} style={{ color: 'var(--primary)', opacity: 0.4, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You haven't enrolled in any courses yet.
          </p>
          <Link to="/dashboard/learner" className="btn btn-primary">Browse Available Courses</Link>
        </div>
      ) : (
        <div className="skills-grid" style={{ paddingTop: 0 }}>
          {mapped.map(course => {
            const badge = statusBadge(course.status);
            return (
              <FeatureCard
                key={course._id}
                icon={course.icon}
                category={course.category}
                title={course.title}
                desc={course.desc}
                author={course.author}
                actionButton={
                  <div style={{ width: '100%' }}>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: badge.color, borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{course.progress}%</span>
                    </div>
                    {/* Status badge */}
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', background: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {badge.label}
                    </span>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default LearnerEnrolledClasses;
