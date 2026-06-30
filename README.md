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

- **Branded loading animation** with stroke-drawn DH monogram
- **Dark/light theme** with smooth transitions
- **Project showcase** with full-screen image lightbox and gallery navigation
- **Writing / blog** — Git-native, type-safe Markdown posts (Velite) with an editorial layout, tag filtering, RSS feed, and a hand-written voice corpus (see [`BLOG.md`](./BLOG.md))
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
│   ├── page.tsx            # Home: hero, projects, writing, skills, timeline
│   ├── portfolio/[name]/   # Dynamic project detail pages
│   ├── blog/               # Writing index + /blog/[slug] article pages
│   ├── feed.xml/           # RSS feed route
│   ├── call/               # Book a Call (Calendly embed)
│   └── about/              # About page
├── components/
│   ├── Header.tsx           # Fixed nav with theme toggle
│   ├── WritingSection.tsx   # Landing-page "Writing" block
│   ├── blog/                # PostCard, FeaturedPost
│   ├── LoadingAnimation.tsx # DH monogram intro animation
│   ├── ImageLightbox.tsx    # Full-screen gallery viewer
│   ├── ThemeProvider.tsx    # Dark/light mode context
│   └── ui/                  # Radix-based UI primitives
├── content/
│   └── blog/                # Hand-written Markdown/MDX posts (the voice corpus)
├── lib/
│   └── blog.ts              # Typed queries over the Velite content layer
└── data/
    └── projectData.ts       # Project metadata, screenshots, tech stacks
```

Content is authored in `src/content/blog/` and compiled by [Velite](https://velite.js.org)
into a type-safe data layer. See [`BLOG.md`](./BLOG.md) for the authoring
workflow and the hand-written-only voice-corpus convention.

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
