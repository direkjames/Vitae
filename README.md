# Vitae

A premium, private resume builder that runs entirely in your browser. No account, no server, no tracking. Works offline and installs like an app.

**Author:** direk james

## Features

- **Form editor** for Profile, Summary, Experience, Projects, Skills, Education and Certifications
- **Live preview** that updates as you type
- **4 templates:** Meridian (modern two-column), Atelier (elegant single column), Plain (ATS-friendly) and Harvard (classic serif, Education first)
- **PDF export** with A4 and US Letter sizes
- **Auto-save** to your browser (IndexedDB). Nothing leaves your device
- **Drag to reorder** sections and entries (mouse, touch, or keyboard arrows on the handle)
- **Multiple versions**, e.g. "Minecraft dev", "Web dev", "General VA"
- **Backup & import** of all versions as a `.json` file
- **One-page fit indicator** that warns when content spills onto page 2
- **Optional photo and personal details**, toggleable for local or international applications
- **Projects with links** to show off your work
- **Installable PWA** that works offline
- **Job description matcher:** paste a job post to see matched and missing keywords
- **Themes:** accent colors, 7 sans-serif font pairings, spacing density
- **Bullet helper:** action verbs by profession (Developer, Teacher, BPO, Retail, Service Crew, Merchandiser, Creative, Editor, Designer, Video Editor, Illustrator) plus tips
- **Headline separators:** one-tap · • | — and more, inserted at the cursor
- **Built-in guide:** walkthrough and template comparison, opens on first visit and from the Guide button
- **Publish as a page:** export a standalone `index.html` of your resume to host on GitHub Pages

## Project structure

```
index.html            App shell
manifest.webmanifest  PWA manifest
sw.js                 Service worker (offline cache)
css/app.css           App interface styles
css/resume.css        Resume templates (also embedded in published pages)
js/main.js            App controller and event handling
js/state.js           Data model, defaults, versions, backup
js/db.js              IndexedDB storage
js/templates.js       Resume HTML renderers
js/editor.js          Editor panels (Content, Design, Job match)
js/sortable.js        Drag-to-reorder
js/matcher.js         Job description keyword matcher
js/verbs.js           Action verbs and bullet tips
js/publish.js         Standalone page export
js/guide.js           How-to guide
icons/                App icons
```

No build step and no dependencies. Plain HTML, CSS and JavaScript modules.

## Run locally

ES modules need a local server (opening `index.html` directly won't work). In VS Code, use the **Live Server** extension, or run:

```
python -m http.server 8000
```

Then open http://localhost:8000. (The service worker only activates on the live site, so local testing always loads fresh files.)

## Deploy to GitHub Pages

1. Create a repository named `vitae` and push these files to the `main` branch.
2. On GitHub go to **Settings → Pages**, set Source to **Deploy from a branch**, and choose `main` / `(root)`.
3. Your app will be live at `https://direkjames.github.io/vitae/`.

When you ship an update, bump `VERSION` in `sw.js` (e.g. `vitae-v1.0.1`) so installed copies pick up the new files.
