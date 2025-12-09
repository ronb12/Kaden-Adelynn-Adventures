import { useState, useEffect } from 'react'
import './Story.css'

const storyPages = [
  {
    title: '🌌 The Distress Signal',
    content:
      'A desperate transmission echoes across the void: "The Shadow Fleet has returned! They\'re consuming entire star systems! We need help!" Kaden and Adelynn, legendary space pilots, receive the call.',
    character: '📡',
  },
  {
    title: '👾 The Ancient Enemy',
    content:
      'The Shadow Fleet - thought destroyed centuries ago - has awakened. Led by the mysterious Dark Commander, they seek to extinguish all light in the galaxy. Their armada grows stronger with each planet they consume.',
    character: '👾',
  },
  {
    title: '⚔️ The Last Stand',
    content:
      'With the Galactic Defense Force scattered, Kaden and Adelynn are the galaxy\'s last hope. Kaden\'s precision strikes and Adelynn\'s devastating barrages must work in perfect harmony to survive the onslaught.',
    character: '⚔️',
  },
  {
    title: '💎 The Power Within',
    content:
      'Ancient power crystals scattered across the battlefield can turn the tide. Collect them to unlock devastating weapons, shields, and abilities. But beware - the Shadow Fleet seeks them too.',
    character: '💎',
  },
  {
    title: '👑 The Final Boss',
    content:
      'At the heart of the invasion, the Dark Commander awaits. A massive warship capable of destroying entire fleets. Only by mastering every weapon, every power-up, and every strategy can victory be achieved.',
    character: '👑',
  },
  {
    title: '🚀 Your Destiny Awaits',
    content:
      'The battle begins now. Choose your ship, select your difficulty, and prepare for the fight of your life. The galaxy\'s future depends on your skill, courage, and determination. Let\'s show them what heroes are made of!',
    character: '🚀',
  },
]

function Story({ onContinue }) {
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1)
      }
    }, 4000) // Increased time to read the more detailed story
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
            <span key={index} className={index === currentPage ? 'active' : ''} />
          ))}
        </div>
        <p className="story-hint">Click or wait to continue...</p>
      </div>
    </div>
  )
}

export default Story
