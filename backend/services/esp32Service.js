import axios from 'axios';

let latestReading = null;
let isEsp32Online = false;

const ESP32_POLL_INTERVAL_MS = 2000; // Poll ESP32 every 2 seconds

export const startEsp32Polling = () => {
  const esp32Ip = process.env.ESP32_IP || 'http://192.168.4.1';
  console.log(`Starting to poll ESP32 at ${esp32Ip}/api/status`);

  setInterval(async () => {
    try {
      const response = await axios.get(`${esp32Ip}/api/status`, { timeout: 1500 });
      
      latestReading = response.data;
      isEsp32Online = true;

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
