import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PostGig() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', deliveryDays: 3, categoryId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const gig = await api.post(
        '/gigs',
        { ...form, price: Number(form.price), deliveryDays: Number(form.deliveryDays) },
        token
      );
      navigate(`/gigs/${gig.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560, padding: '48px 24px 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Post a gig</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>Describe the service you're offering.</p>
      {error && <p className="error-banner">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            required
            placeholder="I will build a responsive React website"
            value={form.title}
            onChange={update('title')}
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" required value={form.description} onChange={update('description')} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="price">Price (USD)</label>
            <input id="price" type="number" min="1" required value={form.price} onChange={update('price')} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="deliveryDays">Delivery (days)</label>
            <input
              id="deliveryDays"
              type="number"
              min="1"
              required
              value={form.deliveryDays}
              onChange={update('deliveryDays')}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" value={form.categoryId} onChange={update('categoryId')}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish gig'}
        </button>
      </form>
    </div>
  );
}
