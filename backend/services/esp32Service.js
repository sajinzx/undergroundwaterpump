import axios from 'axios';
import WaterReading from '../models/WaterReading.js';

let latestReading = null;
let isEsp32Online = false;
let lastDbSaveTime = 0;

const DB_SAVE_INTERVAL_MS = 10000; // Save to DB every 10 seconds
const ESP32_POLL_INTERVAL_MS = 2000; // Poll ESP32 every 2 seconds

export const startEsp32Polling = () => {
  const esp32Ip = process.env.ESP32_IP || 'http://192.168.4.1';
  console.log(`Starting to poll ESP32 at ${esp32Ip}/api/status`);

  setInterval(async () => {
    try {
      const response = await axios.get(`${esp32Ip}/api/status`, { timeout: 1500 });
      
      latestReading = response.data;
      isEsp32Online = true;

      // Periodically save to MongoDB
      const now = Date.now();
      if (now - lastDbSaveTime > DB_SAVE_INTERVAL_MS) {
        lastDbSaveTime = now;
        try {
          const newReading = new WaterReading(latestReading);
          await newReading.save();
        } catch (dbError) {
          console.error('Error saving reading to database:', dbError.message);
        }
      }

    } catch (error) {
      if (isEsp32Online) {
        console.warn(`ESP32 is offline or unreachable: ${error.message}`);
      }
      isEsp32Online = false;
    }
  }, ESP32_POLL_INTERVAL_MS);
};

export const getLatestStatus = () => {
  return {
    success: true,
    data: latestReading,
    online: isEsp32Online
  };
};
