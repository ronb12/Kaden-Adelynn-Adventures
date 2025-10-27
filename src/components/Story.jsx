import { useState, useEffect } from 'react'
import './Story.css'

function Story({ onContinue }) {
  const [currentPage, setCurrentPage] = useState(0)

  const storyPages = [
    {
      title: "🌟 The Adventure Begins",
      content: "Kaden and Adelynn are two young space explorers on a mission to save their galaxy from an alien invasion.",
      character: "👨‍🚀"
    },
    {
      title: "🔴 The Threat",
      content: "Ancient evil forces have awakened and are destroying planets across the galaxy. Only our brave heroes can stop them!",
      character: "👾"
    },
    {
      title: "🚀 The Mission",
      content: "Kaden pilots the Blue Thunder with precision lasers. Adelynn commands the Pink Princess with devastating spread shots.",
      character: "⚔️"
    },
    {
      title: "💫 Their Quest",
      content: "Collect power-ups, defeat enemies, and battle massive bosses to restore peace to the galaxy!",
      character: "🎯"
    },
    {
      title: "🌟 Ready?",
      content: "Choose your ship and difficulty. The fate of the galaxy rests in your hands!",
      character: "🚀"
    }
  ]

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1)
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [currentPage])

  const handleClick = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onContinue()
    }
  }

  return (
    <div className="story-overlay" onClick={handleClick}>
      <div className="story-container">
        <div className="story-emoji">{storyPages[currentPage].character}</div>
        <h2 className="story-title">{storyPages[currentPage].title}</h2>
        <p className="story-content">{storyPages[currentPage].content}</p>
        <div className="story-progress">
          {storyPages.map((_, index) => (
            <span 
              key={index} 
              className={index === currentPage ? 'active' : ''}
            />
          ))}
        </div>
        <p className="story-hint">Click or wait to continue...</p>
      </div>
    </div>
  )
}

export default Story

