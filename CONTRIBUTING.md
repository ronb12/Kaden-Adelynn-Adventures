Contributing Guide
==================

Thanks for your interest in improving Kaden & Adelynn Space Adventures!

Workflow
--------
1. Create a branch from `main`.
2. Make changes with clear commit messages.
3. Run locally: `npm install`, `npm run dev`, `npm run build`.
4. Lint/format: `npm run lint` if configured.
5. Open a Pull Request using the template.

Deployment
----------
This project deploys manually to Firebase Hosting.

- Build: `npm run build`
- Deploy: `firebase deploy --only hosting`

Standards
---------
- Keep code clear and readable; prefer descriptive names and early returns.
- Avoid catching errors without handling.
- Keep Canvas/game loop performant; avoid deep nesting.
- Keep assets CC0 or properly licensed.

Project Owner
-------------
Bradley Virtual Solutions, LLC.


