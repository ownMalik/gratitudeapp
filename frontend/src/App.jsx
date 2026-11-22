import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Uses live backend URL in production, or localhost during testing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/messages';

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  // Fetch messages and poll every 5 seconds for "live" comments
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await axios.post(API_URL, { name, text });
      setText('');
      fetchMessages(); // Immediately refresh list
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  return (
    <div className="universe-container">
      <h1>✨ Gratitude to the Universe ✨</h1>
      <p>Send a positive thought out into the cosmos.</p>

      <form onSubmit={handleSubmit} className="gratitude-form">
        <input
          type="text"
          placeholder="Your Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="What are you grateful for today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          required
        />
        <button type="submit">Send to the Universe</button>
      </form>

      <div className="message-feed">
        {messages.map((msg) => (
          <div key={msg._id} className="message-card">
            <p className="message-text">"{msg.text}"</p>
            <span className="message-author">— {msg.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
