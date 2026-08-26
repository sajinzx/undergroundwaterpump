import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Droplet, Waves, Thermometer, Box, Power, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    waterLevel: 0,
    waterDetected: false,
    pumpStatus: false,
    tds: 0,
    waterQuality: 'Unknown',
    emergencyShutdown: false,
    emergencyShutdownTime: null
  });
  
  const [history, setHistory] = useState(() => {
    const saved = sessionStorage.getItem('waterHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

  useEffect(() => {
    // Poll live status every 2 seconds
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/water-status`);
        if (response.data.success && response.data.data) {
          setData(response.data.data);
          setIsOnline(response.data.online);
          setLastUpdated(new Date().toLocaleTimeString());

          // Update history
          const timestamp = new Date();
          const newHistoryItem = {
            time: timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            tds: response.data.data.tds,
            waterLevel: response.data.data.waterLevel
          };

          setHistory(prevHistory => {
            const newHistory = [...prevHistory, newHistoryItem];
            // Keep only the last 20 readings to avoid clutter and huge storage
            if (newHistory.length > 20) {
              newHistory.shift();
            }
            sessionStorage.setItem('waterHistory', JSON.stringify(newHistory));
            return newHistory;
          });
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
      }
    };

    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 2000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {data.emergencyShutdown && (
        <div className="emergency-banner">
          <div className="emergency-icon">⚠</div>
          <div className="emergency-content">
            <h2>EMERGENCY SHUTDOWN</h2>
            <p>SYSTEM DISABLED</p>
            {data.emergencyShutdownTime && (
              <span className="emergency-time">Activated at: {data.emergencyShutdownTime}</span>
            )}
          </div>
        </div>
      )}

      <header className="header">
        <div>
          <h1>SMART WATER MANAGEMENT</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            ESP32 IoT Monitoring Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className="status-badge">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            ESP32 Connection: {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className={`status-indicator ${data.emergencyShutdown ? 'bad' : 'good'}`} style={{ marginTop: 0 }}>
            System Status: {data.emergencyShutdown ? 'SHUT DOWN' : 'NORMAL'}
          </div>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Last Updated: {lastUpdated}</span>
          )}
        </div>
      </header>

      {/* METRIC CARDS */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-header">
            <span>Water Level Sensor</span>
            <Droplet size={18} color="#38bdf8" />
          </div>
          <div className="card-value">{data.waterLevel}</div>
          <div className="card-subtitle">Raw analog value</div>
          <div className={`status-indicator ${data.waterDetected ? 'on' : 'off'}`}>
            {data.waterDetected ? 'Water Detected' : 'No Water'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Water Pump</span>
            <Activity size={18} color="#22c55e" />
          </div>
          <div className="card-value">{data.pumpStatus ? 'ON' : 'OFF'}</div>
          <div className="card-subtitle">Underwater Extraction</div>
          <div className={`status-indicator ${data.pumpStatus ? 'on' : 'off'}`}>
            Relay Active
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>TDS Quality</span>
            <Thermometer size={18} color={
              data.waterQuality === 'Good' ? '#22c55e' : 
              data.waterQuality === 'Average' ? '#eab308' : '#ef4444'
            } />
          </div>
          <div className="card-value">{data.tds} <span style={{fontSize: '1rem'}}>ppm</span></div>
          <div className="card-subtitle">Total Dissolved Solids</div>
          <div className={`status-indicator ${data.waterQuality.toLowerCase()}`}>
            {data.waterQuality.toUpperCase()}
          </div>
        </div>
      </div>

      {/* SYSTEM FLOW VISUALIZATION */}
      <div className="system-flow-section">
        <h2 className="section-title">System Flow Visualization</h2>
        <div className="flow-container">
          <div className="flow-node">
            <div className="flow-icon-container">
              <Waves color="#38bdf8" size={24} />
            </div>
            <span style={{ fontSize: '0.875rem' }}>Source</span>
          </div>
          
          <ArrowRight className="flow-arrow" size={20} />
          
          <div className={`flow-node ${data.waterDetected ? 'active' : ''}`}>
            <div className="flow-icon-container">
              <Droplet color="#38bdf8" size={24} />
            </div>
            <span style={{ fontSize: '0.875rem' }}>Level Sensor</span>
          </div>
          
          <ArrowRight className="flow-arrow" size={20} />

          <div className={`flow-node ${data.pumpStatus ? 'active' : ''}`}>
            <div className="flow-icon-container">
              <Activity color="#22c55e" size={24} />
            </div>
            <span style={{ fontSize: '0.875rem' }}>Pump</span>
          </div>

          <ArrowRight className="flow-arrow" size={20} />

          <div className="flow-node active">
            <div className="flow-icon-container">
              <Box color="#94a3b8" size={24} />
            </div>
            <span style={{ fontSize: '0.875rem' }}>Filter</span>
          </div>

          <ArrowRight className="flow-arrow" size={20} />

          <div className={`flow-node ${data.waterQuality === 'Good' ? 'active' : ''}`}>
            <div className="flow-icon-container">
              <Thermometer color={
                data.waterQuality === 'Good' ? '#22c55e' : 
                data.waterQuality === 'Average' ? '#eab308' : '#ef4444'
              } size={24} />
            </div>
            <span style={{ fontSize: '0.875rem' }}>TDS Check</span>
          </div>

        </div>
      </div>

      {/* CHARTS */}
      {history.length > 0 && (
        <div className="charts-section">
          <h2 className="section-title">Historical TDS Readings</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="tds" stroke="#38bdf8" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
