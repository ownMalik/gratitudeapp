const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI environment variable is missing.');
}

// Message Schema (includes aura so mood/color persists across refreshes)
const messageSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous Soul', trim: true },
  text: { type: String, required: true, trim: true, maxlength: 280 },
  aura: {
    type: String,
    enum: ['joy', 'love', 'peace', 'wonder'],
    default: 'wonder',
  },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Health check endpoint to verify DB connection state quickly
app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    server: 'ok',
    database: dbState,
  });
});

// GET latest messages
app.get('/api/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected yet. Check MONGO_URI and MongoDB Atlas IP allowlist.',
      });
    }

    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    console.error('❌ GET /api/messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages from database' });
  }
});

// POST a new gratitude message
app.post('/api/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected yet. Check MONGO_URI and MongoDB Atlas IP allowlist.',
      });
    }

    const { name, text, aura } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const validAuras = ['joy', 'love', 'peace', 'wonder'];
    const safeAura = validAuras.includes(aura) ? aura : 'wonder';

    const newMessage = new Message({
      name: name && name.trim() ? name.trim() : 'Anonymous Soul',
      text: text.trim(),
      aura: safeAura,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('❌ POST /api/messages error:', err);
    res.status(500).json({ error: 'Failed to save message to database' });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log('✅ Connected to Universe DB');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();