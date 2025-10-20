/**
 * TestMode Component - Comprehensive test interface for all new features
 */
import React, { useState, useEffect } from 'react';
import { bossSystem } from './Systems/BossSystem.js';
import { waveSystem } from './Systems/WaveSystem.js';
import { ultimateSystem } from './Systems/UltimateSystem.js';
import { environmentSystem } from './Systems/EnvironmentSystem.js';
import { shopSystem } from './Systems/ShopSystem.js';
import { powerUpComboSystem } from './Systems/PowerUpComboSystem.js';
import { challengeSystem } from './Systems/ChallengeSystem.js';
import { missionSystem } from './Systems/MissionSystem.js';
import { testPlayerSystem } from './Systems/TestPlayerSystem.js';

const TestMode = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testLog, setTestLog] = useState([]);
  const [shopStats, setShopStats] = useState(shopSystem.getStats());

  useEffect(() => {
    // Enable test player system
    testPlayerSystem.toggle();
    
    return () => {
      // Cleanup
      testPlayerSystem.toggle();
    };
  }, []);

  const addLog = (message) => {
    setTestLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message }].slice(-10));
  };

  const testBossSystem = () => {
    addLog('🎯 Testing Boss System...');
    const canvas = { width: 800, height: 700 };
    const boss = bossSystem.spawnBoss(1000, canvas);
    addLog(`✓ Spawned boss: ${boss.name}`);
    addLog(`  - Health: ${boss.health}/${boss.maxHealth}`);
    addLog(`  - Phases: ${boss.maxPhase}`);
    addLog(`  - Abilities: ${boss.specialAbilities.length}`);
  };

  const testWaveSystem = () => {
    addLog('🌊 Testing Wave System...');
    const waveInfo = waveSystem.startWave(5);
    addLog(`✓ Started Wave ${waveInfo.waveNumber}`);
    addLog(`  - Type: ${waveInfo.waveType}`);
    addLog(`  - Enemies Required: ${waveInfo.enemiesRequired}`);
    addLog(`  - Formations: ${waveSystem.formations.length}`);
  };

  const testUltimateSystem = () => {
    addLog('⚡ Testing Ultimate System...');
    ultimateSystem.charge = ultimateSystem.maxCharge;
    addLog(`✓ Ultimate charged: ${ultimateSystem.charge}%`);
    addLog(`  - Ready: ${ultimateSystem.isReady() ? 'YES' : 'NO'}`);
    const info = ultimateSystem.getUltimateInfo('kaden');
    addLog(`  - Kaden's Ultimate: ${info.name}`);
  };

  const testEnvironmentSystem = () => {
    addLog('🌌 Testing Environment System...');
    const canvas = { width: 800, height: 700 };
    environmentSystem.spawnAsteroid(canvas);
    environmentSystem.spawnBlackHole(canvas);
    addLog(`✓ Spawned hazards`);
    addLog(`  - Asteroids: ${environmentSystem.asteroids.length}`);
    addLog(`  - Black Holes: ${environmentSystem.blackHoles.length}`);
  };

  const testShopSystem = () => {
    addLog('🛒 Testing Shop System...');
    shopSystem.addCurrency(10000);
    const result = shopSystem.purchaseUpgrade('maxHealth');
    addLog(`✓ Purchase Result: ${result.message}`);
    addLog(`  - Currency: ${shopSystem.currency}`);
    addLog(`  - Max Health Level: ${shopSystem.upgrades.maxHealth}`);
    setShopStats(shopSystem.getStats());
  };

  const testPowerUpComboSystem = () => {
    addLog('💥 Testing Power-up Combo System...');
    powerUpComboSystem.addPowerUp('rapidFire', 10000);
    powerUpComboSystem.addPowerUp('multiShot', 10000);
    addLog(`✓ Activated power-ups`);
    addLog(`  - Active: ${powerUpComboSystem.activePowerUps.length}`);
    addLog(`  - Combos: ${powerUpComboSystem.activeCombos.length}`);
    if (powerUpComboSystem.activeCombos.length > 0) {
      addLog(`  - Combo: ${powerUpComboSystem.activeCombos[0].name}`);
    }
  };

  const testChallengeSystem = () => {
    addLog('🏆 Testing Challenge System...');
    const config = challengeSystem.startChallenge('endless');
    addLog(`✓ Started ${config.name}`);
    addLog(`  - Score Multiplier: ${config.rewards.scoreMultiplier}x`);
    addLog(`  - XP Multiplier: ${config.rewards.xpMultiplier}x`);
    addLog(`  - Rules: ${config.rules.length}`);
  };

  const testMissionSystem = () => {
    addLog('📋 Testing Mission System...');
    missionSystem.startMission('tutorial');
    addLog(`✓ Started mission: ${missionSystem.currentMission.name}`);
    addLog(`  - Objectives: ${missionSystem.currentMission.objectives.length}`);
    addLog(`  - Rewards: ${missionSystem.currentMission.rewards.xp} XP`);
  };

  const testAllSystems = () => {
    addLog('🚀 RUNNING ALL TESTS...');
    setTimeout(() => testBossSystem(), 100);
    setTimeout(() => testWaveSystem(), 300);
    setTimeout(() => testUltimateSystem(), 500);
    setTimeout(() => testEnvironmentSystem(), 700);
    setTimeout(() => testShopSystem(), 900);
    setTimeout(() => testPowerUpComboSystem(), 1100);
    setTimeout(() => testChallengeSystem(), 1300);
    setTimeout(() => testMissionSystem(), 1500);
    setTimeout(() => addLog('✅ ALL TESTS COMPLETE!'), 1700);
  };

  const resetAllSystems = () => {
    bossSystem.reset();
    waveSystem.reset();
    ultimateSystem.reset();
    environmentSystem.reset();
    powerUpComboSystem.reset();
    challengeSystem.reset();
    missionSystem.reset();
    addLog('🔄 All systems reset');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧪 Kaden & Adelynn - Test Mode</h1>
        <p style={styles.subtitle}>Comprehensive Feature Testing Dashboard</p>
      </div>

      <div style={styles.tabs}>
        {['overview', 'systems', 'scenarios', 'shop', 'logs'].map(tab => (
          <button
            key={tab}
            style={{...styles.tab, ...(activeTab === tab ? styles.activeTab : {})}}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && (
          <div style={styles.section}>
            <h2>🎮 New Features Overview</h2>
            
            <div style={styles.featureGrid}>
              <div style={styles.featureCard}>
                <h3>🎯 Boss Battle System</h3>
                <p>Multi-phase bosses with special abilities</p>
                <ul>
                  <li>5 unique bosses</li>
                  <li>Up to 6 phases each</li>
                  <li>15+ special abilities</li>
                  <li>Dynamic attack patterns</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>🌊 Wave System</h3>
                <p>Progressive wave-based gameplay</p>
                <ul>
                  <li>Enemy formations</li>
                  <li>Wave bonuses</li>
                  <li>Difficulty scaling</li>
                  <li>Boss waves every 5 levels</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>⚡ Ultimate Abilities</h3>
                <p>Character-specific super moves</p>
                <ul>
                  <li>Phoenix Strike (Kaden)</li>
                  <li>Tactical Strike (Adelynn)</li>
                  <li>Charge meter system</li>
                  <li>Cooldown management</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>🌌 Environmental Hazards</h3>
                <p>Interactive space obstacles</p>
                <ul>
                  <li>Asteroids with health</li>
                  <li>Black holes with gravity</li>
                  <li>Meteor showers</li>
                  <li>Collectible debris</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>🛒 Shop & Upgrades</h3>
                <p>Permanent progression system</p>
                <ul>
                  <li>8 upgrade types</li>
                  <li>5 unlockable ships</li>
                  <li>Currency system</li>
                  <li>Persistent progress</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>💥 Power-up Combos</h3>
                <p>Synergy between power-ups</p>
                <ul>
                  <li>8 unique combos</li>
                  <li>Auto-detection</li>
                  <li>Enhanced effects</li>
                  <li>Visual indicators</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>🏆 Challenge Modes</h3>
                <p>7 different game modes</p>
                <ul>
                  <li>Endless mode</li>
                  <li>Time attack</li>
                  <li>One life mode</li>
                  <li>Leaderboards</li>
                </ul>
              </div>

              <div style={styles.featureCard}>
                <h3>📋 Mission System</h3>
                <p>Story-driven objectives</p>
                <ul>
                  <li>7 story missions</li>
                  <li>Multiple objectives</li>
                  <li>Progressive rewards</li>
                  <li>Chapter integration</li>
                </ul>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button style={styles.primaryButton} onClick={testAllSystems}>
                🚀 Run All Tests
              </button>
              <button style={styles.secondaryButton} onClick={resetAllSystems}>
                🔄 Reset Systems
              </button>
            </div>
          </div>
        )}

        {activeTab === 'systems' && (
          <div style={styles.section}>
            <h2>🔧 Individual System Tests</h2>
            
            <div style={styles.testGrid}>
              <button style={styles.testButton} onClick={testBossSystem}>
                🎯 Test Boss System
              </button>
              <button style={styles.testButton} onClick={testWaveSystem}>
                🌊 Test Wave System
              </button>
              <button style={styles.testButton} onClick={testUltimateSystem}>
                ⚡ Test Ultimate System
              </button>
              <button style={styles.testButton} onClick={testEnvironmentSystem}>
                🌌 Test Environment System
              </button>
              <button style={styles.testButton} onClick={testShopSystem}>
                🛒 Test Shop System
              </button>
              <button style={styles.testButton} onClick={testPowerUpComboSystem}>
                💥 Test Combo System
              </button>
              <button style={styles.testButton} onClick={testChallengeSystem}>
                🏆 Test Challenge System
              </button>
              <button style={styles.testButton} onClick={testMissionSystem}>
                📋 Test Mission System
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div style={styles.section}>
            <h2>🎬 Test Scenarios</h2>
            <p style={styles.info}>Predefined scenarios to test specific features</p>
            
            <div style={styles.scenarioList}>
              {testPlayerSystem.getScenarios().map(scenario => (
                <div key={scenario.key} style={styles.scenarioCard}>
                  <h3>{scenario.name}</h3>
                  <p>{scenario.description}</p>
                  <button 
                    style={styles.runButton}
                    onClick={() => {
                      testPlayerSystem.runScenario(scenario.key, {});
                      addLog(`✓ Ran scenario: ${scenario.name}`);
                    }}
                  >
                    Run Scenario
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div style={styles.section}>
            <h2>🛒 Shop Statistics</h2>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h3>💰 Currency</h3>
                <p style={styles.bigNumber}>{shopStats.currency}</p>
              </div>
              <div style={styles.statCard}>
                <h3>📈 Total Earned</h3>
                <p style={styles.bigNumber}>{shopStats.totalEarned}</p>
              </div>
              <div style={styles.statCard}>
                <h3>⬆️ Upgrades Owned</h3>
                <p style={styles.bigNumber}>{shopStats.upgradesOwned}</p>
              </div>
              <div style={styles.statCard}>
                <h3>🚀 Ships Owned</h3>
                <p style={styles.bigNumber}>{shopStats.shipsOwned}/{shopStats.totalShips}</p>
              </div>
            </div>

            <h3 style={{marginTop: '20px'}}>Available Upgrades</h3>
            <div style={styles.upgradeList}>
              {shopSystem.getAvailableUpgrades().slice(0, 4).map(upgrade => (
                <div key={upgrade.id} style={styles.upgradeCard}>
                  <h4>{upgrade.name}</h4>
                  <p>{upgrade.description}</p>
                  <p>Level: {upgrade.currentLevel}/{upgrade.maxLevel}</p>
                  <p>Cost: {upgrade.cost} credits</p>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: upgrade.maxed ? '#888' : upgrade.canAfford ? '#00ff00' : '#ff0000'
                  }}>
                    {upgrade.maxed ? 'MAXED' : upgrade.canAfford ? 'Available' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div style={styles.section}>
            <h2>📝 Test Logs</h2>
            <div style={styles.logContainer}>
              {testLog.map((log, i) => (
                <div key={i} style={styles.logEntry}>
                  <span style={styles.logTime}>[{log.time}]</span>
                  <span style={styles.logMessage}>{log.message}</span>
                </div>
              ))}
              {testLog.length === 0 && (
                <p style={styles.emptyLog}>No logs yet. Run some tests!</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <p>🧪 Test Mode Active - Press '~' in-game to toggle dev tools</p>
        <p>Quick Keys: G=God Mode, H=Hitboxes, U=Ultimate, B=Boss, P=PowerUps</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  subtitle: {
    margin: '10px 0 0 0',
    fontSize: '16px',
    opacity: 0.9
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #333'
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s',
    borderBottom: '3px solid transparent'
  },
  activeTab: {
    color: '#00ffff',
    borderBottomColor: '#00ffff'
  },
  content: {
    minHeight: '400px',
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    padding: '20px'
  },
  section: {
    animation: 'fadeIn 0.3s'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  featureCard: {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #00ffff',
    transition: 'transform 0.3s',
    cursor: 'pointer'
  },
  testGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px'
  },
  testButton: {
    padding: '15px',
    fontSize: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    fontWeight: 'bold'
  },
  actionButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px'
  },
  primaryButton: {
    padding: '15px 30px',
    fontSize: '18px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '25px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 5px 15px rgba(240, 147, 251, 0.4)'
  },
  secondaryButton: {
    padding: '15px 30px',
    fontSize: '18px',
    background: '#333',
    border: '2px solid #666',
    borderRadius: '25px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px'
  },
  statCard: {
    background: '#2a2a2a',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #00ff00'
  },
  bigNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#00ff00',
    margin: '10px 0 0 0'
  },
  upgradeList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  upgradeCard: {
    background: '#2a2a2a',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #444'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  logContainer: {
    background: '#0a0a0a',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    maxHeight: '400px',
    overflowY: 'auto',
    border: '2px solid #00ff00'
  },
  logEntry: {
    padding: '8px 0',
    borderBottom: '1px solid #333'
  },
  logTime: {
    color: '#00ffff',
    marginRight: '10px'
  },
  logMessage: {
    color: '#ffffff'
  },
  emptyLog: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  },
  scenarioList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  scenarioCard: {
    background: '#2a2a2a',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #ffaa00'
  },
  runButton: {
    marginTop: '10px',
    padding: '10px 20px',
    background: '#ffaa00',
    border: 'none',
    borderRadius: '5px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  info: {
    color: '#888',
    fontStyle: 'italic'
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    textAlign: 'center',
    background: '#1a1a1a',
    borderRadius: '10px',
    borderTop: '2px solid #00ffff'
  }
};

export default TestMode;

