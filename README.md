# React Learner

An interactive academy for learning React by **building and understanding** — 16 hands-on mini projects, 9 live labs that visualize how React really works (rendering, state, hooks, effects, reconciliation, concurrency), and a full theory curriculum.

## What's inside

- **16 mini projects** — Counter, TodoList, Pomodoro, Calculator, Quiz, VirtualList, LiveChat, TicTacToe, PasswordGenerator, ColorPalette, CurrencyConverter, Invoice generator, Accordion, Modal & Toasts, ThemeStudio, Cosmic Gallery. Each one ships with source code, explanations and the concept it teaches.
- **9 live labs** — interactive panels that show React's internals as you toggle them: render counts, declarative UI, JSX output, keys and reconciliation, effects lifecycle, hooks behaviour, snapshots, performance and concurrent rendering.
- **Theory track** — structured lessons from beginner to advanced with quizzes.
- **Command palette** — press `Ctrl/⌘ + K` to jump anywhere.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev) build tooling
- [Tailwind CSS 4](https://tailwindcss.com) (CSS-first config)
- A ~30-line hand-rolled hash router (`useSyncExternalStore`) — no router dependency

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
```

Requires Node.js >= 20 (`.nvmrc` pins the CI version).

## Deployment

Hosted on Netlify. Production builds are published from `main` automatically via GitHub Actions (`.github/workflows/deploy-netlify.yml`), with deploy previews for pull requests. The pipeline needs two repository secrets:

| Secret | Where to find it |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify → Site → Site configuration → Environment variables (`NETLIFY_SITE_ID`), or from the API under Sites |

`netlify.toml` configures the build command, publish directory and cache/security headers, so manual or UI-based deploys work identically.

## Learning the CI/CD

Two GitHub Actions workflows run on every push:

1. **CI** (`ci.yml`) — `npm ci`, typecheck, build. Blocks broken merges before they reach production.
2. **Deploy** (`deploy-netlify.yml`) — builds and publishes to Netlify; pushes to `main` go to production, PRs get aliased preview URLs.

## License

MIT © Ansh Roshan
