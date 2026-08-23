import mongoose from 'mongoose';

const waterReadingSchema = new mongoose.Schema({
  waterLevel: {
    type: Number,
    required: true
  },
  waterDetected: {
    type: Boolean,
    required: true
  },
  pumpStatus: {
    type: Boolean,
    required: true
  },
  tds: {
    type: Number,
    required: true
  },
  waterQuality: {
    type: String,
    required: true
  },
  solenoidStatus: {
    type: Boolean,
    required: true
  },
  dispensingStatus: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const WaterReading = mongoose.model('WaterReading', waterReadingSchema);

export default WaterReading;
