const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to Universe DB'))
  .catch((err) => console.error(err));

// Message Schema
const messageSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous Soul' },
  text: { type: String, required: true, maxlength: 280 },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const { name, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Message is required' });
  
  const newMessage = new Message({ name: name || 'Anonymous Soul', text });
  await newMessage.save();
  res.status(201).json(newMessage);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
