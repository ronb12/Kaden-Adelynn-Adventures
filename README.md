# Kaden & Adelynn Space Adventures

Arcade space shooter built with React + Vite + Canvas, deployed to Firebase Hosting.

## Highlights
- Health shown as percentage; 25 lives with respawn + brief invulnerability
- Bosses with multi-phase patterns and multi-mount firing
- Asteroids split into smaller fragments
- Upgrades and coins; Daily Challenge modifiers
- CC0 SFX with OGG/MP3 and procedural fallback
- PWA support (installable), versioned service-worker cache

## Getting Started
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Deploy (Hosting-only)
Ensure you’re logged into Firebase CLI, then:
```bash
firebase deploy --only hosting
```

### GitHub Actions auto-deploy
A workflow at `.github/workflows/firebase-hosting.yml` builds the project and deploys to Firebase Hosting whenever `main` is updated (or when triggered manually). To enable it:

1. Generate a CI token with `firebase login:ci`.
2. Add the token to the repo secrets as `FIREBASE_TOKEN`.

The workflow installs the Rollup native optional dependency that Vite expects, runs `npm run build`, and then executes `firebase deploy --only hosting --project kaden---adelynn-adventures`.

## Structure
- `src/components/Game.jsx` — game loop, rendering, collisions, HUD
- `src/components/MainMenu.jsx` — menu, upgrades, daily challenge
- `src/utils/` — bosses, drawing, music, sounds, wallet, sfx synth
- `public/` — PWA assets, service worker, CC0 SFX

## PWA
- Manifest short_name: "Kaden & Adelynn Space Adventures"
- To force updates, bump cache version in `public/sw.js`

## Contributing
See `CONTRIBUTING.md`. Use provided issue/PR templates.

## Attribution
This product is a project of Bradley Virtual Solutions, LLC.

## Credits (CC0 SFX)
- Kenney UI Audio (CC0) — `https://kenney.nl/assets/ui-audio`
- OpenGameArt CC0 selections — `https://opengameart.org/`

## License
Proprietary unless otherwise noted for third-party assets (CC0 SFX).
