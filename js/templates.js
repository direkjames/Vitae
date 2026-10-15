// Vitae — resume templates (pure HTML string renderers, shared by preview, print and publish)
// Author: direk james

import { esc, cleanUrl, toHref, icon } from './util.js';
import { SECTIONS, FONTS, FONT_STACK, HARVARD_FONT, PAPER, PERSONAL_FIELDS } from './state.js';

const has = (s) => !!String(s ?? '').trim();
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

export function sectionTitle(r, key) {
  return (r.titles?.[key] || '').trim() || SECTIONS[key].label;
}

function dateRange(start, end, current) {
  const e = current ? 'Present' : end;
  return [start, e].filter(has).map(esc).join(' – ');
}

function bulletList(list) {
  const items = (list || []).filter(has);
  return items.length ? `<ul class="vt-bullets">${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
}

function contactItems(r, { icons }) {
  const c = r.contact;
  const items = [];
  const add = (key, text, href) => {
    if (!has(text)) return;
    const ic = icons ? icon(key, 11, 'vt-ci') : '';
    const inner = `${ic}<span>${esc(text)}</span>`;
    items.push(href ? `<a class="vt-contact-item" href="${esc(href)}">${inner}</a>` : `<span class="vt-contact-item">${inner}</span>`);
  };
  add('mail', c.email, has(c.email) ? `mailto:${c.email.trim()}` : '');
  add('phone', c.phone, has(c.phone) ? `tel:${c.phone.replace(/[^\d+]/g, '')}` : '');
  add('pin', c.location);
  add('globe', cleanUrl(c.website), toHref(c.website));
  add('linkedin', cleanUrl(c.linkedin), toHref(c.linkedin));
  add('github', cleanUrl(c.github), toHref(c.github));
  return items;
}

function photo(r, cls = '') {
  return r.showPhoto && r.contact.photo ? `<img class="vt-photo ${cls}" src="${r.contact.photo}" alt="">` : '';
}

/* ---------- Section bodies ---------- */
function experience(r) {
  return r.experience
    .filter((e) => has(e.role) || has(e.company))
    .map(
      (e) => `<div class="vt-entry">
  <div class="vt-entry-head"><div class="vt-entry-title">${esc(e.role || e.company)}</div><div class="vt-entry-date">${dateRange(e.start, e.end, e.current)}</div></div>
  ${has(e.role) && (has(e.company) || has(e.location) || has(e.type)) ? `<div class="vt-entry-sub">${[e.company, e.type, e.location].filter(has).map(esc).join(' · ')}</div>` : ''}
  ${bulletList(e.bullets)}
</div>`,
    )
    .join('');
}

function projects(r) {
  return r.projects
    .filter((p) => has(p.name))
    .map(
      (p) => `<div class="vt-entry">
  <div class="vt-entry-head"><div class="vt-entry-title">${esc(p.name)}${has(p.url) ? ` <a class="vt-link" href="${esc(toHref(p.url))}">${esc(cleanUrl(p.url))}</a>` : ''}</div></div>
  ${has(p.tech) ? `<div class="vt-entry-sub">${esc(p.tech)}</div>` : ''}
  ${has(p.description) ? `<p class="vt-desc">${nl2br(p.description)}</p>` : ''}
  ${bulletList(p.bullets)}
</div>`,
    )
    .join('');
}

function education(r) {
  return r.education
    .filter((e) => has(e.school) || has(e.degree))
    .map(
      (e) => `<div class="vt-entry">
  <div class="vt-entry-head"><div class="vt-entry-title">${esc(e.degree || e.school)}</div><div class="vt-entry-date">${dateRange(e.start, e.end)}</div></div>
  ${has(e.degree) && (has(e.school) || has(e.location)) ? `<div class="vt-entry-sub">${[e.school, e.location].filter(has).map(esc).join(' · ')}</div>` : ''}
  ${has(e.details) ? `<p class="vt-desc">${nl2br(e.details)}</p>` : ''}
</div>`,
    )
    .join('');
}

function certifications(r) {
  return r.certifications
    .filter((c) => has(c.name))
    .map(
      (c) => `<div class="vt-entry vt-entry-tight">
  <div class="vt-entry-head"><div class="vt-entry-title">${has(c.url) ? `<a href="${esc(toHref(c.url))}">${esc(c.name)}</a>` : esc(c.name)}</div><div class="vt-entry-date">${esc(c.date || '')}</div></div>
  ${has(c.issuer) ? `<div class="vt-entry-sub">${esc(c.issuer)}</div>` : ''}
</div>`,
    )
    .join('');
}

const splitItems = (s) => String(s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

function skills(r, style) {
  const groups = r.skills.filter((g) => splitItems(g.items).length);
  if (!groups.length) return '';
  if (style === 'chips') {
    return groups
      .map(
        (g) => `<div class="vt-skill-group">${has(g.name) ? `<div class="vt-skill-name">${esc(g.name)}</div>` : ''}<div class="vt-chips">${splitItems(g.items)
          .map((s) => `<span>${esc(s)}</span>`)
          .join('')}</div></div>`,
      )
      .join('');
  }
  return `<div class="vt-skill-rows">${groups
    .map((g) => `<div class="vt-skill-row">${has(g.name) ? `<span class="vt-skill-name">${esc(g.name)}:</span> ` : ''}<span>${splitItems(g.items).map(esc).join(', ')}</span></div>`)
    .join('')}</div>`;
}

function summary(r) {
  return has(r.summary) ? `<p class="vt-summary">${nl2br(r.summary)}</p>` : '';
}

function personal(r) {
  if (!r.showPersonal) return '';
  const rows = PERSONAL_FIELDS.filter(([k]) => has(r.personal[k]));
  if (!rows.length) return '';
  return `<section class="vt-sec vt-sec-personal"><h2 class="vt-h">Personal Details</h2><div class="vt-sec-body"><dl class="vt-dl">${rows
    .map(([k, label]) => `<div><dt>${label}</dt><dd>${esc(r.personal[k])}</dd></div>`)
    .join('')}</dl></div></section>`;
}

function sectionHTML(r, key, skillStyle) {
  if (r.hidden?.[key]) return '';
  const body = { summary, experience, projects, education, certifications }[key]?.(r) ?? (key === 'skills' ? skills(r, skillStyle) : '');
  if (!body) return '';
  return `<section class="vt-sec vt-sec-${key}"><h2 class="vt-h">${esc(sectionTitle(r, key))}</h2><div class="vt-sec-body">${body}</div></section>`;
}

/* ---------- Page shell ---------- */
export function pageStyle(r) {
  const font = FONTS.find((f) => f.id === r.theme.font) || FONTS[0];
  const paper = PAPER[r.theme.paper] || PAPER.a4;
  const harvard = r.template === 'harvard';
  return [
    `--accent:${harvard ? '#111111' : r.theme.accent}`,
    `--fh:${harvard ? HARVARD_FONT : font.head + FONT_STACK}`,
    `--fb:${harvard ? HARVARD_FONT : font.body + FONT_STACK}`,
    `--page-w:${paper.w}mm`,
    `--page-h:${paper.h}mm`,
  ].join(';');
}

function shell(r, inner) {
  return `<article class="vt-page tpl-${esc(r.template)} density-${esc(r.theme.density)}" style="${esc(pageStyle(r))}">${inner}</article>`;
}

function nameBlock(r) {
  const c = r.contact;
  return `<h1 class="vt-name">${esc(c.name || 'Your Name')}</h1>${has(c.headline) ? `<div class="vt-headline">${esc(c.headline)}</div>` : ''}`;
}

const TPL = {
  meridian(r) {
    const main = r.sectionOrder.filter((k) => !SECTIONS[k].side).map((k) => sectionHTML(r, k, 'chips')).join('');
    const side = r.sectionOrder.filter((k) => SECTIONS[k].side).map((k) => sectionHTML(r, k, 'chips')).join('') + personal(r);
    const contact = contactItems(r, { icons: true });
    return shell(
      r,
      `<header class="vt-header">${photo(r)}<div class="vt-header-text">${nameBlock(r)}${contact.length ? `<div class="vt-contact">${contact.join('')}</div>` : ''}</div></header>
<div class="vt-body vt-cols"><div class="vt-main">${main}</div>${side ? `<aside class="vt-side">${side}</aside>` : ''}</div>`,
    );
  },
  atelier(r) {
    const secs = r.sectionOrder.map((k) => sectionHTML(r, k, 'rows')).join('') + personal(r);
    const contact = contactItems(r, { icons: false });
    return shell(
      r,
      `<header class="vt-header"><div class="vt-header-text">${nameBlock(r)}${contact.length ? `<div class="vt-contact">${contact.join('<i class="vt-dot"></i>')}</div>` : ''}</div>${photo(r)}</header>
<div class="vt-body">${secs}</div>`,
    );
  },
  plain(r) {
    const secs = r.sectionOrder.map((k) => sectionHTML(r, k, 'rows')).join('') + personal(r);
    const contact = contactItems(r, { icons: false });
    return shell(
      r,
      `<header class="vt-header"><div class="vt-header-text">${nameBlock(r)}${contact.length ? `<div class="vt-contact">${contact.join('<span class="vt-sep"> | </span>')}</div>` : ''}</div>${photo(r)}</header>
<div class="vt-body">${secs}</div>`,
    );
  },
};

/* ---------- Harvard: classic, formal, serif ---------- */
const H = {
  row(left, right, cls = '') {
    return `<div class="vt-hrow ${cls}"><div class="vt-hl">${left}</div>${right ? `<div class="vt-hr">${right}</div>` : ''}</div>`;
  },
  experience(r) {
    return r.experience
      .filter((e) => has(e.role) || has(e.company))
      .map((e) => {
        const top = has(e.company) ? e.company : e.role;
        const role = [has(e.company) && has(e.role) ? e.role : '', e.type].filter(has).join(', ');
        return `<div class="vt-entry">${H.row(`<b>${esc(top)}</b>`, esc(e.location || ''))}${role || dateRange(e.start, e.end, e.current) ? H.row(`<i>${esc(role)}</i>`, dateRange(e.start, e.end, e.current), 'vt-hsub') : ''}${bulletList(e.bullets)}</div>`;
      })
      .join('');
  },
  education(r) {
    return r.education
      .filter((e) => has(e.school) || has(e.degree))
      .map((e) => {
        const top = has(e.school) ? e.school : e.degree;
        const deg = has(e.school) && has(e.degree) ? e.degree : '';
        return `<div class="vt-entry">${H.row(`<b>${esc(top)}</b>`, esc(e.location || ''))}${deg || dateRange(e.start, e.end) ? H.row(`<i>${esc(deg)}</i>`, dateRange(e.start, e.end), 'vt-hsub') : ''}${has(e.details) ? `<p class="vt-desc">${nl2br(e.details)}</p>` : ''}</div>`;
      })
      .join('');
  },
  projects(r) {
    return r.projects
      .filter((p) => has(p.name))
      .map(
        (p) =>
          `<div class="vt-entry">${H.row(`<b>${esc(p.name)}</b>${has(p.tech) ? `<i class="vt-htech">, ${esc(p.tech)}</i>` : ''}`, has(p.url) ? `<a href="${esc(toHref(p.url))}">${esc(cleanUrl(p.url))}</a>` : '')}${has(p.description) ? `<p class="vt-desc">${nl2br(p.description)}</p>` : ''}${bulletList(p.bullets)}</div>`,
      )
      .join('');
  },
  certifications(r) {
    return r.certifications
      .filter((c) => has(c.name))
      .map((c) => `<div class="vt-entry vt-entry-tight">${H.row(`<b>${has(c.url) ? `<a href="${esc(toHref(c.url))}">${esc(c.name)}</a>` : esc(c.name)}</b>${has(c.issuer) ? `, ${esc(c.issuer)}` : ''}`, esc(c.date || ''))}</div>`)
      .join('');
  },
  section(r, key) {
    if (r.hidden?.[key]) return '';
    const body = key === 'summary' ? summary(r) : key === 'skills' ? skills(r, 'rows') : H[key](r);
    if (!body) return '';
    return `<section class="vt-sec vt-sec-${key}"><h2 class="vt-h">${esc(sectionTitle(r, key))}</h2><div class="vt-sec-body">${body}</div></section>`;
  },
};

TPL.harvard = (r) => {
  const secs = r.sectionOrder.map((k) => H.section(r, k)).join('') + personal(r);
  const contact = contactItems(r, { icons: false });
  const c = r.contact;
  return shell(
    r,
    `<header class="vt-header"><h1 class="vt-name">${esc(c.name || 'Your Name')}</h1>${has(c.headline) ? `<div class="vt-headline">${esc(c.headline)}</div>` : ''}${contact.length ? `<div class="vt-contact">${contact.join('<span class="vt-sep"> | </span>')}</div>` : ''}</header>
<div class="vt-body">${secs}</div>`,
  );
};

export function renderResume(r) {
  return (TPL[r.template] || TPL.meridian)(r);
}

// Plain text of everything on the resume (used by the job matcher)
export function resumeText(r) {
  const parts = [r.contact.headline, r.contact.location, r.summary];
  if (r.showPersonal) parts.push(r.personal.languages);
  r.experience.forEach((e) => parts.push(e.role, e.company, e.type, e.location, ...(e.bullets || [])));
  r.projects.forEach((p) => parts.push(p.name, p.tech, p.description, ...(p.bullets || [])));
  r.skills.forEach((g) => parts.push(g.name, g.items));
  r.education.forEach((e) => parts.push(e.school, e.degree, e.details));
  r.certifications.forEach((c) => parts.push(c.name, c.issuer));
  return parts.filter(Boolean).join('\n');
}
