import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/messages';

const AURAS = [
  { id: 'joy', label: '☀️ Pure Joy', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.35)' },
  { id: 'love', label: '💖 Warm Love', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.35)' },
  { id: 'peace', label: '🌿 Deep Peace', color: '#34d399', glow: 'rgba(52, 211, 153, 0.35)' },
  { id: 'wonder', label: '🔮 Cosmic Wonder', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.35)' },
];

const PROMPTS = [
  "A small moment that made me smile today...",
  "Someone who made my life a little easier recently...",
  "Something in nature or my surroundings I appreciate...",
  "A challenge that helped me grow stronger...",
  "A simple comfort I'm enjoying right now..."
];

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [selectedAura, setSelectedAura] = useState(AURAS[0]);
  const [isSending, setIsSending] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [resonatedIds, setResonatedIds] = useState({});
  const [promptIndex, setPromptIndex] = useState(0);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(API_URL);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerSparkleBurst = () => {
    const newBursts = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
      emoji: ['✨', '🌟', '💫', '💛', '🌸'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.3,
    }));
    setBursts(newBursts);
    setTimeout(() => setBursts([]), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      // Sends aura along with name & text (safe even if backend ignores extra fields)
      await axios.post(API_URL, {
        name: name.trim() || 'A Grateful Soul',
        text,
        aura: selectedAura.id,
      });
      setText('');
      triggerSparkleBurst();
      await fetchMessages();
    } catch (err) {
      console.error('Error posting message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleResonate = (id) => {
    setResonatedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const cyclePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
  };

  const getAuraStyle = (auraId) => {
    return AURAS.find((a) => a.id === auraId) || AURAS[3];
  };

  return (
    <div className="cosmic-wrapper">
      {/* Animated Warm Nebula Orbs */}
      <div className="nebula-orb orb-1"></div>
      <div className="nebula-orb orb-2"></div>
      <div className="nebula-orb orb-3"></div>

      {/* Floating Sparkle Burst on Submit */}
      <div className="burst-layer">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="floating-sparkle"
            style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}
          >
            {b.emoji}
          </span>
        ))}
      </div>

      <div className="universe-container">
        <header className="cosmic-header">
          <div className="badge-pill">🌌 Collective Gratitude Wall</div>
          <h1>✨ Gratitude to the Universe ✨</h1>
          <p className="subtitle">
            Pause, breathe, and release a warm thought into the cosmos.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="gratitude-form"
          style={{
            boxShadow: `0 12px 40px ${selectedAura.glow}`,
            borderColor: selectedAura.color,
          }}
        >
          <div className="form-top-row">
            <input
              type="text"
              placeholder="Your Name (or stay anonymous)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cosmic-input"
            />
            <button
              type="button"
              onClick={cyclePrompt}
              className="inspire-btn"
              title="Get a gratitude prompt"
            >
              💡 Inspire me
            </button>
          </div>

          <div className="textarea-wrapper">
            <textarea
              placeholder={PROMPTS[promptIndex]}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              required
              className="cosmic-textarea"
            />
            <span className={`char-counter ${text.length > 250 ? 'near-limit' : ''}`}>
              {text.length}/280
            </span>
          </div>

          {/* Emotional Aura Selector */}
          <div className="aura-selector">
            <span className="aura-label">Choose your feeling:</span>
            <div className="aura-pills">
              {AURAS.map((aura) => (
                <button
                  key={aura.id}
                  type="button"
                  onClick={() => setSelectedAura(aura)}
                  className={`aura-pill ${selectedAura.id === aura.id ? 'active' : ''}`}
                  style={{
                    '--aura-color': aura.color,
                    '--aura-glow': aura.glow,
                  }}
                >
                  {aura.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`submit-btn ${isSending ? 'sending' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${selectedAura.color}, #ec4899, #8b5cf6)`,
            }}
          >
            {isSending ? 'Releasing into the stars... 🌠' : 'Release Gratitude to the Universe 🚀'}
          </button>
        </form>

        <div className="feed-header">
          <h2>Radiating Across the Cosmos</h2>
          <span className="live-indicator">
            <span className="pulse-dot"></span> {messages.length} thoughts shining
          </span>
        </div>

        <div className="message-feed">
          {messages.length === 0 ? (
            <div className="empty-cosmos">
              <p>The sky is quiet right now. Be the first star to shine! 🌟</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const aura = getAuraStyle(msg.aura);
              const isResonated = !!resonatedIds[msg._id];

              return (
                <div
                  key={msg._id || idx}
                  className="message-card"
                  style={{
                    borderLeft: `4px solid ${aura.color}`,
                    boxShadow: isResonated ? `0 8px 25px ${aura.glow}` : undefined,
                  }}
                >
                  <div className="card-top">
                    <span
                      className="card-aura-tag"
                      style={{ color: aura.color, background: aura.glow }}
                    >
                      {aura.label}
                    </span>
                  </div>

                  <p className="message-text">"{msg.text}"</p>

                  <div className="card-footer">
                    <span className="message-author">
                      — {msg.name || 'A Grateful Soul'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleResonate(msg._id)}
                      className={`resonate-btn ${isResonated ? 'resonated' : ''}`}
                    >
                      {isResonated ? '💖 Felt this' : '✨ Send warmth'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App;