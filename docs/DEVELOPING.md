# Developing Vitae

Notes for running and changing Vitae. For what it does, see the [README](../README.md).

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
docs/screenshots/     README images
```

No build step and no dependencies. Plain HTML, CSS and JavaScript modules.

## Run locally

ES modules need a local server (opening `index.html` directly won't work). In VS Code, use the **Live Server** extension, or run:

```
python -m http.server 8000
```

Then open http://localhost:8000. The service worker only activates on the live site, so local testing always loads fresh files.
