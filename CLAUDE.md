# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website/blog built with Hugo static site generator. The site features blog posts, project showcases, and uses the hugo-coder theme with custom modifications.

**Site URL**: https://www.varyvoda.com
**Hugo Version**: 0.161.1+extended — pinned in .github/workflows/main.yml; local builds should use the same version

## Key Commands

### Development
```bash
hugo server         # Start development server with live reload
hugo server -D      # Include draft content
```

### Building
```bash
hugo --gc --minify  # Build for production (same as CI)
```

### Content Management
```bash
hugo list drafts    # List all draft posts
hugo new posts/my-post.md        # Create new blog post
hugo new projects/my-project.md  # Create new project
```

## Architecture

### Content Structure
- **Blog posts**: `/content/posts/` - Main blog content with markdown files
- **Projects**: `/content/projects/` - Project showcases with role, stewardship, proof, feedback, and case-study content
- **Pages**: `/content/` - Static pages (about.md, contact.md)

### Custom Templates
Site uses hugo-coder theme but has custom template overrides in `/layouts/`:

- `/layouts/_default/baseof.html` - Base template with SEO metadata, dark-first theme handling, custom OG image
- `/layouts/partials/home.html` - Custom homepage with current focus, career strip, living portfolio, care feed, and curated writing
- `/layouts/posts/single.html` - Blog post template
- `/layouts/projects/single.html` - Project detail page with breadcrumbs, tech stack badges, status indicators, and Sirv lazy loading
- `/layouts/projects/list.html` - Projects listing page

### Styling
- Theme SCSS files are in `/themes/hugo-coder/assets/scss/`
- Shared, route-family, component, and page-system styles live under `/assets/css/`
- `design.md` defines the visual roles, page-family contracts, and responsive rules
- Large case-study visuals live in `/layouts/shortcodes/`; page-specific assets load through `page_css` and `page_js`
- The custom theme starts dark and includes its own light-mode toggle. `hidecolorschemetoggle = true` only hides the inherited theme control.

### Project Metadata
Public projects require `role`, `stewardship`, `last_tended`, `description`, `image_alt`, `feedback_url`, `proof`, and `imperfect`. Run `node scripts/validate-projects.mjs`; see `README.md` for the complete model.

### Image Handling
- Sirv CDN is used for image optimization and lazy loading
- Sirv.js script loaded on pages with images
- Images use `?w=600` query for responsive sizing
- Lazy loading with blur-up effect (`data-src` + `?q=10` placeholder)

## Configuration

Main config: `/config.toml`
- Base URL: https://www.varyvoda.com
- Theme: hugo-coder
- Disqus enabled for comments
- Custom syntax highlighting (catppuccin-mocha)
- Twemoji enabled
- Social links: Twitter, LinkedIn, GitHub

## Deployment

- Production is hosted on Igor's own server. GitHub Actions builds `main` with Hugo `0.161.1`, validates it, and syncs `public/` to that server over SFTP.
- Cloudflare may proxy production traffic, but it is not the host and there is no Cloudflare Pages deployment.
- The SFTP workflow checks production and submits changed URLs to IndexNow. It does not deploy `functions/`; verify that surface separately before describing it as live.
- `netlify.toml` is legacy.

## Important Notes

- Site defaults to dark; the custom footer control and homepage sun/moon interaction can switch to light
- Custom OG image: `https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900`
- Homepage prominence is explicit: one `hero` current focus and projects ordered by `homepage_weight`
- All project pages include schema.org breadcrumbs for SEO
