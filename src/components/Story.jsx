import { useState, useEffect } from 'react'
import './Story.css'

function Story({ onContinue }) {
  const [currentPage, setCurrentPage] = useState(0)

  const storyPages = [
    {
      title: 'The Adventure Begins',
      emoji: '🌟',
      text: 'In the year 2157, the peaceful planet of Terra Nova faces an unprecedented threat. Alien forces from the distant Zephyr system have launched a massive invasion, seeking to plunder the planet\'s rare energy crystals. Kaden and Adelynn, two elite space pilots from the Galactic Defense Force, are humanity\'s last hope.',
    },
    {
      title: 'The Mission',
      emoji: '🚀',
      text: 'Armed with cutting-edge spacecraft and an arsenal of powerful weapons, Kaden and Adelynn must battle through waves of enemy fighters, navigate treacherous asteroid fields, and face off against colossal boss ships. Their mission: reach the alien command ship and destroy it before Terra Nova falls.',
    },
    {
      title: 'The Challenge',
      emoji: '⚔️',
      text: 'With 25 lives, advanced weapon systems, and the ability to form coordinated attack formations, you must guide our heroes through increasingly difficult waves. Collect power-ups, upgrade your ship, and master the combo system to maximize your score. The fate of Terra Nova rests in your hands!',
    },
  ]

  const handleNext = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onContinue()
    }
  }

  const handleSkip = () => {
    onContinue()
  }

  return (
    <div className="story-overlay">
      <div className="story-container">
        {storyPages[currentPage].emoji && (
          <div className="story-emoji">{storyPages[currentPage].emoji}</div>
        )}
        <h1 className="story-title">{storyPages[currentPage].title}</h1>
        <p className="story-text">{storyPages[currentPage].text}</p>
        <div className="story-buttons">
          {currentPage < storyPages.length - 1 ? (
            <button className="story-button" onClick={handleNext} type="button">
              Next →
            </button>
          ) : (
            <button className="story-button" onClick={handleNext} type="button">
              Start Game 🎮
            </button>
          )}
          <button className="story-button secondary" onClick={handleSkip} type="button">
            Skip
          </button>
        </div>
        <div className="story-progress">
          {storyPages.map((_, index) => (
            <span
              key={index}
              className={index === currentPage ? 'active' : ''}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Story
