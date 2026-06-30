<div align="center">

# davin.io

**Developer portfolio for Davin Harding**

A modern, responsive portfolio showcasing 8+ years of full-stack work, now focused on shipping production-grade AI and SaaS products.

[![Live Site](https://img.shields.io/badge/Live-davin.io-4A90D9?style=for-the-badge&logo=vercel&logoColor=white)](https://www.davin.io)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Features

- **Splash loading overlay** that paints before first JS and is skipped for repeat visits (no FOUC)
- **Dark/light theme** with a no-flash boot script and smooth, scoped transitions
- **Project showcase** with full-screen image lightbox and gallery navigation
- **Draft projects** that stay hidden from nav, listings, and the sitemap but remain previewable by direct URL
- **Experience timeline** spanning AI product work, Web3, and traditional software engineering
- **Calendly integration** for booking calls directly from the site
- **Animated canvas background** (floating gradient orbs) that pauses off-screen, on hidden tabs, and respects reduced motion
- **SEO baked in**: per-route metadata, Open Graph/Twitter cards, JSON-LD `Person` schema, dynamic `sitemap.ts` and `robots.ts`
- **Fully responsive** across desktop, tablet, and mobile
- **Analytics**: Vercel Analytics, with optional Google Analytics gated behind an env var

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3, CSS variables |
| UI primitives | shadcn/ui (new-york style) on Radix UI |
| Icons | Lucide |
| Image lightbox | yet-another-react-lightbox |
| Background FX | Custom HTML canvas (`WaveParticlesAlt`) |
| Scheduling | react-calendly |
| Deployment | Vercel |
| Analytics | @vercel/analytics (+ optional Google Analytics) |

> The full, exact dependency versions live in [`package.json`](./package.json).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: metadata, JSON-LD, theme boot script, analytics
│   ├── page.tsx              # Home: hero, projects, skills, experience timeline
│   ├── globals.css           # Tailwind layers, theme tokens, splash overlay
│   ├── robots.ts             # Generated robots.txt
│   ├── sitemap.ts            # Generated sitemap (published projects only)
│   ├── portfolio/
│   │   ├── page.tsx          # Projects index
│   │   └── [name]/           # Dynamic project detail pages + gallery/lightbox
│   └── call/                 # Book a Call (Calendly embed)
├── components/
│   ├── Header.tsx            # Fixed nav: portfolio dropdown, theme toggle, mobile sheet
│   ├── Footer.tsx
│   ├── HeaderFooter.tsx      # Page shell (header + main + footer)
│   ├── MainContent.tsx       # Hero section
│   ├── ProjectsSection.tsx / ProjectCard.tsx
│   ├── SkillBadgeSection.tsx
│   ├── Timeline.tsx
│   ├── ThemeProvider.tsx     # Dark/light context
│   ├── LoadingAnimation.tsx  # Splash sequence
│   ├── WaveParticlesAlt.tsx  # Canvas background
│   └── ui/                   # shadcn/ui primitives (button, card, badge, sheet, ...)
├── data/
│   ├── projectData.ts        # Projects, tags, draft flag, path helpers
│   ├── skillBadgeData.ts     # Skill badges + logos
│   └── timelineData.ts       # Work history
├── lib/
│   └── utils.ts              # cn() class merge helper
└── types/
    └── svg.d.ts              # SVG import typing
```

## Getting Started

```bash
# Clone
git clone https://github.com/davinharding/davin-portfolio.git
cd davin-portfolio

# Install
npm install

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`--max-warnings=0`) |
| `npm run typecheck` | `tsc --noEmit` |

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | No | Google Analytics measurement ID. When unset, the GA script is not rendered. |

## Deployment

Deployed on **Vercel** with automatic deploys on push to `main`.

## Contact

- **Portfolio**: [davin.io](https://www.davin.io)
- **GitHub**: [@davinharding](https://github.com/davinharding)
- **LinkedIn**: [davinharding](https://www.linkedin.com/in/davinharding/)

---

<div align="center">
  <sub>Built by Davin Harding</sub>
</div>
