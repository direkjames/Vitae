// Vitae — shared helpers
// Author: direk james

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
export function setPath(obj, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], obj);
  target[last] = val;
}

export function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export const clone = (o) => JSON.parse(JSON.stringify(o));

export function move(arr, from, to) {
  const [it] = arr.splice(from, 1);
  arr.splice(to, 0, it);
}

export function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function cleanUrl(u = '') {
  return String(u).trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}
export function toHref(u = '') {
  const v = String(u).trim();
  if (!v) return '';
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  return 'https://' + v;
}

export function download(filename, content, type = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---------- Icons (stroke icons, 24px grid) ---------- */
const c = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const p = (d) => `<path d="${d}"/>`;
const ICONS = {
  grip: c(9, 6, 1) + c(9, 12, 1) + c(9, 18, 1) + c(15, 6, 1) + c(15, 12, 1) + c(15, 18, 1),
  plus: p('M12 5v14M5 12h14'),
  trash: p('M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M18.5 6l-.9 13.2A2 2 0 0 1 15.6 21H8.4a2 2 0 0 1-2-1.8L5.5 6M10 11v6M14 11v6'),
  chevDown: p('m6 9 6 6 6-6'),
  chevRight: p('m9 6 6 6-6 6'),
  eye: p('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z') + c(12, 12, 3),
  eyeOff: p('M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2'),
  download: p('M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M5 21h14'),
  upload: p('M12 17V5m0 0L7.5 9.5M12 5l4.5 4.5M5 21h14'),
  globe: c(12, 12, 9.5) + p('M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19'),
  wand: p('M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5'),
  sparkle: p('M12 3l1.8 4.9a2 2 0 0 0 1.2 1.2L20 11l-4.9 1.8a2 2 0 0 0-1.2 1.2L12 19l-1.8-4.9a2 2 0 0 0-1.2-1.2L4 11l4.9-1.8a2 2 0 0 0 1.2-1.2z'),
  copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/>' + p('M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8'),
  check: p('M20 6 9 17l-5-5'),
  alert: p('M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'),
  x: p('M18 6 6 18M6 6l12 12'),
  pencil: p('M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),
  image: '<rect x="3" y="3" width="18" height="18" rx="2.5"/>' + c(9, 9, 2) + p('m21 15-5-5L5 21'),
  link: p('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'),
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/>' + p('m22 7-10 6.5L2 7'),
  phone: p('M21.5 16.4v2.9a2 2 0 0 1-2.2 2A19.7 19.7 0 0 1 2.7 4.7a2 2 0 0 1 2-2.2h2.9a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.6 10.2a16 16 0 0 0 5.2 5.2l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z'),
  pin: p('M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0z') + c(12, 10, 2.6),
  github: p('M9 19c-4.5 1.4-4.5-2.5-6.5-3M15.5 22v-3.6a3.2 3.2 0 0 0-.9-2.4c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.5s-1.1-.4-3.7 1.4a12.7 12.7 0 0 0-6.7 0C6.2 1.9 5.1 2.3 5.1 2.3A4.8 4.8 0 0 0 5 5.8a5.1 5.1 0 0 0-1.4 3.6c0 5.1 3.1 6.3 6.1 6.6a3.2 3.2 0 0 0-.9 2.4V22'),
  linkedin: p('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z') + c(4, 4, 2),
  layout: '<rect x="3" y="3" width="18" height="18" rx="2.5"/>' + p('M3 9h18M9 21V9'),
  target: c(12, 12, 9.5) + c(12, 12, 5.5) + c(12, 12, 1.5),
  file: p('M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8zM14 2.5V8h5.5M15.5 13h-7M15.5 17h-7M10.5 9h-2'),
  layers: p('m12 2.5 9.5 4.8-9.5 4.8-9.5-4.8zM2.5 16.7l9.5 4.8 9.5-4.8M2.5 12l9.5 4.8 9.5-4.8'),
  user: c(12, 8, 4) + p('M4 21a8 8 0 0 1 16 0'),
  lock: '<rect x="4.5" y="10.5" width="15" height="11" rx="2.5"/>' + p('M8 10.5V7a4 4 0 0 1 8 0v3.5'),
  palette: p('M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 2.5-2 3.5-4 3.5h-2a2 2 0 0 0-1.4 3.4c.6.6.5 2.6-2.1 2.6z') + c(7.5, 11, 1) + c(10, 7, 1) + c(14.5, 7, 1),
  briefcase: '<rect x="2.5" y="7" width="19" height="13.5" rx="2.5"/>' + p('M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2.5 13h19'),
  more: c(5, 12, 1) + c(12, 12, 1) + c(19, 12, 1),
  info: c(12, 12, 9.5) + p('M12 16v-4.5M12 8h.01'),
  printer: p('M6 9V3h12v6M6 18H4.5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H18') + '<rect x="6" y="14" width="12" height="7.5" rx="1"/>',
  box: p('M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8'),
};
export const icon = (name, size = 16, cls = '') =>
  `<svg class="i ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
