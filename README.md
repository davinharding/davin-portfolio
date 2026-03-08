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
│   ├── page.tsx            # Home: hero, projects grid, experience timeline
│   ├── portfolio/[name]/   # Dynamic project detail pages
│   ├── call/               # Book a Call (Calendly embed)
│   └── about/              # About page
├── components/
│   ├── Header.tsx           # Fixed nav with theme toggle
│   ├── LoadingAnimation.tsx # DH monogram intro animation
│   ├── ImageLightbox.tsx    # Full-screen gallery viewer
│   ├── ThemeProvider.tsx    # Dark/light mode context
│   └── ui/                  # Radix-based UI primitives
└── data/
    └── projectData.ts       # Project metadata, screenshots, tech stacks
```

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
