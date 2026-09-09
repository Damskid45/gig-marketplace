import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [gig, setGig] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    api.get(`/gigs/${id}`).then(setGig).catch((err) => setError(err.message));
  }, [id]);

  const reviews = (gig?.Orders || []).map((o) => o.Review).filter(Boolean);
  const isOwnGig = user && gig && gig.freelancerId === user.id;

  async function handleOrder(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    setError('');
    setPlacing(true);
    try {
      await api.post('/orders', { gigId: id, requirements }, token);
      setPlaced(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  async function handleMessage() {
    if (!user) return navigate('/login');
    navigate(`/messages?with=${gig.freelancerId}&gig=${gig.id}`);
  }

  if (error && !gig) return <div className="container" style={{ padding: 48 }}><p className="error-banner">{error}</p></div>;
  if (!gig) return <div className="container" style={{ padding: 48 }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48 }}>
      <div>
        {gig.Category?.name && <span className="tag" style={{ marginBottom: 12, display: 'inline-block' }}>{gig.Category.name}</span>}
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>{gig.title}</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>
          By <Link to="#">{gig.freelancer?.name}</Link>
          {gig.freelancer?.title ? ` · ${gig.freelancer.title}` : ''}
        </p>

        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>{gig.description}</p>

        {gig.freelancer?.bio && (
          <>
            <hr className="divider" />
            <h3 style={{ fontSize: 18, margin: '24px 0 8px' }}>About {gig.freelancer.name}</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>{gig.freelancer.bio}</p>
          </>
        )}

        <hr className="divider" />
        <h3 style={{ fontSize: 18, margin: '24px 0 16px' }}>
          Reviews {gig.avgRating != null && `· ★ ${gig.avgRating.toFixed(1)} (${gig.reviewCount})`}
        </h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>No reviews yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 500 }}>★ {r.rating}/5</p>
              {r.comment && <p style={{ color: 'var(--ink-soft)' }}>{r.comment}</p>}
            </div>
          ))
        )}
      </div>

      <div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 24, background: 'var(--paper-raised)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 4 }}>
            ${Number(gig.price).toFixed(0)}
          </div>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>{gig.deliveryDays}-day delivery</p>

          {isOwnGig ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>This is your own gig.</p>
          ) : placed ? (
            <p style={{ color: 'var(--moss-dark)' }}>
              Order placed! Check your <Link to="/dashboard">dashboard</Link> for status.
            </p>
          ) : (
            <form onSubmit={handleOrder}>
              {error && <p className="error-banner">{error}</p>}
              <div className="field">
                <label htmlFor="requirements">What do you need? (optional)</label>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Any details the freelancer should know before starting."
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={placing} style={{ width: '100%', marginBottom: 10 }}>
                {placing ? 'Placing order…' : `Order for $${Number(gig.price).toFixed(0)}`}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleMessage} style={{ width: '100%' }}>
                Message seller
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
