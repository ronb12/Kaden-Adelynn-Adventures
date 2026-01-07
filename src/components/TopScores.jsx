import { useState, useEffect } from 'react'
import { getHighScores, getMergedTopScores, getPersonalBest } from '../utils/scoreTracking'
import { fetchPlayerRank } from '../utils/cloudScores'
import './TopScores.css'

function TopScores({ onClose }) {
  const [highScores, setHighScores] = useState(() => getHighScores())
  const [globalScores, setGlobalScores] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('cloud') // 'local' or 'cloud'
  const [playerRank, setPlayerRank] = useState(null)
  const [playerName] = useState(() => localStorage.getItem('playerName') || 'Player')

  useEffect(() => {
    // Refresh local scores
    setHighScores(getHighScores())
  }, [])

  const handleRefreshCloud = async () => {
    setIsLoading(true)
    try {
      const global = await getMergedTopScores()
      setGlobalScores(global)
      setActiveTab('cloud')
      
      // Calculate player's rank
      const personalBest = getPersonalBest()
      if (personalBest > 0 && playerName) {
        const rank = await fetchPlayerRank(playerName, personalBest)
        setPlayerRank(rank)
      }
    } catch (error) {
      console.error('Error fetching cloud scores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-load global scores on mount
    handleRefreshCloud()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatScore = (score) => {
    return String(score || 0).padStart(8, '0')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="scores-page">
      <div className="scores-background">
        <div className="scores-stars"></div>
      </div>

      <div className="scores-container">
        <header className="scores-header">
          <div className="scores-header-content">
            <h1 className="scores-main-title">
              <span className="scores-title-icon">🏆</span>
              Top Scores
            </h1>
            <p className="scores-header-subtitle">Compete for the highest scores</p>
          </div>
          <button className="scores-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="scores-tabs">
          <button
            className={`scores-tab ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            📱 Local Scores
          </button>
          <button
            className={`scores-tab ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={handleRefreshCloud}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Loading...' : '☁️ Cloud Scores'}
          </button>
        </div>

        <div className="scores-section">
          {activeTab === 'local' && (
            <div className="scores-list">
              <h2 className="scores-list-title">Local Leaderboard</h2>
              {highScores.length > 0 ? (
                <div className="scores-table">
                  <div className="scores-table-header">
                    <div className="rank-col">Rank</div>
                    <div className="player-col">Player</div>
                    <div className="score-col">Score</div>
                    <div className="date-col">Date</div>
                  </div>
                  {highScores.map((score, index) => (
                    <div key={index} className="scores-table-row">
                      <div className="rank-col">
                        <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="player-col">{score.player || 'Player'}</div>
                      <div className="score-col">{formatScore(score.score)}</div>
                      <div className="date-col">{formatDate(score.date || score.timestamp)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="scores-empty">
                  <div className="empty-icon">📊</div>
                  <p>No scores yet. Play a game to set a record!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="scores-list">
              <h2 className="scores-list-title">🌍 Global Leaderboard</h2>
              {playerRank && (
                <div className="player-rank-badge">
                  <span className="rank-badge-icon">🎯</span>
                  <span className="rank-badge-text">
                    Your Rank: <strong>#{playerRank}</strong> (Best: {formatScore(getPersonalBest())})
                  </span>
                </div>
              )}
              {globalScores.length > 0 ? (
                <div className="scores-table">
                  <div className="scores-table-header">
                    <div className="rank-col">Rank</div>
                    <div className="player-col">Player</div>
                    <div className="score-col">Score</div>
                    <div className="date-col">Date</div>
                  </div>
                  {globalScores.map((score, index) => {
                    const isCurrentPlayer = score.player === playerName
                    return (
                      <div 
                        key={score.id || index} 
                        className={`scores-table-row ${isCurrentPlayer ? 'current-player' : ''}`}
                      >
                        <div className="rank-col">
                          <span className="rank-number">{String(index + 1).padStart(3, '0')}</span>
                        </div>
                        <div className="player-col">
                          {score.player || 'Player'}
                          {isCurrentPlayer && <span className="player-badge"> (You)</span>}
                        </div>
                        <div className="score-col">{formatScore(score.score)}</div>
                        <div className="date-col">{formatDate(score.date || score.timestamp)}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="scores-empty">
                  <div className="empty-icon">☁️</div>
                  <p>{isLoading ? 'Loading global leaderboard...' : 'No global scores yet. Be the first!'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopScores

