import React, { useEffect } from 'react';

function BossWarningScreen({ bossName, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="boss-warning-overlay">
      <div className="boss-warning-content">
        <h1 className="boss-warning-title">⚠️ WARNING ⚠️</h1>
        <h2 className="boss-name">{bossName}</h2>
        <p className="boss-subtitle">APPROACHING</p>
        <div className="warning-animation">
          <div className="warning-bar"></div>
          <div className="warning-bar"></div>
          <div className="warning-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default BossWarningScreen;



