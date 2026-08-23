import express from 'express';
import { getLatestStatus } from '../services/esp32Service.js';

const router = express.Router();

// GET /api/water-status
// Returns the current live status from the ESP32 Service
router.get('/', (req, res) => {
  const status = getLatestStatus();
  if (!status.data && !status.online) {
    return res.status(503).json({
      success: false,
      message: "ESP32 is offline and no previous data is available.",
      online: false
    });
  }
  res.json(status);
});

export default router;
