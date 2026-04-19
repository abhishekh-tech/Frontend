import React, { useState, useEffect, useRef } from 'react';
import { Zap, Plus, Edit2, Trash2, Loader, Code2, Palette, Globe, BookOpen, GraduationCap, Music, Dumbbell, FileText, Video, ExternalLink } from 'lucide-react';
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

const TeacherSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    category: 'PROGRAMMING',
    level: 'beginner',
    contentType: 'text',
    skillFile: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?._id;
      
      const url = userId 
        ? `/skills?createdBy=${userId}`
        : '/skills';

      const response = await fetchWithAuth(url);
      const data = await response.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch skills error:', err);
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, skillFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingSkill 
        ? `/skills/${editingSkill._id}`
        : '/skills';
      
      const method = editingSkill ? 'PUT' : 'POST';

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('desc', formData.desc);
      formDataObj.append('category', formData.category);
      formDataObj.append('level', formData.level);
      formDataObj.append('contentType', formData.contentType);
      if (formData.skillFile) {
        formDataObj.append('skillFile', formData.skillFile);
      }

      const response = await fetchWithAuth(url, {
        method,
        body: formDataObj,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save skill');
      }

      setSuccess(`Skill ${editingSkill ? 'updated' : 'created'} successfully!`);
      setFormData({ title: '', desc: '', category: 'PROGRAMMING', level: 'beginner', contentType: 'text', skillFile: null });
      setEditingSkill(null);
      
      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
        fetchSkills();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      title: skill.title,
      desc: skill.desc,
      category: skill.category,
      level: skill.level,
      contentType: skill.content?.type || 'text',
      skillFile: null,
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetchWithAuth(`/skills/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete skill');
      fetchSkills();
    } catch (err) {
      setError(err.message);
    }
  };

  const getContentIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={14} />;
      case 'pdf': return <FileText size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Managed Skills</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage the skills you offer to the community.</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingSkill(null);
              setFormData({ title: '', desc: '', category: 'PROGRAMMING', level: 'beginner', contentType: 'text', skillFile: null });
            }
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> New Skill</>}
        </button>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#f87171', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '12px', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
          {success}
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label>Skill Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., UI/UX Design with Figma"
                />
              </div>
              <div className="input-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="PROGRAMMING">Programming</option>
                  <option value="DESIGN">Design</option>
                  <option value="LANGUAGES">Languages</option>
                  <option value="BUSINESS">Business</option>
                  <option value="MUSIC">Music</option>
                  <option value="FITNESS">Fitness</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Skill Level *</label>
                <select name="level" value={formData.level} onChange={handleInputChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label>Content Type *</label>
                <select name="contentType" value={formData.contentType} onChange={handleInputChange}>
                  <option value="text">Text / Article</option>
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video File</option>
                </select>
              </div>
              <div className="input-group">
                <label>{formData.contentType === 'video' ? 'Video File' : formData.contentType === 'pdf' ? 'PDF File' : 'Text File'} {editingSkill ? '(Optional)' : '*'}</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept={formData.contentType === 'pdf' ? '.pdf' : formData.contentType === 'video' ? 'video/*' : '.txt'}
                  required={!editingSkill && formData.contentType !== 'text'}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Description *</label>
              <textarea 
                name="desc" 
                value={formData.desc} 
                onChange={handleInputChange}
                required
                placeholder="Describe what learners will gain from this skill..."
                rows={4}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ minWidth: '150px' }}>
                {formLoading ? <Loader className="animate-spin" size={18} /> : (editingSkill ? 'Update Skill' : 'Create Skill')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Loader className="animate-spin" size={40} style={{ marginBottom: '1rem' }} />
          <p>Loading your skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Zap size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
          <h3>No Skills Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't listed any skills yet. Share your expertise with the world!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Create Your First Skill</button>
        </div>
      ) : (
        <div className="skills-grid" style={{ paddingTop: 0 }}>
          {skills.map(skill => (
            <FeatureCard
              key={skill._id}
              icon={CATEGORY_ICONS[skill.category] || Zap}
              category={<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{skill.category} • {skill.level.toUpperCase()} {skill.content && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontSize: '0.7rem' }}>{getContentIcon(skill.content.type)}</span>} </div>}
              title={skill.title}
              desc={skill.desc}
              author="You"
              actionButton={
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(skill)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(skill._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px', color: '#f87171' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSkills;
