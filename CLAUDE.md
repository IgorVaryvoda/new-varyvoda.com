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
- **Projects**: `/content/projects/` - Project showcases with metadata (featured, status, tech_stack, highlights)
- **Pages**: `/content/` - Static pages (about.md, contact.md)

### Custom Templates
Site uses hugo-coder theme but has custom template overrides in `/layouts/`:

- `/layouts/_default/baseof.html` - Base template with SEO metadata, dark mode only, custom OG image
- `/layouts/partials/home.html` - Custom homepage with latest posts + featured projects grid
- `/layouts/posts/single.html` - Blog post template
- `/layouts/projects/single.html` - Project detail page with breadcrumbs, tech stack badges, status indicators, and Sirv lazy loading
- `/layouts/projects/list.html` - Projects listing page

### Styling
- Theme SCSS files are in `/themes/hugo-coder/assets/scss/`
- Custom styles are embedded in template files (home.html, projects/single.html)
- Site uses dark mode only (`hidecolorschemetoggle = true` in config)

### Project Metadata
Projects use front matter with these special fields:
- `featured: true` - Shows on homepage (displays first 4)
- `status: active|archived|wip` - Color-coded status badges
- `tech_stack: [...]` - Array of technologies (displayed as badges)
- `highlights: [...]` - Key features list
- `image: "url"` - Project thumbnail/screenshot
- `project_url: "url"` - External project link

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

Deployed via GitHub Actions (.github/workflows/main.yml):
- On push to main: builds with pinned Hugo 0.161.1 extended, then rclone-syncs public/ to an SFTP server
- The site is fronted by Cloudflare
- netlify.toml is legacy/suspected-dead config — see plans/002-deploy-consolidation.md

## Important Notes

- Site is dark mode only (colorScheme = "dark", hidecolorschemetoggle = true)
- Custom OG image: `https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900`
- Homepage shows 5 latest posts and 4 featured projects
- All project pages include schema.org breadcrumbs for SEO
