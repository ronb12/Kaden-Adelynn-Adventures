# 🚀 Kaden & Adelynn Space Adventures

A fun, kid-friendly space shooter game inspired by classic arcade games like Gradius! Built with pure HTML5, CSS, and JavaScript - no external dependencies required.

## 🎮 Play the Game

**[Play Now!](https://ronb12.github.io/Kaden-Adelynn-Adventures/)**

## 🎯 Game Features

- **Gradius-style gameplay** with smooth scrolling and classic ship designs
- **Multiple weapon levels** - upgrade from single shot to 5-shot spread
- **Power-up system** - collect health and weapon upgrades
- **Progressive difficulty** - enemies get faster and more numerous as you level up
- **Kid-friendly design** - colorful graphics and accessible controls
- **Responsive controls** - works with keyboard, mouse, and touch
- **No external dependencies** - pure HTML5/CSS/JavaScript

## 🎮 Controls

### Keyboard Controls:
- **Arrow Keys** or **WASD** - Move your ship
- **Spacebar** - Shoot
- **Enter** - Start game / Restart

### Mouse/Touch Controls:
- **Move mouse** - Ship follows cursor
- **Click** - Shoot
- **Touch and drag** - Move ship (mobile)

## 🎨 Game Elements

### Player Ship (Vic Viper-style):
- Blue Gradius-style fighter with detailed design
- Wings, cockpit, engine exhaust, and wing tips
- Smooth movement with boundary constraints

### Enemies:
- Red Zub-style enemy ships
- Drop from top of screen
- Get faster with each level

### Power-ups:
- **Green Cross** - Health bonus (+1 life, max 5)
- **Yellow Star** - Weapon upgrade (+1 level, max 5)

### Weapon Levels:
1. **Level 1** - Single shot
2. **Level 2** - Double shot
3. **Level 3** - Triple shot
4. **Level 4** - Spread shot
5. **Level 5** - 5-shot spread (maximum)

## 🏆 Scoring System

- **Enemy destroyed** - 10 points
- **Level progression** - Every 1000 points
- **Lives** - Start with 3, collect health power-ups
- **High score tracking** - Try to beat your best!

## 🛠️ Technical Details

### Built With:
- **HTML5 Canvas** - Smooth 60fps rendering
- **CSS3** - Modern styling and animations
- **Vanilla JavaScript** - No frameworks or libraries
- **Web Audio API** - Sound effects (if implemented)

### Browser Compatibility:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Performance:
- Optimized for smooth gameplay
- Efficient collision detection
- Minimal memory usage
- Works on older devices

## 🚀 How to Run Locally

1. **Clone or download** the repository
2. **Open `index.html`** in your web browser
3. **Start playing!** No server required

```bash
# Or use a local server (optional)
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📁 Project Structure

```
gradius-clone/
├── index.html          # Main game page
├── main.js            # Game logic and rendering
├── style.css          # Styling and animations
└── README.md          # This file
```

## 🎯 Game Mechanics

### Movement:
- Ship stays within screen boundaries
- Smooth acceleration and deceleration
- Mouse and keyboard support

### Combat:
- Bullet collision detection
- Enemy health system
- Explosion effects
- Power-up collection

### Progression:
- Score-based leveling
- Increasing enemy speed
- More frequent enemy spawns
- Weapon upgrades

## 🌟 Special Features

- **Starfield background** - Animated scrolling stars
- **Explosion effects** - Particle-like explosion animations
- **Responsive design** - Works on desktop and mobile
- **Accessibility** - Clear visual feedback and controls
- **Performance optimized** - Smooth 60fps gameplay

## 🎨 Visual Design

- **Gradius-inspired** ship designs
- **Colorful power-ups** with glow effects
- **Smooth animations** for all game elements
- **Clean UI** with score, lives, and level display
- **Professional styling** with modern CSS

## 🔧 Customization

The game is easily customizable:
- Modify ship designs in `drawPlayer()` and `drawEnemy()`
- Adjust game balance in the constants section
- Change colors and styling in `style.css`
- Add new power-up types or weapon patterns

## 📱 Mobile Support

- Touch controls for mobile devices
- Responsive canvas scaling
- Optimized for mobile performance
- Works on tablets and phones

## 🎉 Have Fun!

This game was created for Kaden & Adelynn to enjoy classic arcade-style space shooting action. Perfect for kids and adults alike who love retro gaming!

---

**Created with ❤️ for Kaden & Adelynn**



