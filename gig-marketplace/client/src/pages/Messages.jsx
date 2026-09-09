import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectPartner = searchParams.get('with');
  const preselectGig = searchParams.get('gig');

  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(preselectPartner || null);
  const [thread, setThread] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  function loadConversations() {
    api.get('/messages/conversations', token).then(setConversations).catch((err) => setError(err.message));
  }
  useEffect(loadConversations, [token]);

  function loadThread(partnerId) {
    if (!partnerId) return;
    api.get(`/messages/with/${partnerId}`, token).then(setThread).catch((err) => setError(err.message));
  }
  useEffect(() => {
    loadThread(activePartnerId);
  }, [activePartnerId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await api.post(
        '/messages',
        { receiverId: activePartnerId, body, gigId: preselectGig || undefined },
        token
      );
      setBody('');
      loadThread(activePartnerId);
      loadConversations();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container" style={{ padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
      <div>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Messages</h2>
        {conversations.length === 0 && !activePartnerId && (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No conversations yet.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.partnerId}
            onClick={() => setActivePartnerId(c.partnerId)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--line)',
              fontWeight: activePartnerId === c.partnerId ? 600 : 400,
            }}
          >
            <div>{c.partnerName}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.lastMessage}
            </div>
          </button>
        ))}
      </div>

      <div>
        {error && <p className="error-banner">{error}</p>}
        {!activePartnerId ? (
          <p style={{ color: 'var(--ink-soft)' }}>Select a conversation to view messages.</p>
        ) : (
          <>
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 4,
                padding: 16,
                minHeight: 320,
                maxHeight: 420,
                overflowY: 'auto',
                marginBottom: 16,
                background: 'var(--paper-raised)',
              }}
            >
              {thread.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: m.senderId === user.id ? 'flex-end' : 'flex-start',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: m.senderId === user.id ? 'var(--moss)' : 'var(--paper)',
                      color: m.senderId === user.id ? '#fff' : 'var(--ink)',
                      border: m.senderId === user.id ? 'none' : '1px solid var(--line)',
                      fontSize: 14,
                    }}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message…"
                style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 3 }}
              />
              <button className="btn btn-primary" type="submit">
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
