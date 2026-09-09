import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', title: '', bio: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 460, padding: '64px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Join Ply</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>
        One account lets you both hire freelancers and offer your own gigs.
      </p>
      {error && <p className="error-banner">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" required value={form.name} onChange={update('name')} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={update('email')} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={form.password} onChange={update('password')} />
        </div>
        <div className="field">
          <label htmlFor="title">Professional title (optional)</label>
          <input id="title" placeholder="e.g. Logo designer" value={form.title} onChange={update('title')} />
        </div>
        <div className="field">
          <label htmlFor="bio">Short bio (optional)</label>
          <textarea id="bio" value={form.bio} onChange={update('bio')} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 14, color: 'var(--ink-soft)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
