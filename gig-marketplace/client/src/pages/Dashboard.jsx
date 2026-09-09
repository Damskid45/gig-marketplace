import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TABS = ['My gigs', 'My orders', 'Incoming orders'];

export default function Dashboard() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('My gigs');

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--line)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--moss)' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--ink)' : 'var(--ink-soft)',
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'My gigs' && <MyGigs token={token} />}
      {tab === 'My orders' && <MyOrders token={token} />}
      {tab === 'Incoming orders' && <IncomingOrders token={token} />}
    </div>
  );
}

function MyGigs({ token }) {
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/gigs/mine', token).then(setGigs).catch((err) => setError(err.message));
  }, [token]);

  async function toggleActive(gig) {
    try {
      const updated = await api.put(`/gigs/${gig.id}`, { isActive: !gig.isActive }, token);
      setGigs((gs) => gs.map((g) => (g.id === gig.id ? updated : g)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error-banner">{error}</p>;
  if (gigs.length === 0)
    return (
      <p style={{ color: 'var(--ink-soft)' }}>
        You haven't posted any gigs yet. <Link to="/post-a-gig">Post your first one</Link>.
      </p>
    );

  return (
    <div>
      {gigs.map((gig, i) => (
        <React.Fragment key={gig.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
            <div>
              <Link to={`/gigs/${gig.id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: 18 }}>{gig.title}</h3>
              </Link>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
                ${Number(gig.price).toFixed(0)} · {gig.isActive ? 'Active' : 'Paused'}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => toggleActive(gig)}>
              {gig.isActive ? 'Pause' : 'Reactivate'}
            </button>
          </div>
          {i < gigs.length - 1 && <hr className="divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function MyOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  function reload() {
    api.get('/orders/mine', token).then(setOrders).catch((err) => setError(err.message));
  }
  useEffect(reload, [token]);

  async function markCompleted(order) {
    try {
      const updated = await api.patch(`/orders/${order.id}/status`, { status: 'completed' }, token);
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(order, rating, comment) {
    try {
      await api.post(`/orders/${order.id}/review`, { rating, comment }, token);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error-banner">{error}</p>;
  if (orders.length === 0) return <p style={{ color: 'var(--ink-soft)' }}>You haven't ordered any gigs yet.</p>;

  return (
    <div>
      {orders.map((order, i) => (
        <React.Fragment key={order.id}>
          <OrderRow
            order={order}
            role="buyer"
            onMarkCompleted={() => markCompleted(order)}
            onSubmitReview={(rating, comment) => submitReview(order, rating, comment)}
          />
          {i < orders.length - 1 && <hr className="divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function IncomingOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  function reload() {
    api.get('/orders/incoming', token).then(setOrders).catch((err) => setError(err.message));
  }
  useEffect(reload, [token]);

  async function updateStatus(order, status) {
    try {
      const updated = await api.patch(`/orders/${order.id}/status`, { status }, token);
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error-banner">{error}</p>;
  if (orders.length === 0) return <p style={{ color: 'var(--ink-soft)' }}>No orders yet on your gigs.</p>;

  return (
    <div>
      {orders.map((order, i) => (
        <React.Fragment key={order.id}>
          <OrderRow order={order} role="freelancer" onUpdateStatus={(status) => updateStatus(order, status)} />
          {i < orders.length - 1 && <hr className="divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderRow({ order, role, onUpdateStatus, onMarkCompleted, onSubmitReview }) {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div style={{ padding: '18px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 17 }}>{order.Gig?.title}</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 4 }}>
            {role === 'buyer' ? `Seller: ${order.Gig?.freelancer?.name}` : `Buyer: ${order.buyer?.name}`} · $
            {Number(order.price).toFixed(0)}
          </p>
          {order.requirements && (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6 }}>"{order.requirements}"</p>
          )}
        </div>
        <span className={`status-pill status-${order.status}`}>{order.status.replace('_', ' ')}</span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {role === 'freelancer' && order.status === 'pending' && (
          <button className="btn btn-secondary" onClick={() => onUpdateStatus('in_progress')}>
            Start work
          </button>
        )}
        {role === 'freelancer' && order.status === 'in_progress' && (
          <button className="btn btn-secondary" onClick={() => onUpdateStatus('delivered')}>
            Mark delivered
          </button>
        )}
        {role === 'buyer' && order.status === 'delivered' && (
          <button className="btn btn-primary" onClick={onMarkCompleted}>
            Confirm & complete
          </button>
        )}
        {role === 'buyer' && order.status === 'completed' && !order.Review && !showReview && (
          <button className="btn btn-secondary" onClick={() => setShowReview(true)}>
            Leave a review
          </button>
        )}
      </div>

      {showReview && (
        <div style={{ marginTop: 12, padding: 16, border: '1px solid var(--line)', borderRadius: 4 }}>
          <div className="field">
            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSubmitReview(rating, comment);
              setShowReview(false);
            }}
          >
            Submit review
          </button>
        </div>
      )}
    </div>
  );
}
