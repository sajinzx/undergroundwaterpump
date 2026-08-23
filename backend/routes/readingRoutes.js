import express from 'express';
import WaterReading from '../models/WaterReading.js';

const router = express.Router();

// GET /api/readings/history
// Get historical data for charts
router.get('/history', async (req, res) => {
  try {
    // Limit to the latest 100 records for performance, sorted descending
    const limit = parseInt(req.query.limit) || 100;
    
    const readings = await WaterReading.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    // Reverse to chronological order for charts
    res.json({
      success: true,
      data: readings.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching historical readings',
      error: error.message
    });
  }
});

export default router;
