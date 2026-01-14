const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// const authRoutes = require('./routes/authRoutes');
// const gigRoutes = require('./routes/gigRoutes');
// const bidRoutes = require('./routes/bidRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Socket.io connection handling
const userSockets = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    userSockets.set(userId, socket.id);
    socket.userId = userId;
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
  });
});

// Make userSockets accessible globally
global.userSockets = userSockets;
global.io = io;

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    socketConnections: userSockets.size
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io server ready`);
});