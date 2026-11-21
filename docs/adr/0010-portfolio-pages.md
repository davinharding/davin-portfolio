# 0010. Portfolio pages are static, drafts are reachable but hidden

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)

## Context

The portfolio lists projects at `/work` and `/portfolio`, in the header dropdown and in the sitemap, with a detail page per project. Project names contain spaces and reserved characters. Some projects are still being written up.

## Decision

**Drafts**
- A project with `draft: true` is hidden from every listing (`/work`, `/portfolio`, the header dropdown, the sitemap) and from the static build, but its detail route still resolves so it can be previewed by direct URL. Draft pages are `noindex, nofollow`. Remove the flag to publish.
- `getPublishedProjects()` is used anywhere projects are listed. The full `projects` array stays the source of truth for direct-URL access.

**URLs**
- `projectPath()` is the only place the URL scheme lives. It uses `encodeURIComponent`, because `encodeURI` would leave `&`, `?`, `#` and `+` unescaped and break routing.
- `generateStaticParams` returns raw, decoded names. Next.js encodes segments itself, and pre-encoding causes double encoding (`AI%2520Designer`), so client navigations to the single-encoded URL would 404.
- Every published detail page is prerendered at build time, so navigations are served as static HTML and prefetching works end to end.

**Performance**
- The lightbox (yet-another-react-lightbox, its plugins and CSS) loads only when an image is clicked. The thumbnail grid renders at once with `next/image`.
- The lightbox's Zoom plugin derives its maximum zoom from `slide.width`/`height`, so slides without dimensions fall back to the built-in renderer, which measures them.
- The first row of project cards (three columns at `lg`) loads its images with priority, as above the fold on most screens.
- The floating orbs (`WaveParticlesAlt`) are skipped below 640 px, respect reduced motion, and pause when off screen or when the tab is hidden.

**Old links**
- The old homepage sections now live on `/work`; `LegacyHashRedirect` keeps their anchors working.

## Where

- `src/data/projectData.ts` (`draft`, `getPublishedProjects`, `projectPath`)
- `src/app/portfolio/[name]/page.tsx`, `ProjectGallery.tsx`, `LightboxModal.tsx`
- `src/components/ProjectCard.tsx`, `WaveParticlesAlt.tsx`, `thirty/LegacyHashRedirect.tsx`
