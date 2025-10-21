import React, { useState } from 'react';

function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorialSteps = [
    {
      title: "Welcome, Space Cadet! 🚀",
      content: "Welcome to Kaden & Adelynn Space Adventures! Let's learn the basics.",
      icon: "🌟"
    },
    {
      title: "Movement",
      content: "Use WASD or Arrow Keys to move your ship. On mobile, just touch and drag!",
      icon: "🎮"
    },
    {
      title: "Combat",
      content: "Press SPACE to shoot (or auto-fire on mobile). Destroy enemies to earn points, XP, and credits!",
      icon: "💥"
    },
    {
      title: "Ship Selection",
      content: "You have access to 20 unique ships! Each has special abilities. Unlock more by playing and leveling up.",
      icon: "🛸"
    },
    {
      title: "Daily Missions",
      content: "Complete 3 daily missions for bonus XP and credits. Missions refresh every 24 hours!",
      icon: "⭐"
    },
    {
      title: "Progression",
      content: "Earn XP to level up, unlock skills, and upgrade your abilities. Your progress is saved!",
      icon: "📈"
    },
    {
      title: "Ready to Launch!",
      content: "You're ready! Destroy enemies, collect power-ups, and save the galaxy. Good luck, pilot!",
      icon: "🚀"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('tutorialCompleted', 'true');
      onComplete();
    }
  };
  
  const handleSkip = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    onComplete();
  };
  
  const step = tutorialSteps[currentStep];
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div style={{ fontSize: '4em', marginBottom: '20px' }}>
          {step.icon}
        </div>
        
        <h2 style={{ color: '#00ccff', marginBottom: '15px' }}>
          {step.title}
        </h2>
        
        <p style={{ fontSize: '1.1em', lineHeight: '1.6', marginBottom: '30px', color: '#ccc' }}>
          {step.content}
        </p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            flex: 1,
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px'
          }}>
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-block',
                  width: `${100 / tutorialSteps.length}%`,
                  height: '100%',
                  background: index <= currentStep ? '#00ff88' : 'transparent',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            Skip Tutorial
          </button>
          
          <button
            onClick={handleNext}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : "Let's Go!"}
          </button>
        </div>
        
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '20px' }}>
          Step {currentStep + 1} of {tutorialSteps.length}
        </p>
      </div>
    </div>
  );
}

export default OnboardingTutorial;

