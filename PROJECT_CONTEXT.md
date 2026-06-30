# Davin Harding Portfolio — Project Context & Direction

## Overview

This is the **personal developer portfolio website** for Davin Harding, a full-stack engineer with 8+ years of experience. The current focus is **AI/SaaS product development** — designing, building, and shipping production-grade AI applications — backed by a strong history in Web3/blockchain and traditional software engineering. The site is both a showcase of technical work and a lead-generation tool with integrated call scheduling.

**Live URL:** https://www.davin.io/

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | React 18 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 with CSS-variable design tokens |
| **UI components** | shadcn/ui (new-york style) built on Radix UI primitives |
| **Icons** | Lucide (`lucide-react`) |
| **Background FX** | Custom HTML `<canvas>` animation (`WaveParticlesAlt`) |
| **Image lightbox** | yet-another-react-lightbox |
| **Scheduling** | react-calendly |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics; optional Google Analytics gated behind `NEXT_PUBLIC_GOOGLE_ANALYTICS` |

> Keep this table in sync with `package.json` and `components.json` — those are the source of truth for exact versions and the shadcn/ui config.

---

## Design Language & Visual Identity

### Theming
- The whole UI is driven by CSS variables (HSL tokens) defined in `src/app/globals.css` and mapped into Tailwind via `tailwind.config.ts`.
- **Dark is the default.** A light theme is available via the header toggle; `ThemeProvider` persists the choice in `localStorage` and an inline boot script in `layout.tsx` applies it before first paint to avoid a flash.
- Semantic tokens are used everywhere (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `primary`, `secondary`, etc.) rather than hard-coded colors.

### Color Palette (dark default)
- **Background/surface:** very dark slate (`--background: 222.2 84% 4.9%`)
- **Primary accent:** blue (`--primary: 217.2 91.2% 59.8%`)
- **Foreground:** near-white (`210 40% 98%`)
- The legacy purple/pink/fuchsia gradient identity has been retired in favor of this cleaner, blue-accented, token-based system.

### Typography
- **Font:** Inter (via `next/font/google`), exposed as `--font-inter`.
- Reusable typographic utilities (e.g. `heading-hero`, `text-body`, `container-narrow`) are defined in `globals.css`.

### Motion & Interactions
- **Splash overlay:** painted from CSS before JS runs; skipped for repeat visits within a session (class set by the boot script).
- **Background canvas:** `WaveParticlesAlt` renders floating gradient orbs. It is deliberately performance-conscious — skipped on viewports `< 640px`, paused via `IntersectionObserver` when off-screen, paused on hidden tabs, and disabled under `prefers-reduced-motion`.
- **Subtle UI motion:** hover/scale transitions, an animated scroll indicator, and theme transitions scoped to affected surfaces only.

### UI Patterns
- shadcn/ui primitives (`Button`, `Card`, `Badge`, `Separator`, `DropdownMenu`, `Sheet`, ...) provide consistent, accessible building blocks.
- Mobile navigation uses a Radix-based `Sheet` (slide-in drawer); desktop uses a dropdown for the portfolio menu.
- Project technologies render as `Badge` pills; skills render as logo badges.

---

## Site Structure

```
/ (Home)
├── Hero (MainContent)
│   ├── Headline, subhead, value prop
│   ├── Profile photo card + availability note
│   ├── CTAs: "Book a Call" / "View Projects"
│   └── Animated canvas background (WaveParticlesAlt)
├── Projects (ProjectsSection)
│   └── Card grid of published projects
├── Skills (SkillBadgeSection)
│   └── Grid of technology logo badges
└── Experience (Timeline, id="experience")
    └── Work history

/portfolio
├── page.tsx                 # Published projects index
└── /portfolio/[name]        # Individual project detail pages
    ├── ProjectHero          # Lead screenshot
    ├── Tech-stack badges + external links
    ├── Pipe-delimited description rendered as paragraphs
    └── ProjectGallery + LightboxModal

/call
└── Embedded Calendly scheduling widget (CalendlyEmbed)

# Generated, not pages:
/robots.txt   (app/robots.ts)
/sitemap.xml  (app/sitemap.ts — published projects only)
```

---

## Key Features

### 1. Hero
A focused hero in `MainContent.tsx`: "Hi, I'm Davin." plus an AI/SaaS value proposition, a profile card with an availability note, and two CTAs. The rotating-keyword treatment from earlier versions has been removed.

### 2. Project Portfolio
Projects live in `src/data/projectData.ts`. Current lineup leads with AI/SaaS work and keeps Web3 history:
1. **StageSnap** — AI-powered real estate photo staging (flagship Harding Labs product)
2. **AI Agent Platform** — multi-tenant agentic system inside ApparelMagic's ERP *(currently `draft`)*
3. **AI Designer** — prompt-to-garment generative tool integrated with ApparelMagic
4. **Mintly** — NFT creator toolset (lead engineer)
5. **Developer Portfolio** — this site
6. **Theta Vibes** — NFT staking dApp
7. **Metaverse Hospitality** — Ethereum smart contracts
8. **Tunies** — ERC721A NFT smart contract

