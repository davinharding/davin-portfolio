# Davin Harding Portfolio - Project Context & Direction

## Overview

This is a **personal developer portfolio website** for Davin Harding, a full-stack developer with 5+ years of experience specializing in **Web3/blockchain development, NFTs, and decentralized applications**. The site serves as both a showcase of technical work and a lead generation tool with integrated call scheduling.

**Live URL:** https://www.davin.io/

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 13 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |
| **Analytics** | Google Analytics + Vercel Analytics |
| **Animations** | react-awesome-reveal, tsParticles |
| **UI Components** | Headless UI, hamburger-react |
| **Special Integrations** | Calendly (scheduling), react-github-calendar |

---

## Design Language & Visual Identity

### Color Palette
- **Primary gradient:** Deep slate (`slate-950`) transitioning to vibrant fuchsia (`fuchsia-950`)
- **Accent gradient:** Purple → Pink → Red gradient (`from-purple-400 via-pink-500 to-red-500`) used for text highlights and hover states
- **Background:** Dark gray (`gray-900`) as base
- **Text:** White on dark backgrounds
- **Header scroll state:** Transforms from transparent to `fuchsia-950` with shadow on scroll

### Typography
- **Font:** Inter (Google Font)
- **Hero text:** 3xl mobile / 7xl desktop, bold
- **Section headings:** 5xl with subtle subheadings (lg)
- **Body:** Standard sizing with responsive adjustments

### Motion & Interactions
- **Particles background:** tsParticles "links" preset on hero section (desktop only)
- **Fade animations:** React Awesome Reveal for section entrances (cascade, direction: up)
- **Hover effects:** Scale transforms, color transitions, card lift effects
- **Profile image:** Custom 3D spin animation on hover (`spinTowards`/`spinAway` keyframes)
- **Smooth scrolling:** Enabled globally via CSS

### UI Patterns
- **Cards:** Rounded corners (`rounded-xl`), gradient backgrounds, shadow effects with hover lift (`-translate-y-4`)
- **Buttons:** Bordered outline style, white text, gradient fill on hover
- **Mobile menu:** Hamburger with slide-in dropdown, smooth Headless UI transitions
- **Project tags:** Pill-shaped badges with technology icons

---

## Site Structure

```
/ (Home)
├── Hero Section
│   ├── Animated greeting with rotating keywords
│   ├── Profile photo with 3D hover effect
│   ├── CTA: "Book a Call"
│   └── Particles background
├── Skills/Technologies Section
│   └── Grid of technology badges with icons
├── Projects Section
│   └── Card grid with project previews
├── Experience Timeline
│   └── Vertical timeline of work history
└── GitHub Contributions
    └── Two contribution calendars (professional + personal)

/portfolio
├── Projects list
└── /portfolio/[name] - Individual project detail pages

/call
└── Embedded Calendly scheduling widget
```

---

## Key Features

### 1. Hero Section with Dynamic Text
Rotating keywords cycle through Davin's specialties:
- Web3 dApps, NFTs, Web Apps, Mint Pages, E-commerce Stores, Smart Contracts, Landing Pages, SaaS Platforms

### 2. Project Portfolio
Six featured projects showcasing blockchain/Web3 work:
1. **Mintly** - NFT creator toolset (lead engineer project)
2. **Developer Portfolio** - This site itself
3. **Theta Vibes** - NFT staking dApp
4. **Metaverse Hospitality** - Ethereum smart contracts
5. **Tunies** - NFT smart contract with ERC721A
6. **Mythical Mushrooms** - Token-gated e-commerce

Each project includes:
- Multiple screenshots
- Technology tags with icons
- Links to live site, GitHub, smart contracts
- Detailed description on individual pages

### 3. Skills Showcase
Visual grid of ~24 technologies with logos:
- Languages: TypeScript, JavaScript, Solidity
- Frameworks: React, Next.js, Node.js, Express
- Web3: Ethers.js, Web3.js, Hardhat, IPFS, Arweave
- Cloud: AWS, Firebase, Vercel, Serverless
- Databases: PostgreSQL, DynamoDB
- Other: Stripe, Shopify, Jest, Material UI, Tailwind

### 4. Professional Timeline
Chronological work history from 2018 to present:
- Palm Tree NFT (Full Stack Developer)
- Independent consulting
- Blockchain developer course
- Maryville Consulting Group
- Wyncode Academy bootcamp

### 5. Calendly Integration
Embedded scheduling widget styled to match site theme (`background_color=262626&text_color=ffffff&primary_color=A21CAF`)

---

## Tone & Voice

- **Professional but approachable** - Uses "Hi, I'm Davin" casual intro
- **Action-oriented** - Clear CTAs, "Let's turn your ideas into reality!"
- **Web3-focused** - Emphasizes blockchain expertise and NFT experience
- **Results-driven** - Mentions metrics like "1k+ unique users" and "2k+ staking transactions"

---

## Component Architecture

### Layout Components
- `HeaderFooter` - Wraps pages with sticky header + footer
- `ContainerLayout` - Standard page wrapper with title + back navigation
- `Background` - Gradient/abstract background wrapper

### Section Components
- `MainContent` - Hero section with rotating text
- `SkillBadgeSection` - Technology grid
- `ProjectsSection` - Project cards grid
- `Timeline` - Vertical timeline with icons
- `GithubSection` - GitHub contribution calendars

### UI Components
- `Button` - Size variants (small/medium/large), loading state
- `ProjectCard` - Project preview with image, tags, links
- `SkillBadge` - Technology icon with name
- `SectionHeading` - Consistent section title styling
- `ScrollArrow` - Scroll indicator
- `ParticlesContainer` - Animated particle background

---

## Data Structure

Project and skill data is centralized in `/src/data/`:
- `projectData.ts` - Project definitions with images, descriptions, tech tags
- `skillBadgeData.ts` - Technology list with icons and links
- `timelineData.ts` - Work experience with styling and icons

---

## Design Principles to Maintain

1. **Dark-first aesthetic** - Always dark backgrounds, light text
2. **Gradient accents** - Use purple/pink/red gradients sparingly for emphasis
3. **Subtle animations** - Entrance reveals, hover states, nothing jarring
4. **Mobile responsive** - All layouts adapt, some features (particles) desktop-only
5. **Web3 identity** - Emphasize blockchain/NFT expertise in content
6. **Clean hierarchy** - Clear section breaks with consistent heading styles
7. **Professional polish** - Quality screenshots, comprehensive project details

---

## Future Considerations

The site is actively maintained. The `/about` page route exists but is commented out in navigation, suggesting potential future expansion. The codebase is well-organized for adding:
- Additional projects
- Blog/articles section
- More interactive portfolio features
- Additional scheduling options





