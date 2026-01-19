import { useState, useEffect } from 'react'
import { storyModeManager, DialogueTiming } from '../utils/storyModeModels'
import './Story.css'

function Story({ onContinue, onStartMission }) {
  const [chapters, setChapters] = useState(storyModeManager.chapters)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedMission, setSelectedMission] = useState(null)
  const [showMissionBriefing, setShowMissionBriefing] = useState(false)
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)

  useEffect(() => {
    storyModeManager.updateChapterUnlocks()
    setChapters([...storyModeManager.chapters])
  }, [])

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter)
  }

  const handleMissionClick = (mission) => {
    if (mission.isUnlocked) {
      setSelectedMission(mission)
      setShowMissionBriefing(true)
      setCurrentDialogueIndex(0)
    }
  }

  const handleStartMission = () => {
    if (selectedMission && onStartMission) {
      // Store mission in localStorage for game to access
      localStorage.setItem('currentStoryMission', JSON.stringify(selectedMission))
      localStorage.setItem('runMode', 'storyMode')
      onStartMission(selectedMission)
    } else if (selectedMission && onContinue) {
      // Fallback: just start game
      localStorage.setItem('currentStoryMission', JSON.stringify(selectedMission))
      localStorage.setItem('runMode', 'storyMode')
      onContinue()
    }
    setShowMissionBriefing(false)
  }

  const preMissionDialogue = selectedMission
    ? selectedMission.characterDialogue.filter((d) => d.timing === DialogueTiming.PRE_MISSION)
    : []

  return (
    <div className="story-overlay">
      <div className="story-background">
        <div className="story-stars"></div>
      </div>
      {!showMissionBriefing ? (
        <div className="story-container">
          <header className="story-header">
            <div className="story-header-content">
              <h1 className="story-main-title">
                <span className="story-title-icon">📖</span>
                Story Mode
              </h1>
              <p className="story-subtitle">Kaden & Adelynn's Epic Space Adventure</p>
            </div>
            <button className="story-back-button" onClick={onContinue}>
              <span className="back-icon">←</span>
              Back to Menu
            </button>
          </header>

          <div className="story-intro">
            <div className="story-intro-characters">
              <img src="/kaden_portrait.png" alt="Kaden" className="story-character-portrait" />
              <img src="/adelynn_portrait.png" alt="Adelynn" className="story-character-portrait" />
            </div>
            <p className="story-intro-text">
              Join Kaden & Adelynn on their epic space adventure! Follow their story through challenging missions across the galaxy.
            </p>
          </div>

          <div className="story-chapters">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`story-chapter-card ${chapter.isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => chapter.isUnlocked && handleChapterClick(chapter)}
              >
                <div className="story-chapter-header">
                  <div className="story-chapter-info">
                    <div className="story-chapter-number">
                      Chapter {chapter.chapterNumber}
                      {chapter.isCompleted && <span className="story-checkmark">✓</span>}
                    </div>
                    <h2 className="story-chapter-title">{chapter.title}</h2>
                    <p className="story-chapter-description">{chapter.description}</p>
                  </div>
                  <div className="story-chapter-character">
                    {chapter.character === 'both' ? (
                      <>
                        <img src="/kaden_portrait.png" alt="Kaden" className="story-chapter-char-icon" />
                        <img src="/adelynn_portrait.png" alt="Adelynn" className="story-chapter-char-icon" />
                      </>
                    ) : (
                      <img
                        src={`/${chapter.character}_portrait.png`}
                        alt={chapter.character}
                        className="story-chapter-char-icon"
                      />
                    )}
                  </div>
                </div>

                {chapter.isUnlocked && (
                  <div className="story-missions-preview">
                    {chapter.missions.map((mission) => (
                      <div
                        key={mission.id}
                        className={`story-mission-preview ${mission.isUnlocked ? 'unlocked' : 'locked'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMissionClick(mission)
                        }}
                      >
                        <div className="story-mission-preview-info">
                          <h3 className="story-mission-preview-title">{mission.title}</h3>
                          <p className="story-mission-preview-description">{mission.description}</p>
                        </div>
                        <div className="story-mission-preview-status">
                          {mission.isCompleted ? (
                            <span className="story-mission-checkmark">✓</span>
                          ) : mission.isUnlocked ? (
                            <span className="story-mission-play">▶</span>
                          ) : (
                            <span className="story-mission-lock">🔒</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!chapter.isUnlocked && (
                  <div className="story-chapter-locked">
                    <span className="story-lock-icon">🔒</span>
                    <span>Complete previous chapter to unlock</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="story-briefing-overlay">
          <div className="story-briefing-container">
            <button className="story-briefing-close" onClick={() => setShowMissionBriefing(false)}>
              ✕
            </button>

            <h1 className="story-briefing-title">{selectedMission?.title}</h1>

            <div className="story-briefing-content">
            {preMissionDialogue.length > 0 && (
              <div className="story-briefing-dialogue">
                {preMissionDialogue.slice(0, currentDialogueIndex + 1).map((dialogue, idx) => (
                  <div key={dialogue.id || idx} className="story-dialogue-bubble">
                    <img
                      src={`/${dialogue.character}_portrait.png`}
                      alt={dialogue.character}
                      className="story-dialogue-portrait"
                    />
                    <div className="story-dialogue-content">
                      <div className="story-dialogue-character">{dialogue.character.charAt(0).toUpperCase() + dialogue.character.slice(1)}</div>
                      <div className="story-dialogue-text">{dialogue.text}</div>
                    </div>
                  </div>
                ))}

                {currentDialogueIndex < preMissionDialogue.length - 1 && (
                  <button
                    className="story-dialogue-continue"
                    onClick={() => setCurrentDialogueIndex(currentDialogueIndex + 1)}
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            <div className="story-briefing-section">
              <h2 className="story-briefing-section-title">Mission Briefing</h2>
              <p className="story-briefing-text">{selectedMission?.briefing}</p>
            </div>

            <div className="story-briefing-objectives">
              <h2 className="story-briefing-section-title">Objectives:</h2>
              <ul className="story-objectives-list">
                {selectedMission?.objectives.map((objective) => (
                  <li key={objective.id} className="story-objective-item">
                    <span className="story-objective-icon">🎯</span>
                    <span className="story-objective-text">{objective.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="story-start-button" onClick={handleStartMission}>
              <span>Start Mission</span>
              <span className="story-start-icon">▶</span>
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Story
