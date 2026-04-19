import React, { useState, useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
import FeatureCard from '../../components/shared/FeatureCard';
import { fetchWithAuth } from '../../utils/api';

const TeacherOverview = () => {
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    category: '',
    author: '',
    contentType: 'pdf',
    courseFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const addCourseFormRef = useRef(null);

  useEffect(() => {
    if (showAddCourseForm && addCourseFormRef.current) {
      addCourseFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAddCourseForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        courseFile: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.desc || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.courseFile) {
      setError('Please upload a file');
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('desc', formData.desc);
      formDataObj.append('category', formData.category);
      formDataObj.append('author', formData.author);
      formDataObj.append('contentType', formData.contentType);
      formDataObj.append('courseFile', formData.courseFile);

      const response = await fetchWithAuth('/courses', {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      setSuccess('Course created successfully!');
      setFormData({
        title: '',
        desc: '',
        category: '',
        author: '',
        contentType: 'pdf',
        courseFile: null,
      });

      setTimeout(() => {
        setShowAddCourseForm(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Course creation error:', err);
      setError(err.message || 'Failed to create course. Is the backend server running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your teaching stats today.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div className="stat-card">
          <span className="stat-title">Total Students Taught</span>
          <span className="stat-value">128</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Active Classes</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Average Rating</span>
          <span className="stat-value">4.9/5</span>
        </div>
      </div>

      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <h2 style={{ fontSize: '1.5rem' }}>Upcoming Classes</h2>
          <button
            type="button"
            onClick={() => setShowAddCourseForm((open) => !open)}
            className="btn btn-primary"
          >
            + New Course
          </button>
        </div>

        {showAddCourseForm && (
          <div
            ref={addCourseFormRef}
            className="glass-panel"
            style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', zIndex: 2 }}
          >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Add New Course</h3>

            {error && <div style={{ color: 'white', backgroundColor: 'var(--secondary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ color: 'white', backgroundColor: '#22c55e', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Advanced React Patterns"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="input-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                  >
                    <option value="">Select a category</option>
                    <option value="PROGRAMMING">Programming</option>
                    <option value="DESIGN">Design</option>
                    <option value="LANGUAGES">Languages</option>
                    <option value="BUSINESS">Business</option>
                    <option value="MUSIC">Music</option>
                    <option value="FITNESS">Fitness</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Author/Instructor Name</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Your name (optional)"
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Course Description *</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  placeholder="Describe what students will learn..."
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group">
                  <label>Content Type *</label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                  >
                    <option value="pdf">PDF File</option>
                    <option value="text-file">Text File (.txt)</option>
                    <option value="video">Video File (MP4, WebM, MOV, AVI, MKV)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{formData.contentType === 'video' ? 'Video File' : formData.contentType === 'pdf' ? 'PDF File' : 'Text File'} *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={formData.contentType === 'pdf' ? '.pdf' : formData.contentType === 'text-file' ? '.txt' : '.mp4,.webm,.mov,.avi,.mkv'}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              {formData.courseFile && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Selected File:</p>
                  <p style={{ color: 'var(--text-main)' }}>
                    {formData.contentType === 'video' ? '🎬' : formData.contentType === 'pdf' ? '📄' : '📝'} {formData.courseFile.name} ({(formData.courseFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCourseForm(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1.5rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '0.7rem 1.5rem' }}
                >
                  {loading ? 'Creating...' : '✓ Create Course'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="skills-grid" style={{ paddingTop: 0, position: 'relative', zIndex: 1 }}>
          <FeatureCard
            icon={Code2}
            category="PROGRAMMING"
            title="Advanced React Patterns"
            desc="Session 4: Custom Hooks and Performance. Starts in 2 hours."
            author="Alex D."
          />
        </div>
      </section>
    </>
  );
};

export default TeacherOverview;
