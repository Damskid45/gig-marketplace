import React from 'react';
import { Link } from 'react-router-dom';

export default function GigRow({ gig }) {
  return (
    <Link
      to={`/gigs/${gig.id}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 24,
        padding: '22px 0',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 20, marginBottom: 6 }}>{gig.title}</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 10 }}>
          {gig.freelancer?.name}
          {gig.freelancer?.title ? ` · ${gig.freelancer.title}` : ''}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {gig.Category?.name && <span className="tag">{gig.Category.name}</span>}
          {gig.avgRating != null && (
            <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
              ★ {gig.avgRating.toFixed(1)} ({gig.reviewCount})
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 100 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>${Number(gig.price).toFixed(0)}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{gig.deliveryDays}-day delivery</div>
      </div>
    </Link>
  );
}
