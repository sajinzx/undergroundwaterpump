import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import waterRoutes from './routes/waterRoutes.js';
import { startEsp32Polling } from './services/esp32Service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/water-status', waterRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all to serve index.html for React Router / SPA navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start polling ESP32
startEsp32Polling();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
