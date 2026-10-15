// Vitae — "Publish as a page": builds a standalone index.html of the resume
// Author: direk james

import { esc, clone } from './util.js';
import { renderResume } from './templates.js';
import { GOOGLE_FONTS_URL, PAPER } from './state.js';

let cssCache = null;
async function resumeCss() {
  if (cssCache) return cssCache;
  const res = await fetch(new URL('../css/resume.css', import.meta.url));
  cssCache = await res.text();
  return cssCache;
}

export async function buildPublishedPage(source, opts) {
  const r = clone(source);
  if (!opts.phone) r.contact.phone = '';
  if (!opts.email) r.contact.email = '';
  if (!opts.personal) r.showPersonal = false;
  if (!opts.photo) r.showPhoto = false;
  const css = await resumeCss();
  const paper = PAPER[r.theme.paper] || PAPER.a4;
  const name = r.contact.name || 'Resume';
  const title = `${name}${r.contact.headline ? ' — ' + r.contact.headline : ''}`;
  const desc = (r.summary || r.contact.headline || `Resume of ${name}`).slice(0, 180);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="profile">
<meta name="theme-color" content="#ecebe7">
<meta name="generator" content="Vitae">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}">
<style>
${css}
html, body { margin: 0; }
body { background: #ecebe7; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.pub-wrap { display: flex; justify-content: center; padding: 48px 16px 96px; }
.pub-frame { position: relative; }
.pub-scale { transform-origin: top left; }
.pub-scale .vt-page { box-shadow: 0 1px 2px rgba(16,18,24,.06), 0 30px 70px -20px rgba(16,18,24,.28); border-radius: 2px; }
.pub-bar { position: fixed; right: 20px; bottom: 20px; display: flex; gap: 8px; z-index: 5; }
.pub-btn { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px; border-radius: 999px; border: 0; cursor: pointer;
  background: #0c0d10; color: #fff; font: 600 14px/1 'Inter', system-ui, sans-serif; box-shadow: 0 10px 30px -8px rgba(12,13,16,.5); }
.pub-btn:hover { background: #24262c; }
.pub-foot { text-align: center; color: #8a8c92; font: 500 12px/1.4 'Inter', system-ui, sans-serif; padding-bottom: 32px; }
.pub-foot b { color: #3a3c42; font-weight: 700; letter-spacing: -.01em; }
@page { size: ${paper.css}; margin: 0; }
@media print {
  body { background: #fff; }
  .pub-wrap { padding: 0; display: block; }
  .pub-frame { width: auto !important; height: auto !important; }
  .pub-scale { transform: none !important; }
  .pub-scale .vt-page { box-shadow: none; border-radius: 0; }
  .pub-bar, .pub-foot { display: none; }
}
</style>
</head>
<body>
<main class="pub-wrap"><div class="pub-frame" id="frame"><div class="pub-scale" id="scale">${renderResume(r)}</div></div></main>
<div class="pub-foot">Built with <b>Vitae</b></div>
<div class="pub-bar"><button class="pub-btn" onclick="window.print()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M5 21h14"/></svg>Download PDF</button></div>
<script>
(function () {
  var frame = document.getElementById('frame'), scale = document.getElementById('scale');
  function fit() {
    var page = scale.firstElementChild;
    scale.style.transform = 'none';
    var w = page.offsetWidth, h = page.offsetHeight;
    var s = Math.min(1, (document.documentElement.clientWidth - 32) / w);
    scale.style.transform = 'scale(' + s + ')';
    frame.style.width = w * s + 'px';
    frame.style.height = h * s + 'px';
  }
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
})();
</script>
</body>
</html>
`;
}
