# 🛠️ Development Guide

Welcome to the Kaden & Adelynn Adventures development guide! This document provides everything you need to know to work with the organized codebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- Git
- Modern web browser
- Code editor (VS Code recommended)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd kaden-adelynn-adventures

# Install dependencies
npm install

# Set up Firebase (optional for local development)
npm run setup-firebase
```

### Running the Game
1. Open `index.html` in a modern web browser
2. Or serve locally with a simple HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (install globally: npm install -g http-server)
   http-server
   
   # Using PHP
   php -S localhost:8000
   ```

## 📁 Working with the New Structure

### **src/** Directory
This is where all your source code lives:

#### **src/css/**
- `game.css` - Main game stylesheet
- Add new CSS files here for additional components
- Use CSS custom properties for theming
- Follow BEM naming convention for classes

#### **src/js/**
- `game.js` - Main game logic and engine
- `sw.js` - Service worker for PWA functionality
- Add new JavaScript modules here

### **assets/** Directory
For all static assets:

#### **assets/icons/**
- All favicon and app icon variants
- Follow naming convention: `icon-{size}x{size}.png`
- Maintain consistent sizing for PWA requirements

#### **assets/images/** (Future)
- Game sprites and graphics
- Background images
- UI elements

### **docs/** Directory
Keep documentation updated:
- Update relevant docs when making changes
- Use Markdown for consistency
- Include code examples where helpful

## 🎮 Game Development Workflow

### 1. **Game Logic Changes**
Edit `src/js/game.js`:
- Main game class: `EnhancedSpaceShooter`
- Add new features as methods
- Keep related functionality grouped
- Comment complex algorithms

### 2. **Styling Updates**
Edit `src/css/game.css`:
- Use CSS custom properties for colors/sizes
- Maintain mobile responsiveness
- Test across different screen sizes
- Follow the existing naming conventions

### 3. **Asset Management**
- Add new icons to `assets/icons/`
- Update `manifest.json` if adding new icon sizes
- Optimize images before committing
- Use appropriate formats (PNG for icons, JPEG for photos)

### 4. **Testing**
Use the test files in `tests/`:
- `test-drawing.html` - Test rendering systems
- `debug-game.html` - Debug game mechanics
- Add new test files as needed

## 🔧 Code Style Guidelines

### **JavaScript**
```javascript
// Use modern ES6+ features
class GameComponent {
    constructor(options = {}) {
        this.options = { ...this.defaultOptions, ...options };
    }
    
    // Use descriptive method names
    updatePlayerPosition(deltaTime) {
        // Implementation
    }
    
    // Document complex logic
    /**
     * Calculates weapon damage based on level and type
     * @param {string} weaponType - Type of weapon
     * @param {number} level - Weapon level
     * @returns {number} Calculated damage
     */
    calculateDamage(weaponType, level) {
        // Implementation
    }
}

// Use arrow functions for short callbacks
this.enemies.forEach(enemy => enemy.update(deltaTime));

// Use const/let appropriately
const GAME_SETTINGS = {
    CANVAS_WIDTH: 1000,
    CANVAS_HEIGHT: 700
};
```

### **CSS**
```css
/* Use CSS custom properties */
:root {
    --primary-color: #00ffff;
    --secondary-color: #ff00ff;
    --game-border-radius: 10px;
}

/* Follow BEM naming */
.game-ui__score-display {
    color: var(--primary-color);
}

.btn--primary {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
}

/* Use mobile-first approach */
.game-container {
    /* Mobile styles */
}

@media (min-width: 768px) {
    .game-container {
        /* Desktop styles */
    }
}
```

## 🚀 Performance Guidelines

### **JavaScript Performance**
- Use `requestAnimationFrame` for animations
- Pool objects to reduce garbage collection
- Minimize DOM queries in game loops
- Use efficient collision detection algorithms

### **CSS Performance**
- Avoid expensive properties in animations (use transform/opacity)
- Use `will-change` for elements that will animate
- Minimize reflows and repaints
- Use hardware acceleration when beneficial

### **Asset Optimization**
- Compress images appropriately
- Use appropriate formats (WebP when supported)
- Implement lazy loading for non-critical assets
- Minimize HTTP requests

## 🧪 Testing Strategy

### **Manual Testing**
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (desktop, tablet, mobile)
- Test different screen orientations
- Verify PWA functionality

### **Automated Testing** (Future)
```javascript
// Example test structure
describe('Game Engine', () => {
    test('should initialize player correctly', () => {
        const game = new EnhancedSpaceShooter();
        expect(game.player.health).toBe(100);
        expect(game.player.lives).toBe(3);
    });
});
```

## 🔐 Security Considerations

### **Firebase**
- Never commit `firebase-config.js` with real credentials
- Use environment variables for sensitive data
- Regularly review Firestore security rules
- Test security rules thoroughly

### **General**
- Sanitize user inputs
- Validate all data client-side and server-side
- Use HTTPS in production
- Keep dependencies updated

## 📱 PWA Development

### **Service Worker**
Edit `src/js/sw.js`:
- Update cache version when making changes
- Add new assets to cache as needed
- Test offline functionality
- Handle cache updates gracefully

### **Manifest**
Update `manifest.json`:
- Add new icon sizes as needed
- Update version information
- Test install experience
- Verify all PWA criteria

## 🚀 Deployment

### **Local Development**
```bash
# Start local server
npm start  # (if you add this script to package.json)

# Or use any static file server
python -m http.server 8000
```

### **Firebase Hosting**
```bash
# Build and deploy
firebase deploy

# Deploy specific components
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

### **Other Platforms**
- Netlify: Connect GitHub repository
- Vercel: Import project from Git
- GitHub Pages: Enable in repository settings

## 🔄 Git Workflow

### **Branch Naming**
- `feature/weapon-system-upgrade`
- `bugfix/collision-detection`
- `docs/api-documentation`
- `refactor/audio-system`

### **Commit Messages**
```
feat: add homing missile weapon type
fix: resolve collision detection edge case
docs: update API documentation
refactor: extract audio system into separate module
style: improve CSS organization
test: add unit tests for player movement
```

### **Pull Requests**
- Use the provided PR template
- Include screenshots for UI changes
- Test thoroughly before requesting review
- Update documentation as needed

## 📚 Additional Resources

- [MDN Web Docs](https://developer.mozilla.org/en-US/) - Web APIs and standards
- [Firebase Documentation](https://firebase.google.com/docs) - Firebase features
- [PWA Guide](https://web.dev/progressive-web-apps/) - Progressive Web Apps
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 2D graphics

---

Happy coding! 🎮✨