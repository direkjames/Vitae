// Vitae — editor panel renderers (Content, Design, Job match)
// Author: direk james

import { esc, icon } from './util.js';
import { SECTIONS, TEMPLATES, FONTS, ACCENTS, PERSONAL_FIELDS, EMPLOYMENT_TYPES } from './state.js';
import { lintBullet } from './verbs.js';
import { sectionTitle } from './templates.js';

export const ui = {
  tab: 'content',
  closedSections: new Set(),
  openEntries: new Set(),
  personalOpen: false,
};

/* ---------- Small building blocks ---------- */
function selectField(label, path, value, options, emptyLabel) {
  const opts = [`<option value="">${esc(emptyLabel)}</option>`, ...options.map((v) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(v)}</option>`)];
  if (value && !options.includes(value)) opts.push(`<option value="${esc(value)}" selected>${esc(value)}</option>`);
  return `<label class="field"><span class="field-label">${label}</span><select data-bind="${path}">${opts.join('')}</select></label>`;
}

function field(label, path, value, o = {}) {
  const ph = o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : '';
  const ctl = o.area
    ? `<textarea data-bind="${path}" rows="${o.rows || 3}"${ph} class="autogrow">${esc(value)}</textarea>`
    : `<input type="${o.type || 'text'}" data-bind="${path}" value="${esc(value)}"${ph}${o.disabled ? ' disabled' : ''}${o.list ? ` data-field="${o.list}"` : ''} autocomplete="off" spellcheck="${o.spell ? 'true' : 'false'}">`;
  return `<label class="field${o.full ? ' full' : ''}"><span class="field-label">${label}</span>${ctl}${o.hint ? `<span class="field-hint">${o.hint}</span>` : ''}</label>`;
}

export function toggle(label, path, checked, sub = '') {
  return `<label class="switch-row"><span class="switch"><input type="checkbox" data-bind="${path}"${checked ? ' checked' : ''}><i></i></span><span class="switch-text"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
}

export function hintsHTML(text) {
  return lintBullet(text)
    .map((h) => `<span class="hint hint-${h.kind}">${icon(h.kind === 'warn' ? 'alert' : 'sparkle', 12)}${esc(h.text)}</span>`)
    .join('');
}

function bulletsEditor(path, bullets, placeholder) {
  const rows = bullets
    .map(
      (b, i) => `<div class="bullet-row">
  <span class="bdot"></span>
  <textarea class="bullet-input autogrow" rows="1" data-bind="${path}.${i}" data-bullet placeholder="${esc(placeholder)}" spellcheck="true">${esc(b)}</textarea>
  <button class="ib" data-act="verbs" data-path="${path}.${i}" title="Action verbs" aria-label="Action verbs">${icon('wand', 15)}</button>
  <button class="ib ib-danger" data-act="del-bullet" data-list="${path}" data-i="${i}" title="Remove bullet" aria-label="Remove bullet">${icon('x', 14)}</button>
</div>
<div class="bullet-hints" data-hints-for="${path}.${i}">${hintsHTML(b)}</div>`,
    )
    .join('');
  return `<div class="bullets"><div class="bullets-label">Bullet points <span>Enter adds a new one</span></div>${rows}<button class="add-inline" data-act="add-bullet" data-list="${path}">${icon('plus', 14)} Add bullet</button></div>`;
}

export function entrySummary(key, e) {
  const j = (...a) => a.filter((x) => String(x || '').trim()).join(' · ');
  switch (key) {
    case 'experience': {
      const dates = e.current ? (e.start ? `${e.start} – Present` : 'Present') : [e.start, e.end].filter((x) => String(x || '').trim()).join(' – ');
      return { title: e.role || e.company || 'New position', sub: j(e.role ? e.company : '', e.type, dates) };
    }
    case 'projects': return { title: e.name || 'New project', sub: e.tech || '' };
    case 'skills': return { title: e.name || 'Skill group', sub: String(e.items || '').split(',').filter((x) => x.trim()).length + ' skills' };
    case 'education': return { title: e.degree || e.school || 'New education', sub: e.degree ? e.school : '' };
    case 'certifications': return { title: e.name || 'New certification', sub: j(e.issuer, e.date) };
    default: return { title: '', sub: '' };
  }
}

function entryFields(key, e, base) {
  const p = (k) => `${base}.${k}`;
  switch (key) {
    case 'experience':
      return `<div class="grid2">
${field('Job title', p('role'), e.role, { placeholder: 'e.g. Plugin Developer' })}
${field('Company', p('company'), e.company, { placeholder: 'e.g. Oneblock Network' })}
${field('Start', p('start'), e.start, { placeholder: 'Jan 2023' })}
${field('End', p('end'), e.current ? '' : e.end, { placeholder: e.current ? 'Present' : 'Dec 2024', disabled: e.current })}
${field('Location', p('location'), e.location, { placeholder: 'Remote · Manila' })}
${selectField('Employment type', p('type'), e.type || '', EMPLOYMENT_TYPES, 'Not shown')}
<div class="field full">${toggle('I currently work here', p('current'), e.current)}</div>
</div>${bulletsEditor(p('bullets'), e.bullets, 'Built a feature that…')}`;
    case 'projects':
      return `<div class="grid2">
${field('Project name', p('name'), e.name, { placeholder: 'e.g. dkBank' })}
${field('Link', p('url'), e.url, { placeholder: 'github.com/you/project' })}
${field('Tech / role', p('tech'), e.tech, { placeholder: 'Java · Paper API', full: true })}
${field('Description', p('description'), e.description, { area: true, rows: 2, full: true, spell: true, placeholder: 'One or two lines on what it is and why it matters.' })}
</div>${bulletsEditor(p('bullets'), e.bullets, 'Optional highlight, e.g. 2,000+ downloads')}`;
    case 'skills':
      return `<div class="grid2">
${field('Group name', p('name'), e.name, { placeholder: 'e.g. Languages', full: true })}
${field('Skills', p('items'), e.items, { area: true, rows: 2, full: true, placeholder: 'Java, Kotlin, JavaScript', hint: 'Separate skills with commas.' })}
</div>`;
    case 'education':
      return `<div class="grid2">
${field('Degree / course', p('degree'), e.degree, { placeholder: 'BS Information Technology', full: true })}
${field('School', p('school'), e.school, { placeholder: 'University name' })}
${field('Location', p('location'), e.location, { placeholder: 'City' })}
${field('Start', p('start'), e.start, { placeholder: '2018' })}
${field('End', p('end'), e.end, { placeholder: '2022' })}
${field('Details', p('details'), e.details, { area: true, rows: 2, full: true, spell: true, placeholder: 'Honors, thesis, relevant coursework (optional)' })}
</div>`;
    case 'certifications':
      return `<div class="grid2">
${field('Certification', p('name'), e.name, { placeholder: 'e.g. Google IT Support', full: true })}
${field('Issuer', p('issuer'), e.issuer, { placeholder: 'Coursera' })}
${field('Date', p('date'), e.date, { placeholder: '2024' })}
${field('Link', p('url'), e.url, { placeholder: 'credential URL (optional)', full: true })}
</div>`;
  }
  return '';
}

const ADD_LABEL = { experience: 'Add position', projects: 'Add project', skills: 'Add skill group', education: 'Add education', certifications: 'Add certification' };

function sectionCard(r, key) {
  const open = !ui.closedSections.has(key);
  const hidden = !!r.hidden[key];
  const list = Array.isArray(r[key]) ? r[key] : null;
  let body = '';
  if (key === 'summary') {
    body = field('', 'summary', r.summary, { area: true, rows: 4, full: true, spell: true, placeholder: 'Two to four sentences: who you are, what you do best, and what you want next.' });
  } else {
    const entries = list
      .map((e, i) => {
        const s = entrySummary(key, e);
        const eo = ui.openEntries.has(e.id);
        return `<div class="entry${eo ? ' open' : ''}" data-sort-item data-id="${e.id}">
  <div class="entry-head">
    <button class="grip" data-drag aria-label="Drag to reorder" title="Drag to reorder">${icon('grip', 14)}</button>
    <button class="entry-toggle" data-act="toggle-entry" data-id="${e.id}">
      <span class="entry-title" data-summary-title="${e.id}">${esc(s.title)}</span>
      <span class="entry-sub" data-summary-sub="${e.id}">${esc(s.sub)}</span>
    </button>
    <button class="ib" data-act="dup-entry" data-key="${key}" data-i="${i}" title="Duplicate" aria-label="Duplicate">${icon('copy', 14)}</button>
    <button class="ib ib-danger" data-act="del-entry" data-key="${key}" data-i="${i}" title="Delete" aria-label="Delete">${icon('trash', 14)}</button>
    <span class="chev">${icon('chevDown', 16)}</span>
  </div>
  ${eo ? `<div class="entry-body">${entryFields(key, e, `${key}.${i}`)}</div>` : ''}
</div>`;
      })
      .join('');
    body = `<div class="entries" data-sort-list="${key}">${entries}</div><button class="add-btn" data-act="add-entry" data-key="${key}">${icon('plus', 15)} ${ADD_LABEL[key]}</button>`;
  }
  const count = list ? `<span class="count">${list.length}</span>` : '';
  return `<div class="sec-card${open ? ' open' : ''}${hidden ? ' is-hidden' : ''}" data-sort-item data-key="${key}">
  <div class="sec-head">
    <button class="grip" data-drag aria-label="Drag to reorder section" title="Drag to reorder">${icon('grip', 15)}</button>
    <input class="sec-title" data-bind="titles.${key}" value="${esc(r.titles[key] || '')}" placeholder="${esc(SECTIONS[key].label)}" aria-label="Section title" spellcheck="false">
    ${count}
    <button class="ib" data-act="toggle-hidden" data-key="${key}" title="${hidden ? 'Show on resume' : 'Hide from resume'}" aria-label="Toggle visibility">${icon(hidden ? 'eyeOff' : 'eye', 15)}</button>
    <button class="ib chev-btn" data-act="toggle-sec" data-key="${key}" aria-label="Collapse">${icon('chevDown', 16)}</button>
  </div>
  ${open ? `<div class="sec-body">${body}</div>` : ''}
</div>`;
}

export function renderContent(r) {
  const c = r.contact;
  const photo = c.photo
    ? `<img src="${c.photo}" alt="">`
    : `<span class="photo-empty">${icon('user', 26)}</span>`;
  const personalOpen = ui.personalOpen;
  return `<div class="card profile-card">
  <div class="card-head"><div><h3>Profile</h3><p>How employers reach you.</p></div></div>
  <div class="photo-row">
    <button class="photo" data-act="photo" title="Upload photo">${photo}<span class="photo-edit">${icon('image', 14)}</span></button>
    <div class="photo-meta">
      <div class="photo-btns"><button class="btn sm" data-act="photo">${icon('upload', 14)} ${c.photo ? 'Replace' : 'Upload'} photo</button>${c.photo ? `<button class="btn sm ghost" data-act="remove-photo">Remove</button>` : ''}</div>
      ${toggle('Show photo', 'showPhoto', r.showPhoto)}
    </div>
  </div>
  <div class="grid2">
    ${field('Full name', 'contact.name', c.name, { placeholder: 'Juan Dela Cruz', full: true })}
    <label class="field full"><span class="field-label">Headline</span><span class="input-with-btn"><input type="text" data-bind="contact.headline" value="${esc(c.headline)}" placeholder="Web Developer · Virtual Assistant" autocomplete="off" spellcheck="false"><button class="sep-btn" data-act="separators" title="Insert a separator" aria-label="Insert a separator"><span>·</span><span>|</span><span>•</span></button></span><span class="field-hint">Tip: use the separator button to split your titles, e.g. Video Editor · Designer</span></label>
    ${field('Email', 'contact.email', c.email, { type: 'email', placeholder: 'you@email.com' })}
    ${field('Phone', 'contact.phone', c.phone, { type: 'tel', placeholder: '+63 9xx xxx xxxx' })}
    ${field('Location', 'contact.location', c.location, { placeholder: 'City, Country' })}
    ${field('Website', 'contact.website', c.website, { placeholder: 'yoursite.com' })}
    ${field('LinkedIn', 'contact.linkedin', c.linkedin, { placeholder: 'linkedin.com/in/you' })}
    ${field('GitHub', 'contact.github', c.github, { placeholder: 'github.com/you' })}
  </div>
  <div class="sub-block${personalOpen ? ' open' : ''}">
    <button class="sub-head" data-act="toggle-personal"><span><b>Personal details</b><small>Often expected by Philippine employers. Turn off for international roles.</small></span>${icon('chevDown', 16, 'chev')}</button>
    ${personalOpen ? `<div class="sub-body">${toggle('Show personal details on resume', 'showPersonal', r.showPersonal)}<div class="grid2">${PERSONAL_FIELDS.map(([k, label, ph]) => field(label, `personal.${k}`, r.personal[k], { placeholder: ph })).join('')}</div></div>` : ''}
  </div>
</div>
<div class="list-label"><span>Sections</span><small>Drag to reorder · rename by clicking a title</small></div>
<div class="sections" data-sort-list="sectionOrder">${r.sectionOrder.map((k) => sectionCard(r, k)).join('')}</div>
<p class="foot-note">${icon('lock', 13)} Everything stays on this device. Nothing is uploaded.</p>`;
}

/* ---------- Design tab ---------- */
export const THUMBS = {
  meridian: `<svg viewBox="0 0 120 150"><rect width="120" height="150" fill="#fff"/><circle cx="20" cy="22" r="9" fill="var(--a)" opacity=".25"/><rect x="34" y="15" width="48" height="7" rx="2" fill="#1a1d24"/><rect x="34" y="26" width="30" height="4" rx="2" fill="var(--a)"/><rect x="10" y="38" width="100" height="1" fill="#e5e5e5"/><g fill="#d4d4d8"><rect x="10" y="47" width="22" height="3" rx="1.5" fill="var(--a)"/><rect x="10" y="55" width="58" height="3" rx="1.5"/><rect x="10" y="61" width="52" height="3" rx="1.5"/><rect x="10" y="67" width="55" height="3" rx="1.5"/><rect x="10" y="79" width="22" height="3" rx="1.5" fill="var(--a)"/><rect x="10" y="87" width="58" height="3" rx="1.5"/><rect x="10" y="93" width="50" height="3" rx="1.5"/><rect x="10" y="99" width="56" height="3" rx="1.5"/><rect x="10" y="105" width="44" height="3" rx="1.5"/></g><rect x="76" y="46" width=".8" height="90" fill="#e5e5e5"/><g fill="var(--a)" opacity=".22"><rect x="82" y="55" width="13" height="5" rx="2.5"/><rect x="97" y="55" width="13" height="5" rx="2.5"/><rect x="82" y="62" width="18" height="5" rx="2.5"/><rect x="82" y="69" width="11" height="5" rx="2.5"/></g><rect x="82" y="47" width="16" height="3" rx="1.5" fill="var(--a)"/><rect x="82" y="83" width="16" height="3" rx="1.5" fill="var(--a)"/><g fill="#d4d4d8"><rect x="82" y="91" width="26" height="3" rx="1.5"/><rect x="82" y="97" width="20" height="3" rx="1.5"/></g></svg>`,
  atelier: `<svg viewBox="0 0 120 150"><rect width="120" height="150" fill="#fff"/><rect x="10" y="14" width="62" height="9" rx="2" fill="#1a1d24"/><rect x="10" y="27" width="38" height="4" rx="2" fill="#9ca3af"/><rect x="90" y="11" width="20" height="24" rx="3" fill="var(--a)" opacity=".22"/><rect x="10" y="39" width="100" height="1.6" fill="#1a1d24"/><g><rect x="10" y="48" width="16" height="3" rx="1.5" fill="var(--a)"/><g fill="#d4d4d8"><rect x="34" y="48" width="70" height="3" rx="1.5"/><rect x="34" y="54" width="64" height="3" rx="1.5"/></g><rect x="10" y="64" width="100" height=".8" fill="#e5e5e5"/><rect x="10" y="71" width="16" height="3" rx="1.5" fill="var(--a)"/><g fill="#d4d4d8"><rect x="34" y="71" width="50" height="3" rx="1.5"/><rect x="34" y="77" width="70" height="3" rx="1.5"/><rect x="34" y="83" width="66" height="3" rx="1.5"/><rect x="34" y="89" width="60" height="3" rx="1.5"/></g><rect x="10" y="99" width="100" height=".8" fill="#e5e5e5"/><rect x="10" y="106" width="16" height="3" rx="1.5" fill="var(--a)"/><g fill="#d4d4d8"><rect x="34" y="106" width="56" height="3" rx="1.5"/><rect x="34" y="112" width="68" height="3" rx="1.5"/></g></g></svg>`,
  plain: `<svg viewBox="0 0 120 150"><rect width="120" height="150" fill="#fff"/><rect x="10" y="13" width="54" height="8" rx="2" fill="#1a1d24"/><rect x="10" y="25" width="34" height="3.5" rx="1.75" fill="#52525b"/><rect x="10" y="31" width="80" height="3" rx="1.5" fill="#a1a1aa"/><rect x="10" y="44" width="26" height="3" rx="1.5" fill="#1a1d24"/><rect x="10" y="49" width="100" height="1" fill="var(--a)"/><g fill="#d4d4d8"><rect x="10" y="55" width="96" height="3" rx="1.5"/><rect x="10" y="61" width="90" height="3" rx="1.5"/></g><rect x="10" y="72" width="30" height="3" rx="1.5" fill="#1a1d24"/><rect x="10" y="77" width="100" height="1" fill="var(--a)"/><g fill="#d4d4d8"><rect x="10" y="83" width="60" height="3" rx="1.5"/><rect x="14" y="89" width="92" height="3" rx="1.5"/><rect x="14" y="95" width="86" height="3" rx="1.5"/><rect x="14" y="101" width="90" height="3" rx="1.5"/></g><rect x="10" y="112" width="20" height="3" rx="1.5" fill="#1a1d24"/><rect x="10" y="117" width="100" height="1" fill="var(--a)"/><g fill="#d4d4d8"><rect x="10" y="123" width="94" height="3" rx="1.5"/></g></svg>`,
  harvard: `<svg viewBox="0 0 120 150"><rect width="120" height="150" fill="#fff"/><rect x="33" y="12" width="54" height="7" rx="1.5" fill="#111"/><rect x="24" y="23" width="72" height="2.6" rx="1.3" fill="#9a9a9a"/><g fill="#111"><rect x="10" y="34" width="28" height="3" rx="1"/><rect x="10" y="38.6" width="100" height=".8"/></g><g fill="#c9c9c9"><rect x="10" y="43" width="40" height="3" rx="1" fill="#555"/><rect x="88" y="43" width="22" height="3" rx="1"/><rect x="10" y="48" width="34" height="3" rx="1"/><rect x="92" y="48" width="18" height="3" rx="1"/></g><g fill="#111"><rect x="10" y="58" width="32" height="3" rx="1"/><rect x="10" y="62.6" width="100" height=".8"/></g><g fill="#c9c9c9"><rect x="10" y="67" width="44" height="3" rx="1" fill="#555"/><rect x="88" y="67" width="22" height="3" rx="1"/><rect x="10" y="72" width="30" height="3" rx="1"/><rect x="92" y="72" width="18" height="3" rx="1"/><rect x="14" y="78" width="92" height="2.6" rx="1"/><rect x="14" y="83" width="86" height="2.6" rx="1"/><rect x="14" y="88" width="90" height="2.6" rx="1"/><rect x="10" y="96" width="38" height="3" rx="1" fill="#555"/><rect x="88" y="96" width="22" height="3" rx="1"/><rect x="14" y="102" width="88" height="2.6" rx="1"/><rect x="14" y="107" width="80" height="2.6" rx="1"/></g><g fill="#111"><rect x="10" y="117" width="22" height="3" rx="1"/><rect x="10" y="121.6" width="100" height=".8"/></g><g fill="#c9c9c9"><rect x="10" y="126" width="96" height="2.6" rx="1"/><rect x="10" y="131" width="80" height="2.6" rx="1"/></g></svg>`,
};

function segmented(name, current, options) {
  return `<div class="segmented">${options
    .map(([v, label]) => `<button class="${v === current ? 'on' : ''}" data-act="set-theme" data-k="${name}" data-v="${v}">${label}</button>`)
    .join('')}</div>`;
}

export function renderDesign(r) {
  const t = r.theme;
  const isPreset = ACCENTS.some((a) => a.value.toLowerCase() === t.accent.toLowerCase());
  return `<div class="card">
  <div class="card-head"><div><h3>Template</h3><p>Switch anytime. Your content stays the same.</p></div></div>
  <div class="tpl-grid">${TEMPLATES.map(
    (tp) => `<button class="tpl${r.template === tp.id ? ' on' : ''}" data-act="set-template" data-id="${tp.id}" style="--a:${esc(t.accent)}"><span class="tpl-thumb">${THUMBS[tp.id]}</span><span class="tpl-name">${tp.name}</span><span class="tpl-note">${tp.note}</span></button>`,
  ).join('')}</div>
  ${r.template === 'harvard' ? `<p class="note">${icon('check', 13)}<span>Classic Harvard format: serif type, black text and no photo. Loved by universities, corporate recruiters and fresh grads, and very ATS-friendly. Accent color and font choices don't apply to this template.</span></p>` : r.template === 'plain' ? `<p class="note">${icon('check', 13)}<span>Best for online applications. Applicant tracking systems read single-column text most reliably.</span></p>` : `<p class="note subtle">${icon('info', 13)}<span>Applying through a job portal? Use <b>Plain</b> for the best chance with applicant tracking systems.</span></p>`}
</div>
<div class="card${r.template === 'harvard' ? ' is-off' : ''}">
  <div class="card-head"><div><h3>Accent color</h3><p>Used for headings, links and highlights.</p></div></div>
  <div class="swatches">${ACCENTS.map(
    (a) => `<button class="swatch${a.value.toLowerCase() === t.accent.toLowerCase() ? ' on' : ''}" style="--c:${a.value}" data-act="set-theme" data-k="accent" data-v="${a.value}" title="${a.name}" aria-label="${a.name}"></button>`,
  ).join('')}<label class="swatch custom${isPreset ? '' : ' on'}" title="Custom color" style="--c:${esc(t.accent)}"><input type="color" data-bind="theme.accent" value="${esc(t.accent)}" aria-label="Custom color">${icon('plus', 14)}</label></div>
</div>
<div class="card${r.template === 'harvard' ? ' is-off' : ''}">
  <div class="card-head"><div><h3>Typography</h3><p>Modern sans-serif pairings.</p></div></div>
  <div class="font-grid">${FONTS.map(
    (f) => `<button class="font-opt${t.font === f.id ? ' on' : ''}" data-act="set-theme" data-k="font" data-v="${f.id}"><span class="font-aa" style="font-family:${esc(f.head)}, sans-serif">Aa</span><span class="font-meta"><b>${f.name}</b><small>${f.head.replace(/'/g, '')}${f.head !== f.body ? ' + ' + f.body.replace(/'/g, '') : ''}</small></span></button>`,
  ).join('')}</div>
</div>
<div class="card">
  <div class="card-head"><div><h3>Layout</h3></div></div>
  <div class="row-setting"><span>Spacing</span>${segmented('density', t.density, [['compact', 'Compact'], ['normal', 'Balanced'], ['spacious', 'Airy']])}</div>
  <div class="row-setting"><span>Paper size</span>${segmented('paper', t.paper, [['a4', 'A4'], ['letter', 'US Letter']])}</div>
  <div class="divider"></div>
  ${toggle('Show photo', 'showPhoto', r.showPhoto, r.contact.photo ? '' : 'Upload one in Content → Profile')}
  ${toggle('Show personal details', 'showPersonal', r.showPersonal, 'Birthdate, civil status, nationality…')}
</div>`;
}

/* ---------- Job match tab ---------- */
export function renderMatch(r) {
  return `<div class="card">
  <div class="card-head"><div><h3>Job description matcher</h3><p>Paste a job post. Vitae finds the keywords employers and ATS scanners look for, and shows which ones your resume is missing.</p></div></div>
  ${field('', 'jobPost', r.jobPost, { area: true, rows: 8, full: true, placeholder: 'Paste the full job post here…' })}
  <div id="match-results"></div>
</div>`;
}

export function renderMatchResults(res, hasText) {
  if (!hasText) return `<div class="match-empty">${icon('target', 22)}<p>Results appear here as soon as you paste a job post.</p></div>`;
  if (!res.keywords.length) return `<div class="match-empty"><p>Not enough to analyze yet. Paste the full job post, including requirements.</p></div>`;
  const s = res.score;
  const label = s >= 75 ? 'Strong match' : s >= 50 ? 'Good start' : 'Needs tailoring';
  const tone = s >= 75 ? 'good' : s >= 50 ? 'mid' : 'low';
  const R = 26, C = 2 * Math.PI * R;
  return `<div class="match-score tone-${tone}">
  <svg width="68" height="68" viewBox="0 0 68 68"><circle cx="34" cy="34" r="${R}" class="ring-bg"/><circle cx="34" cy="34" r="${R}" class="ring" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - s / 100)}"/></svg>
  <div class="match-num">${s}<small>%</small></div>
  <div class="match-text"><b>${label}</b><span>${res.matched.length} of ${res.keywords.length} keywords found on your resume</span></div>
</div>
${res.missing.length ? `<div class="kw-block"><div class="kw-label">Missing <small>Tap to add to Skills, only if it's true for you</small></div><div class="kw-list">${res.missing
    .map((k) => `<button class="kw kw-miss${k.kind === 'soft' ? ' soft' : ''}" data-act="add-keyword" data-label="${esc(k.label)}">${icon('plus', 12)}${esc(k.label)}</button>`)
    .join('')}</div></div>` : ''}
${res.matched.length ? `<div class="kw-block"><div class="kw-label">Found</div><div class="kw-list">${res.matched.map((k) => `<span class="kw kw-hit">${icon('check', 12)}${esc(k.label)}</span>`).join('')}</div></div>` : ''}
<div class="match-actions"><button class="btn sm" data-act="tailor">${icon('layers', 14)} Save as a tailored version</button></div>
<p class="note subtle">${icon('info', 13)}<span>Weave missing keywords into your bullets and summary too, not just Skills. That reads better to humans and scanners.</span></p>`;
}

export { sectionTitle };
