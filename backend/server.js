import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import waterRoutes from './routes/waterRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import { startEsp32Polling } from './services/esp32Service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_water';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/water-status', waterRoutes);
app.use('/api/readings', readingRoutes);

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Start polling ESP32 once DB is connected
    startEsp32Polling();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
