const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all requests
app.use(limiter);

// Authentication rate limiting (register, verify, unsubscribe, unsubscribe-request)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 register/verify/unsubscribe requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply authentication rate limiting to authentication routes
app.use('/api/users/register', authLimiter);
app.use('/api/users/verify', authLimiter);
app.use('/api/users/unsubscribe-request', authLimiter);
app.use('/api/users/unsubscribe', authLimiter);

// Serve static files from the 'build' folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
}

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/xkcd', require('./src/routes/xkcdRoutes'));

// Serve the frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

// MongoDB connection
const connectDB = async () => {
  try {
    // Use local MongoDB for development if ATLAS is not accessible
    const dbURI = process.env.MONGODB_URI || process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/xkcd-subscription';
    
    const conn = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Make sure your IP is whitelisted in MongoDB Atlas or install MongoDB locally');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// XKCD cron job
require('./src/services/xkcdService');