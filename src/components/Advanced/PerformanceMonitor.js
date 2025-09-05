import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    objectCounts: {
      bullets: 0,
      enemies: 0,
      particles: 0,
      powerUps: 0
    },
    gameState: 'menu',
    score: 0,
    level: 1
  });

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      // Get performance metrics
      const now = performance.now();
      const fps = Math.round(1000 / (now - (window.lastFrameTime || now)));
      window.lastFrameTime = now;

      // Get memory usage (if available)
      const memoryUsage = performance.memory ? 
        Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;

      setStats(prev => ({
        ...prev,
        fps,
        frameTime: Math.round(now - (window.lastFrameTime || now)),
        memoryUsage
      }));
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <h3>🚀 Performance Monitor</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="performance-stats">
        <div className="stat-row">
          <span className="stat-label">FPS:</span>
          <span className={`stat-value ${stats.fps >= 55 ? 'good' : stats.fps >= 30 ? 'warning' : 'bad'}`}>
            {stats.fps}
          </span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Frame Time:</span>
          <span className="stat-value">{stats.frameTime}ms</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Memory:</span>
          <span className="stat-value">{stats.memoryUsage}MB</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Game State:</span>
          <span className="stat-value">{stats.gameState}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{stats.score.toLocaleString()}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{stats.level}</span>
        </div>
      </div>
      
      <div className="object-counts">
        <h4>Object Counts</h4>
        <div className="count-grid">
          <div className="count-item">
            <span>Bullets:</span>
            <span>{stats.objectCounts.bullets}</span>
          </div>
          <div className="count-item">
            <span>Enemies:</span>
            <span>{stats.objectCounts.enemies}</span>
          </div>
          <div className="count-item">
            <span>Particles:</span>
            <span>{stats.objectCounts.particles}</span>
          </div>
          <div className="count-item">
            <span>Power-ups:</span>
            <span>{stats.objectCounts.powerUps}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
