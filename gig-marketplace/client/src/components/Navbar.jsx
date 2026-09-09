import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header style={{ borderBottom: '1px solid var(--line)', background: 'var(--paper-raised)' }}>
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>Ply</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 15 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            Browse
          </Link>
          {user ? (
            <>
              <Link to="/post-a-gig" style={{ textDecoration: 'none' }}>
                Post a gig
              </Link>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                Dashboard
              </Link>
              <Link to="/messages" style={{ textDecoration: 'none' }}>
                Messages
              </Link>
              <span style={{ color: 'var(--ink-soft)' }}>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join Ply
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