Each project supports up to five screenshots, technology tags, and optional `liveLink` / `githubLink` / `smartContractLink` / `demoLink`.

**Draft mechanism:** a project flagged `draft: true` is hidden from the home page, `/portfolio`, the nav dropdown, OG metadata, and the sitemap, and is excluded from `generateStaticParams`. Its detail route still resolves so it can be previewed by direct URL, and it is marked `noindex`. Use `getPublishedProjects()` anywhere projects are listed and `projectPath(name)` to build detail URLs (it `encodeURIComponent`s names so spaces/reserved chars route correctly).

### 3. Skills Showcase
A logo grid driven by `src/data/skillBadgeData.ts`, spanning languages, frameworks, Web3 tooling, cloud/infra, databases, and the AI stack (LangChain, OpenAI, Anthropic, Gemini, Replicate, Supabase, Clerk, Sentry, etc.). Logos live in `public/logos/`.

### 4. Experience Timeline
`src/data/timelineData.ts` drives a chronological history rendered by `Timeline.tsx`, from the Wyncode bootcamp (2018) through Maryville Consulting, Palm Tree NFT, ApparelMagic (Senior Software Engineer, AI product work), and Harding Labs (Founder).

### 5. Calendly Integration
`/call` renders an embedded Calendly widget (`CalendlyEmbed`) themed to match the site.

### 6. SEO & Metadata
`layout.tsx` sets rich default metadata, Open Graph/Twitter cards, and injects a JSON-LD `Person` schema. Per-route `generateMetadata` adds canonical URLs and per-project OG data. `sitemap.ts` and `robots.ts` are generated and respect the draft mechanism.

---

## Tone & Voice

- **Professional but approachable** — "Hi, I'm Davin" intro.
- **AI/SaaS-forward** — emphasizes shipping production-grade AI products that solve real business problems.
- **Results-driven** — concrete outcomes and metrics in project write-ups.
- **Breadth as depth** — Web3 and enterprise software history support the current AI focus rather than competing with it.

---

## Component Architecture

### Layout / Shell
- `HeaderFooter` — wraps pages with `Header` + `<main>` + `Footer`.
- `ContainerLayout` — standard inner page wrapper (title + back navigation) used by project detail pages.
- `Header` — fixed, blurred nav: logo, portfolio dropdown (desktop) / sheet (mobile), Experience scroll, Book a Call, Email, theme toggle.

### Section Components
- `MainContent` — hero section.
- `ProjectsSection` / `ProjectCard` — project grid and cards.
- `SkillBadgeSection` — technology grid.
- `Timeline` — work history.

### Effects / Utilities
- `WaveParticlesAlt` — animated canvas background.
- `LoadingAnimation` — splash sequence.
- `ThemeProvider` — dark/light context + persistence.
- `GoogleAnalytics` — optional GA loader (rendered only when the env var is set).
- `SilenceScriptWarning` — suppresses a dev-only React warning for inline `<head>` scripts.

### UI Primitives (`src/components/ui/`)
shadcn/ui components: `button`, `card`, `badge`, `separator`, `dropdown-menu`, `sheet`. Add new primitives via the shadcn CLI (config in `components.json`).

---

## Data Structure

All content data is centralized in `src/data/`:
- `projectData.ts` — `Project`/`ProjectTag` types, the `projects` array, the shared `projectTags` map, the `draft` flag, and the `getPublishedProjects()` / `projectPath()` helpers.
- `skillBadgeData.ts` — `SkillData` list (name, logo, link).
- `timelineData.ts` — `TimelineElement` work-history entries.

To add a project, append to `projects` (reuse or extend `projectTags`), drop screenshots in `public/projectScreenshots/`, and the home page, `/portfolio`, nav, and sitemap pick it up automatically once it is not a draft.

---

## Design Principles to Maintain

1. **Token-first styling** — use semantic Tailwind tokens, never hard-coded colors, so theming stays consistent.
2. **Dark-default, light-capable** — preserve the no-flash boot behavior when touching theming.
3. **Performance-conscious motion** — keep animations cheap and gated (reduced-motion, off-screen, hidden-tab, small-viewport).
4. **Accessibility** — semantic landmarks, focus states, `aria-*`, and `sr-only` labels are already in place; keep them.
5. **Mobile responsive** — every layout adapts; some effects (canvas) are desktop-only by design.
6. **Single source of truth for data** — content lives in `src/data/`, not inline in components.
7. **AI/SaaS-forward identity** — lead with AI product work; keep Web3 and enterprise history as supporting depth.

---

## Future Considerations

The site is actively maintained and structured for easy growth:
- Publishing the `AI Agent Platform` project (flip `draft`).
- Additional projects and skills (data-driven, low-friction).
- A potential blog/writing section.
- Further SEO and performance refinements.
