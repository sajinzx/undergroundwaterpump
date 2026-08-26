import axios from 'axios';

let latestReading = null;
let isEsp32Online = false;

const ESP32_POLL_INTERVAL_MS = 2000; // Poll ESP32 every 2 seconds

let emergencyShutdownActive = false;
let emergencyShutdownTime = null;

export const startEsp32Polling = () => {
  const esp32Ip = process.env.ESP32_IP || 'http://192.168.4.1';
  console.log(`Starting to poll ESP32 at ${esp32Ip}/api/status`);

  setInterval(async () => {
    try {
      const response = await axios.get(`${esp32Ip}/api/status`, { timeout: 1500 });
      
      const data = response.data;

      // Handle Emergency Shutdown Time Tracking
      if (data.emergencyShutdown && !emergencyShutdownActive) {
        emergencyShutdownActive = true;
        emergencyShutdownTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
      } else if (!data.emergencyShutdown && emergencyShutdownActive) {
        emergencyShutdownActive = false;
        emergencyShutdownTime = null;
      }

      latestReading = {
        ...data,
        emergencyShutdownTime
      };

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
