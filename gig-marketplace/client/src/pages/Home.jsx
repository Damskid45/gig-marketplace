import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import GigRow from '../components/GigRow';

export default function Home() {
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);

    api
      .get(`/gigs?${params.toString()}`)
      .then(setGigs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <h1 style={{ fontSize: 40, maxWidth: 560, lineHeight: 1.15, marginBottom: 12 }}>
        A marketplace for real work.
      </h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 17, maxWidth: 520, marginBottom: 36 }}>
        Browse gigs from independent freelancers, or list your own skills for people to hire.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <input
          placeholder="Search gigs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 14px',
            border: '1px solid var(--line)',
            borderRadius: 3,
            background: 'var(--paper-raised)',
          }}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 3, background: 'var(--paper-raised)' }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <hr className="divider" style={{ marginTop: 32 }} />

      {error && <p className="error-banner" style={{ marginTop: 16 }}>{error}</p>}
      {loading ? (
        <p style={{ padding: '24px 0', color: 'var(--ink-soft)' }}>Loading gigs…</p>
      ) : gigs.length === 0 ? (
        <p style={{ padding: '24px 0', color: 'var(--ink-soft)' }}>
          No gigs match yet. Try a different search, or be the first to post one.
        </p>
      ) : (
        <div>
          {gigs.map((gig, i) => (
            <React.Fragment key={gig.id}>
              <GigRow gig={gig} />
              {i < gigs.length - 1 && <hr className="divider" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
