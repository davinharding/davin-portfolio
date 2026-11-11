<div align="center">

# davin.io

**Developer portfolio for Davin Harding**

A modern, responsive portfolio showcasing 8+ years of full-stack development, from AI-powered products to Web3 applications.

[![Live Site](https://img.shields.io/badge/Live-davin.io-4A90D9?style=for-the-badge&logo=vercel&logoColor=white)](https://davin.io)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ✨ Features

- **Thirty Seconds homepage**: enter a company's website and watch a live agent run read the site, profile the business, and draft a shareable blueprint of the AI agents I would build for it (`/b/<slug>`)
- **Branded intro animation** that draws the `<D>` logo and docks it into the header
- **Dark/light theme** with smooth transitions
- **Project showcase** with full-screen image lightbox and gallery navigation
- **Interactive experience timeline** spanning software engineering, Web3, and AI
- **Calendly integration** for booking calls directly from the site
- **GitHub contribution calendar** pulled live from the API
- **Particle network background** for a dynamic, polished feel
- **Fully responsive** across desktop, tablet, and mobile
- **Vercel Analytics** for traffic insights

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI primitives |
| Animations | CSS keyframes, react-awesome-reveal |
| Icons | Lucide, Font Awesome Pro |
| Image lightbox | yet-another-react-lightbox |
| Timeline | react-vertical-timeline-component |
| Scheduling | react-calendly |
| Deployment | Vercel |
| Analytics | @vercel/analytics |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home: one sentence and the blueprint launcher
│   ├── work/                 # The previous homepage: hero, projects, skills, timeline
│   ├── b/[slug]/             # Blueprint pages (examples from JSON, runs from Redis)
│   ├── sorry/[code]/         # Error landing for no-JavaScript form posts
│   ├── api/blueprint/        # POST: starts or resolves a run, streams NDJSON
│   ├── portfolio/[name]/     # Project detail pages
│   └── call/                 # Book a Call (Calendly embed)
├── components/
│   ├── thirty/               # Launcher, run console, blueprint view
│   └── ui/                   # Radix-based UI primitives
├── data/
│   ├── blueprints/           # Committed example blueprints
│   └── projectData.ts        # Project metadata, screenshots, tech stacks
└── lib/thirty/               # Pipeline, SSRF-guarded fetch, prompts, limits, budget, store
```

## 🧪 Thirty Seconds

The full spec is in `docs/specs/thirty-seconds.md`. Configuration lives in `.env.example`.

```bash
# Every flow without an API key or Redis (in-memory store, fixture output)
THIRTY_MOCK=1 npm run dev
# `<code>.test` hosts trigger outcomes: timeout.test, quality.test, not-a-company.test,
# unreachable.test, upstream.test, rate-limited.test, slow.test, fallback.test, drop.test

npm test                          # unit tests (no network, no credentials)
npm run thirty:examples           # regenerate examples via the live pipeline (needs ANTHROPIC_API_KEY)
npm run thirty:admin -- stats     # get <slug> | delete <slug> | stats (needs Redis env)
```

Live runs need `ANTHROPIC_API_KEY`, Upstash Redis (`KV_REST_API_URL`, `KV_REST_API_TOKEN`), and in production `THIRTY_IP_SALT`. `THIRTY_LIVE=off` is the kill switch; spend is capped at `THIRTY_MONTHLY_BUDGET_USD` (default $10/month).

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/davinharding/davin-portfolio.git
cd davin-portfolio

# Install
npm install

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

Deployed on **Vercel** with automatic deploys on push to `main`.

## 📬 Contact

- **Portfolio**: [davin.io](https://davin.io)
- **GitHub**: [@davinharding](https://github.com/davinharding)
- **Instagram**: [@hi_im_davin](https://instagram.com/hi_im_davin)

---

<div align="center">
  <sub>Built by Davin Harding</sub>
</div>
