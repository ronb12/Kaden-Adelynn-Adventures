// Social sharing and screenshot capture

export function shareScore(score, wave, kills, combo) {
  const text = `I just scored ${score.toLocaleString()} points in Kaden & Adelynn Space Adventures! 🚀\n\nWave: ${wave}\nKills: ${kills}\nCombo: ${combo}\n\n#SpaceAdventures`
  
  if (navigator.share) {
    navigator.share({
      title: 'Kaden & Adelynn Space Adventures',
      text: text,
      url: window.location.href,
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(text)
    })
  } else {
    // Fallback to clipboard
    copyToClipboard(text)
  }
}

export function shareAchievement(achievementName, achievementDesc) {
  const text = `I just unlocked "${achievementName}" in Kaden & Adelynn Space Adventures! 🏆\n\n${achievementDesc}\n\n#SpaceAdventures`
  
  if (navigator.share) {
    navigator.share({
      title: 'Achievement Unlocked!',
      text: text,
      url: window.location.href,
    }).catch(() => {
      copyToClipboard(text)
    })
  } else {
    copyToClipboard(text)
  }
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification
      if (window.showToast) {
        window.showToast('Copied to clipboard!')
      }
    }).catch(() => {
      // Fallback for older browsers
      fallbackCopyToClipboard(text)
    })
  } else {
    fallbackCopyToClipboard(text)
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    if (window.showToast) {
      window.showToast('Copied to clipboard!')
    }
  } catch (err) {
    console.error('Failed to copy:', err)
  }
  
  document.body.removeChild(textArea)
}

export function captureScreenshot(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          resolve(url)
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}

export function downloadScreenshot(canvas, filename = 'screenshot.png') {
  captureScreenshot(canvas).then((url) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }).catch((error) => {
    console.error('Failed to capture screenshot:', error)
  })
}

export function shareScreenshot(canvas) {
  captureScreenshot(canvas).then((url) => {
    // Convert to File for sharing
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' })
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Kaden & Adelynn Space Adventures Screenshot',
            text: 'Check out my gameplay!',
            files: [file],
          }).catch(() => {
            // Fallback to download
            downloadScreenshot(canvas)
          })
        } else {
          // Fallback to download
          downloadScreenshot(canvas)
        }
        
        URL.revokeObjectURL(url)
      })
  }).catch((error) => {
    console.error('Failed to share screenshot:', error)
  })
}
