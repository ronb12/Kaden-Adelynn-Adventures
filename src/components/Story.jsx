import { useState, useEffect } from 'react'
import './Story.css'

function Story({ onContinue }) {
  const [currentPage, setCurrentPage] = useState(0)

  const storyPages = [
    {
      title: 'The Adventure Begins',
      text: 'Kaden and Adelynn, two brave space explorers, embark on an epic journey through the galaxy to save their home planet from an alien invasion.',
    },
    {
      title: 'The Mission',
      text: 'Armed with advanced spacecraft and powerful weapons, they must battle through waves of enemies, defeat powerful bosses, and collect resources to upgrade their ships.',
    },
    {
      title: 'The Challenge',
      text: 'With 25 lives and countless enemies ahead, can you help Kaden and Adelynn complete their mission and become legendary space heroes?',
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
        <h1 className="story-title">{storyPages[currentPage].title}</h1>
        <p className="story-text">{storyPages[currentPage].text}</p>
        <div className="story-buttons">
          {currentPage < storyPages.length - 1 ? (
            <button className="story-button" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="story-button" onClick={handleNext}>
              Start Game
            </button>
          )}
          <button className="story-button secondary" onClick={handleSkip}>
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
