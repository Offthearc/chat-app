# CLAUDE.md — React Frontend

## Project type: React frontend (Vite)

## Setup
- Node.js 18+
- Dependencies in package.json
- Entry point: src/main.tsx

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Deploy: `vercel --prod --yes --token $VERCEL_TOKEN`

## Rules
- Use TypeScript for all new files
- Prefer functional components with hooks
- No class components
- Tests required before marking any feature done
- Update feature_list.json status after each feature is complete
- Always run `npm run build` and confirm it passes before deploying
