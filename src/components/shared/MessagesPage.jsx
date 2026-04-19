import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2, Loader, MessageSquare, Plus, X } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

// ── helpers ───────────────────────────────────────────────────────────────────

const getMe = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)  return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ── main component ────────────────────────────────────────────────────────────

const MessagesPage = ({ pageTitle = 'Messages', pageSubtitle = 'Your conversations.' }) => {
  const me = getMe();
  const myId = me?.id;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [newBody, setNewBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [toast, setToast] = useState(null);
  const bottomRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── derive thread list from all messages ──────────────────────────────────

  const threads = (() => {
    const seen = new Map();
    messages.forEach(m => {
      const otherId = m.sender?._id === myId || m.sender?.id === myId
        ? (m.recipient?._id || m.recipient?.id)
        : (m.sender?._id || m.sender?.id);
      const otherName = m.sender?._id === myId || m.sender?.id === myId
        ? m.recipient?.name
        : m.sender?.name;
      const otherEmail = m.sender?._id === myId || m.sender?.id === myId
        ? m.recipient?.email
        : m.sender?.email;

      if (!seen.has(otherId)) {
        seen.set(otherId, { id: otherId, name: otherName || otherEmail || 'Unknown', preview: m.body, time: m.createdAt, unread: !m.readAt && (m.recipient?._id === myId || m.recipient?.id === myId) });
      }
    });
    return Array.from(seen.values());
  })();

  // ── fetch all my messages ──────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/messages');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── fetch conversation when activeUserId changes ───────────────────────────

  useEffect(() => {
    if (!activeUserId) { setConversation([]); return; }
    let cancelled = false;
    const fetchConv = async () => {
      setConvLoading(true);
      try {
        const res = await fetchWithAuth(`/messages/conversation/${activeUserId}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (!cancelled) setConversation(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setConvLoading(false);
      }
    };
    fetchConv();
    return () => { cancelled = true; };
  }, [activeUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // ── send message ───────────────────────────────────────────────────────────

  const sendMessage = async (e) => {
    e.preventDefault();
    
    let targetEmail = recipientEmail.trim();
    if (activeUserId) {
      // If replying, find the email from the conversation/threads
      const thread = threads.find(t => t.id === activeUserId);
      if (thread) {
        // We need the email. Threads from fetchMessages have emails populated now.
        // Let's find it in the messages themselves to be safe.
        const msg = messages.find(m => 
          (m.sender?._id === activeUserId || m.sender?.id === activeUserId) ||
          (m.recipient?._id === activeUserId || m.recipient?.id === activeUserId)
        );
        targetEmail = msg?.sender?._id === activeUserId || msg?.sender?.id === activeUserId
          ? msg?.sender?.email
          : msg?.recipient?.email;
      }
    }

    if (!targetEmail || !newBody.trim()) return;

    if (targetEmail.toLowerCase().trim() === me?.email?.toLowerCase().trim()) {
      showToast('error', "You cannot send a message to yourself.");
      return;
    }

    setSending(true);
    try {
      const res = await fetchWithAuth('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: targetEmail, body: newBody.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Send failed');
      }
      const sent = await res.json();
      setNewBody('');
      setShowNewMsg(false);
      if (activeUserId) {
        setConversation(prev => [...prev, sent]);
      } else {
        // new thread — switch to it
        const newId = sent.recipient?._id || sent.recipient?.id || target;
        await fetchMessages();
        setActiveUserId(newId);
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSending(false);
    }
  };

  // ── delete a message ───────────────────────────────────────────────────────

  const deleteMessage = async (msgId) => {
    try {
      const res = await fetchWithAuth(`/messages/${msgId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setConversation(prev => prev.filter(m => m._id !== msgId));
      showToast('success', 'Message deleted.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const activeThread = threads.find(t => t.id === activeUserId);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000,
          padding: '0.85rem 1.4rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          backdropFilter: 'blur(12px)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{pageTitle}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{pageSubtitle}</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setShowNewMsg(v => !v); setActiveUserId(null); }}
        >
          <Plus size={16} /> New Message
        </button>
      </header>

      {/* New Message form */}
      {showNewMsg && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>New Message</h3>
            <button onClick={() => setShowNewMsg(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Recipient Email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              required
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
            <textarea
              placeholder="Write your message…"
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              required
              rows={3}
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {sending ? <Loader size={15} /> : <Send size={15} />} Send
            </button>
          </form>
        </div>
      )}

      {/* Main pane */}
      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', minHeight: '500px', padding: 0, overflow: 'hidden' }}>

        {/* Thread list */}
        <div style={{ borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader size={22} style={{ opacity: 0.5 }} />
            </div>
          ) : threads.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <MessageSquare size={32} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations yet.</p>
            </div>
          ) : (
            threads.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setActiveUserId(t.id); setShowNewMsg(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                  border: 'none', borderBottom: '1px solid var(--border-color)',
                  background: t.id === activeUserId ? 'rgba(99,102,241,0.12)' : 'transparent',
                  cursor: 'pointer', color: 'var(--text-main)', transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(t.time)}</span>
                </div>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.unread && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>● </span>}
                  {t.preview}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Conversation pane */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.12)' }}>
          {!activeUserId && !showNewMsg ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={40} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '0.9rem' }}>Select a conversation or start a new one.</p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              {activeThread && (
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{activeThread.name}</h2>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {convLoading ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem' }}>
                    <Loader size={22} style={{ opacity: 0.5 }} />
                  </div>
                ) : conversation.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem', fontSize: '0.9rem' }}>
                    No messages yet. Say hello! 👋
                  </p>
                ) : (
                  conversation.map(msg => {
                    const isMine = msg.sender?._id === myId || msg.sender?.id === myId;
                    return (
                      <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ position: 'relative', maxWidth: '72%' }}>
                          <div style={{
                            padding: '0.7rem 1rem',
                            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                            color: isMine ? 'white' : 'var(--text-main)',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                          }}>
                            {msg.body}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgo(msg.createdAt)}</span>
                            {isMine && (
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                title="Delete"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Send bar */}
              <form onSubmit={sendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <button
                  type="submit"
                  disabled={sending || !newBody.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {sending ? <Loader size={15} /> : <Send size={15} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
