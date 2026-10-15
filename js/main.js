// Vitae — app controller
// Author: direk james

import { $, $$, esc, icon, getPath, setPath, debounce, move, timeAgo, download, uid, clone } from './util.js';
import {
  store, on, active, load, commit, FACTORY, PAPER, TEMPLATES, newSkillGroup,
  addResume, blankResume, sampleResume, duplicateResume, deleteResume, setActive, exportData, importData,
} from './state.js';
import { renderResume, resumeText } from './templates.js';
import { ui, renderContent, renderDesign, renderMatch, renderMatchResults, hintsHTML, entrySummary } from './editor.js';
import { enableSorting } from './sortable.js';
import { VERB_GROUPS, applyVerb } from './verbs.js';
import { matchResume } from './matcher.js';
import { buildPublishedPage } from './publish.js';

const app = $('#app');
const panelBody = $('#panel-body');
const preview = $('#preview');
const paperFrame = $('#paper-frame');
const paperScale = $('#paper-scale');
const breaks = $('#breaks');
const stageScroll = $('#stage-scroll');
const fitPill = $('#fit-pill');
const printRoot = $('#print-root');
const pageStyleEl = $('#page-size');
const saveState = $('#save-state');

/* =========================================================
   Rendering
   ========================================================= */
function grow(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 2 + 'px';
}

function renderPanel() {
  const r = active();
  $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === ui.tab));
  panelBody.innerHTML = ui.tab === 'design' ? renderDesign(r) : ui.tab === 'match' ? renderMatch(r) : renderContent(r);
  $$('textarea.autogrow', panelBody).forEach(grow);
  if (ui.tab === 'match') renderMatchNow();
}

let previewQueued = false;
function renderPreview() {
  if (previewQueued) return;
  previewQueued = true;
  requestAnimationFrame(() => {
    previewQueued = false;
    const r = active();
    preview.innerHTML = renderResume(r);
    const paper = PAPER[r.theme.paper] || PAPER.a4;
    pageStyleEl.textContent = `@page { size: ${paper.css}; margin: 0; }`;
    $('#stage-meta').textContent = `${(TEMPLATES.find((t) => t.id === r.template) || TEMPLATES[0]).name} · ${paper.name}`;
    layoutPaper();
  });
}

function layoutPaper() {
  const r = active();
  const page = preview.firstElementChild;
  if (!page || !r) return;
  const paper = PAPER[r.theme.paper] || PAPER.a4;
  const pageH = (paper.h * 96) / 25.4;
  const body = page.querySelector('.vt-body');
  const cs = getComputedStyle(page);
  const contentH = body ? body.offsetTop + body.offsetHeight + parseFloat(cs.paddingBottom) : page.offsetHeight;
  const pw = page.offsetWidth;
  const ph = page.offsetHeight;
  const avail = Math.max(260, stageScroll.clientWidth - (window.innerWidth < 640 ? 24 : 72));
  const s = Math.min(1, avail / pw);
  paperScale.style.transform = `scale(${s})`;
  paperFrame.style.width = pw * s + 'px';
  paperFrame.style.height = ph * s + 'px';

  const pages = contentH > pageH + 1 ? Math.ceil((contentH - 1) / pageH) : 1;
  breaks.innerHTML = Array.from({ length: pages - 1 }, (_, i) => `<div class="page-break" style="top:${(i + 1) * pageH}px"><span>Page ${i + 2}</span></div>`).join('');

  let tone, text;
  if (pages === 1) {
    const free = Math.max(0, Math.round(((pageH - contentH) / pageH) * 100));
    tone = 'good';
    text = free <= 3 ? 'Fits on one page · snug' : `Fits on one page · ${free}% space left`;
  } else {
    const lineH = parseFloat(cs.fontSize) * 1.48;
    const over = Math.max(1, Math.round((contentH - pageH) / lineH));
    tone = pages === 2 ? 'warn' : 'bad';
    text = pages === 2 ? `Spills onto page 2 · trim about ${over} line${over === 1 ? '' : 's'}` : `Runs to ${pages} pages`;
  }
  fitPill.className = `fit-pill tone-${tone}`;
  fitPill.innerHTML = `${icon(tone === 'good' ? 'check' : 'alert', 14)}<span>${text}</span>`;
}

function renderVersionButton() {
  const r = active();
  $('#version-name').textContent = r.name;
  $('#version-count').textContent = store.order.length > 1 ? `${store.order.length} versions` : '1 version';
}

function renderAll() {
  renderVersionButton();
  renderPanel();
  renderPreview();
  if (versionMenuOpen) renderVersionMenu();
}

/* ---------- Job matcher ---------- */
function renderMatchNow() {
  const box = $('#match-results');
  if (!box) return;
  const r = active();
  const hasText = (r.jobPost || '').trim().length > 0;
  box.innerHTML = renderMatchResults(hasText ? matchResume(r.jobPost, resumeText(r)) : null, hasText);
}
const renderMatchSoon = debounce(renderMatchNow, 220);

/* =========================================================
   Store events
   ========================================================= */
on((kind, detail) => {
  switch (kind) {
    case 'content':
      renderPreview();
      break;
    case 'design':
      renderPreview();
      if (ui.tab === 'design' && !detail?.live) renderPanel();
      break;
    case 'structure':
      renderPanel();
      renderPreview();
      break;
    case 'versions':
      renderAll();
      break;
    case 'saving':
      saveState.classList.add('busy');
      saveState.innerHTML = `<span class="pulse"></span>Saving…`;
      break;
    case 'saved':
      saveState.classList.remove('busy');
      saveState.innerHTML = `${icon('check', 13)}Saved on this device`;
      break;
    case 'save-failed':
      saveState.classList.remove('busy');
      saveState.innerHTML = `${icon('alert', 13)}Couldn't save. Export a backup`;
      break;
  }
});

/* =========================================================
   Editing (delegated input)
   ========================================================= */
panelBody.addEventListener('input', (e) => {
  const el = e.target;
  const path = el.dataset?.bind;
  if (!path) return;
  const r = active();
  const val = el.type === 'checkbox' ? el.checked : el.value;
  setPath(r, path, val);
  if (el.classList.contains('autogrow')) grow(el);

  if (el.hasAttribute('data-bullet')) {
    const h = panelBody.querySelector(`[data-hints-for="${path}"]`);
    if (h) h.innerHTML = hintsHTML(val);
  }

  const m = path.match(/^(experience|projects|skills|education|certifications)\.(\d+)\./);
  if (m) {
    const e2 = r[m[1]][+m[2]];
    const s = entrySummary(m[1], e2);
    const t = panelBody.querySelector(`[data-summary-title="${e2.id}"]`);
    const sub = panelBody.querySelector(`[data-summary-sub="${e2.id}"]`);
    if (t) t.textContent = s.title;
    if (sub) sub.textContent = s.sub;
  }

  if (/\.current$/.test(path)) {
    const end = panelBody.querySelector(`[data-bind="${path.replace(/current$/, 'end')}"]`);
    if (end) {
      end.disabled = !!val;
      end.value = val ? '' : getPath(r, path.replace(/current$/, 'end')) || '';
      end.placeholder = val ? 'Present' : 'Dec 2024';
    }
  }

  if (path === 'jobPost') {
    commit('content');
    renderMatchSoon();
    return;
  }
  if (path.startsWith('theme.')) {
    $$('.swatch', panelBody).forEach((s) => s.classList.remove('on'));
    const custom = el.closest('.swatch');
    if (custom) {
      custom.classList.add('on');
      custom.style.setProperty('--c', val);
    }
    $$('.tpl', panelBody).forEach((t) => t.style.setProperty('--a', val));
    return commit('design', { live: true });
  }
  if (path === 'showPhoto' || path === 'showPersonal') {
    // keep both copies of the toggle in sync (Content + Design tabs)
    return commit('design', { live: true });
  }
  commit('content');
});

// Bullet keyboard flow: Enter = new bullet, Backspace on empty = remove
panelBody.addEventListener('keydown', (e) => {
  const el = e.target;
  if (!el.hasAttribute?.('data-bullet')) return;
  const parts = el.dataset.bind.split('.');
  const i = +parts.pop();
  const listPath = parts.join('.');
  const list = getPath(active(), listPath);
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    list.splice(i + 1, 0, '');
    commit('structure');
    focusBind(`${listPath}.${i + 1}`);
  } else if (e.key === 'Backspace' && el.value === '' && list.length > 1) {
    e.preventDefault();
    list.splice(i, 1);
    commit('structure');
    focusBind(`${listPath}.${Math.max(0, i - 1)}`, true);
  }
});

function focusBind(path, atEnd = false) {
  // Focus right away (the panel re-renders synchronously) so no keystrokes are lost
  const el = panelBody.querySelector(`[data-bind="${path}"]`);
  if (!el) return;
  el.focus({ preventScroll: true });
  if (atEnd && el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length);
  requestAnimationFrame(() => el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
}

/* ---------- Drag to reorder ---------- */
enableSorting(panelBody, (list, from, to, opts) => {
  const r = active();
  if (list === 'sectionOrder') move(r.sectionOrder, from, to);
  else move(r[list], from, to);
  commit('structure');
  if (opts?.refocus) {
    requestAnimationFrame(() => {
      const sel = list === 'sectionOrder' ? `[data-key="${opts.refocus}"]` : `[data-id="${opts.refocus}"]`;
      panelBody.querySelector(`${sel} > * > [data-drag], ${sel} [data-drag]`)?.focus();
    });
  }
});

/* =========================================================
   Actions (delegated click)
   ========================================================= */
const actions = {
  'toggle-sec': ({ key }) => {
    ui.closedSections.has(key) ? ui.closedSections.delete(key) : ui.closedSections.add(key);
    renderPanel();
  },
  'toggle-entry': ({ id }) => {
    ui.openEntries.has(id) ? ui.openEntries.delete(id) : ui.openEntries.add(id);
    renderPanel();
  },
  'toggle-personal': () => {
    ui.personalOpen = !ui.personalOpen;
    renderPanel();
  },
  'toggle-hidden': ({ key }) => {
    const r = active();
    r.hidden[key] = !r.hidden[key];
    commit('structure');
    toast(r.hidden[key] ? 'Section hidden from resume' : 'Section shown on resume');
  },
  'add-entry': ({ key }) => {
    const r = active();
    const e = FACTORY[key]();
    r[key].push(e);
    r.hidden[key] = false;
    ui.closedSections.delete(key);
    ui.openEntries.add(e.id);
    commit('structure');
    requestAnimationFrame(() => {
      const card = panelBody.querySelector(`[data-id="${e.id}"]`);
      card?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      card?.querySelector('input, textarea')?.focus({ preventScroll: true });
    });
  },
  'dup-entry': ({ key, i }) => {
    const r = active();
    const copy = clone(r[key][+i]);
    copy.id = uid();
    r[key].splice(+i + 1, 0, copy);
    ui.openEntries.add(copy.id);
    commit('structure');
    toast('Duplicated');
  },
  'del-entry': ({ key, i }) => {
    const r = active();
    const [removed] = r[key].splice(+i, 1);
    commit('structure');
    toast('Deleted', {
      action: { label: 'Undo', fn: () => { active()[key].splice(+i, 0, removed); commit('structure'); } },
    });
  },
  'add-bullet': ({ list }) => {
    const arr = getPath(active(), list);
    arr.push('');
    commit('structure');
    focusBind(`${list}.${arr.length - 1}`);
  },
  'del-bullet': ({ list, i }) => {
    getPath(active(), list).splice(+i, 1);
    commit('structure');
  },
  verbs: ({ path }, btn) => openVerbs(btn, path),
  photo: () => $('#photo-input').click(),
  'remove-photo': () => {
    active().contact.photo = '';
    commit('structure');
  },
  'set-template': ({ id }) => {
    active().template = id;
    commit('design');
  },
  'set-theme': ({ k, v }) => {
    active().theme[k] = v;
    commit('design');
  },
  'add-keyword': ({ label }) => {
    const r = active();
    let g = r.skills[r.skills.length - 1];
    if (!g) {
      g = newSkillGroup();
      g.name = 'Skills';
      r.skills.push(g);
    }
    const items = String(g.items || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!items.some((s) => s.toLowerCase() === label.toLowerCase())) items.push(label);
    g.items = items.join(', ');
    r.hidden.skills = false;
    commit('content');
    renderMatchNow();
    toast(`Added “${label}” to ${g.name || 'Skills'}`);
  },
  tailor: async () => {
    const name = await promptName('Save as a tailored version', `${active().name} · tailored`, 'Create version', 'A copy of this resume, including the job post, so you can tailor it without touching the original.');
    if (name) {
      duplicateResume(store.activeId, name);
      toast('Tailored version created');
    }
  },
  pdf: () => printPDF(),
  export: () => {
    const d = new Date().toISOString().slice(0, 10);
    download(`vitae-backup-${d}.json`, exportData(), 'application/json');
    toast(`Backup downloaded · ${store.order.length} version${store.order.length === 1 ? '' : 's'}`);
  },
  import: () => $('#import-input').click(),
  publish: () => openPublish(),
  install: async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    $('#install-btn').hidden = true;
  },
  'view-edit': () => setMobileView('edit'),
  'view-preview': () => setMobileView('preview'),
  // versions
  'version-menu': () => (versionMenuOpen ? closeVersionMenu() : openVersionMenu()),
  'switch-version': ({ id }) => {
    setActive(id);
    closeVersionMenu();
  },
  'rename-version': async ({ id }) => {
    const r = store.resumes[id];
    const name = await promptName('Rename version', r.name, 'Rename');
    if (name) {
      r.name = name;
      commit('versions');
    }
  },
  'dup-version': async ({ id }) => {
    const name = await promptName('Duplicate version', `${store.resumes[id].name} copy`, 'Duplicate', 'Great for tailoring: e.g. "Web dev" or "General VA".');
    if (name) duplicateResume(id, name);
  },
  'del-version': async ({ id }) => {
    const r = store.resumes[id];
    const ok = await confirmDialog('Delete this version?', `“${esc(r.name)}” will be permanently removed from this device. Export a backup first if you might need it.`, 'Delete', true);
    if (ok) {
      deleteResume(id);
      toast('Version deleted');
    }
  },
  'new-version': async () => {
    closeVersionMenu();
    const name = await promptName('New resume version', 'Web dev', 'Create', 'Start blank. Your contact details will be copied over.');
    if (!name) return;
    const r = blankResume(name);
    const cur = active();
    r.contact = { ...cur.contact };
    r.personal = { ...cur.personal };
    r.theme = { ...cur.theme };
    r.template = cur.template;
    addResume(r);
  },
  'new-sample': () => {
    closeVersionMenu();
    const r = sampleResume();
    r.name = 'Sample';
    addResume(r);
    toast('Sample resume added');
  },
};

document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    ui.tab = tab.dataset.tab;
    renderPanel();
    panelBody.scrollTop = 0;
    if (app.dataset.view === 'preview') setMobileView('edit');
    return;
  }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const fn = actions[btn.dataset.act];
  if (!fn) return;
  e.preventDefault();
  fn({ ...btn.dataset }, btn);
});

/* =========================================================
   Verb picker
   ========================================================= */
let verbPop = null;
function closeVerbs() {
  verbPop?.remove();
  verbPop = null;
}
function openVerbs(btn, path) {
  if (verbPop?.dataset.path === path) return closeVerbs();
  closeVerbs();
  verbPop = document.createElement('div');
  verbPop.className = 'verb-pop';
  verbPop.dataset.path = path;
  verbPop.innerHTML = `<div class="verb-head">${icon('wand', 14)}<b>Action verbs</b><small>Tap one to start your bullet with it</small></div>
<div class="verb-groups">${VERB_GROUPS.map((g) => `<div class="vg"><div class="vg-name">${g.name}</div><div class="vg-list">${g.verbs.map((v) => `<button data-verb="${v}">${v}</button>`).join('')}</div></div>`).join('')}</div>`;
  document.body.appendChild(verbPop);
  const b = btn.getBoundingClientRect();
  const w = verbPop.offsetWidth;
  const h = verbPop.offsetHeight;
  let left = Math.min(window.innerWidth - w - 12, Math.max(12, b.right - w));
  let top = b.bottom + 8;
  if (top + h > window.innerHeight - 12) top = Math.max(12, b.top - h - 8);
  verbPop.style.left = left + 'px';
  verbPop.style.top = top + 'px';
  verbPop.addEventListener('click', (e) => {
    const v = e.target.closest('[data-verb]')?.dataset.verb;
    if (!v) return;
    const r = active();
    const next = applyVerb(getPath(r, path), v);
    setPath(r, path, next);
    const ta = panelBody.querySelector(`[data-bind="${path}"]`);
    if (ta) {
      ta.value = next;
      grow(ta);
      const h2 = panelBody.querySelector(`[data-hints-for="${path}"]`);
      if (h2) h2.innerHTML = hintsHTML(next);
      ta.focus();
      ta.setSelectionRange(next.length, next.length);
    }
    commit('content');
    closeVerbs();
  });
}
document.addEventListener('pointerdown', (e) => {
  if (verbPop && !verbPop.contains(e.target) && !e.target.closest('[data-act="verbs"]')) closeVerbs();
  if (versionMenuOpen && !e.target.closest('.versions')) closeVersionMenu();
});
panelBody.addEventListener('scroll', closeVerbs, { passive: true });

/* =========================================================
   Versions menu
   ========================================================= */
let versionMenuOpen = false;
const versionMenu = $('#version-menu');
function renderVersionMenu() {
  versionMenu.innerHTML = `<div class="vmenu-head"><b>Resume versions</b><small>Keep one tailored version per kind of job.</small></div>
<div class="vmenu-list">${store.order
    .map((id) => {
      const r = store.resumes[id];
      const on = id === store.activeId;
      return `<div class="vitem${on ? ' on' : ''}">
  <button class="vitem-main" data-act="switch-version" data-id="${id}"><span class="vcheck">${on ? icon('check', 14) : ''}</span><span class="vtext"><span class="vname">${esc(r.name)}</span><span class="vmeta">${esc((TEMPLATES.find((t) => t.id === r.template) || TEMPLATES[0]).name)} · edited ${timeAgo(r.updatedAt)}</span></span></button>
  <button class="ib" data-act="rename-version" data-id="${id}" title="Rename" aria-label="Rename">${icon('pencil', 14)}</button>
  <button class="ib" data-act="dup-version" data-id="${id}" title="Duplicate" aria-label="Duplicate">${icon('copy', 14)}</button>
  <button class="ib ib-danger" data-act="del-version" data-id="${id}" title="Delete" aria-label="Delete">${icon('trash', 14)}</button>
</div>`;
    })
    .join('')}</div>
<div class="vmenu-foot"><button class="btn sm" data-act="new-version">${icon('plus', 14)} New version</button><button class="btn sm ghost" data-act="new-sample">Add sample</button></div>`;
}
function openVersionMenu() {
  versionMenuOpen = true;
  renderVersionMenu();
  versionMenu.hidden = false;
  $('#version-btn').setAttribute('aria-expanded', 'true');
}
function closeVersionMenu() {
  versionMenuOpen = false;
  versionMenu.hidden = true;
  $('#version-btn').setAttribute('aria-expanded', 'false');
}

/* =========================================================
   Modals & toasts
   ========================================================= */
function openModal({ title, body, actions: acts = [], onOpen, wide = false }) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
  <div class="modal-head"><h3>${title}</h3><button class="ib" data-close aria-label="Close">${icon('x', 16)}</button></div>
  <div class="modal-body">${body}</div>
  ${acts.length ? `<div class="modal-foot">${acts.map((a, i) => `<button class="btn ${a.kind || ''}" data-i="${i}">${a.label}</button>`).join('')}</div>` : ''}
</div>`;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('in'));
  const prevFocus = document.activeElement;
  const close = () => {
    wrap.classList.remove('in');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => wrap.remove(), 200);
    prevFocus?.focus?.({ preventScroll: true });
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'text') {
      const primary = acts.findIndex((a) => /primary|danger/.test(a.kind || ''));
      if (primary >= 0) {
        e.preventDefault();
        acts[primary].onClick({ close, root: wrap });
      }
    }
  };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap || e.target.closest('[data-close]')) return close();
    const b = e.target.closest('.modal-foot [data-i]');
    if (b) acts[+b.dataset.i].onClick({ close, root: wrap });
  });
  onOpen?.(wrap);
  return { close, root: wrap };
}

function promptName(title, initial, cta, sub = '') {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v, close) => {
      done = true;
      close();
      resolve(v);
    };
    const m = openModal({
      title,
      body: `${sub ? `<p class="modal-sub">${sub}</p>` : ''}<label class="field full"><span class="field-label">Name</span><input type="text" id="name-input" value="${esc(initial)}" maxlength="60" autocomplete="off"></label>`,
      actions: [
        { label: 'Cancel', kind: 'ghost', onClick: ({ close }) => finish(null, close) },
        { label: cta, kind: 'primary', onClick: ({ close, root }) => finish($('#name-input', root).value.trim() || null, close) },
      ],
      onOpen: (root) => {
        const i = $('#name-input', root);
        setTimeout(() => (i.focus(), i.select()), 30);
      },
    });
    const obs = new MutationObserver(() => {
      if (!document.body.contains(m.root)) {
        obs.disconnect();
        if (!done) resolve(null);
      }
    });
    obs.observe(document.body, { childList: true });
  });
}

function confirmDialog(title, text, cta, danger = false) {
  return new Promise((resolve) => {
    let done = false;
    const m = openModal({
      title,
      body: `<p class="modal-sub">${text}</p>`,
      actions: [
        { label: 'Cancel', kind: 'ghost', onClick: ({ close }) => ((done = true), close(), resolve(false)) },
        { label: cta, kind: danger ? 'danger' : 'primary', onClick: ({ close }) => ((done = true), close(), resolve(true)) },
      ],
    });
    const obs = new MutationObserver(() => {
      if (!document.body.contains(m.root)) {
        obs.disconnect();
        if (!done) resolve(false);
      }
    });
    obs.observe(document.body, { childList: true });
  });
}

function toast(msg, { action, kind = '', ms = 3200 } = {}) {
  const host = $('#toasts');
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action.label)}</button>` : ''}`;
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  const kill = () => {
    t.classList.remove('in');
    setTimeout(() => t.remove(), 250);
  };
  if (action) t.querySelector('button').onclick = () => (action.fn(), kill());
  setTimeout(kill, action ? 6000 : ms);
}

/* =========================================================
   PDF, photo, import, publish
   ========================================================= */
function printPDF() {
  const r = active();
  printRoot.innerHTML = renderResume(r);
  const old = document.title;
  const base = (r.contact.name || 'Resume').trim();
  document.title = `${base} - Resume${r.name ? ' (' + r.name + ')' : ''}`;
  toast('Choose “Save as PDF” as the destination', { ms: 4500 });
  const go = () => {
    window.print();
    document.title = old;
  };
  (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(go, 120));
}
window.addEventListener('beforeprint', () => {
  if (!printRoot.innerHTML) printRoot.innerHTML = renderResume(active());
});
window.addEventListener('afterprint', () => (printRoot.innerHTML = ''));

$('#photo-input').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return toast('Please choose an image file', { kind: 'err' });
  try {
    active().contact.photo = await squarePhoto(file, 560);
    active().showPhoto = true;
    commit('structure');
    toast('Photo added');
  } catch {
    toast("Couldn't read that image", { kind: 'err' });
  }
});

function squarePhoto(file, size) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - s) / 2;
      const sy = Math.max(0, (img.naturalHeight - s) * 0.35); // bias toward the top for portraits
      const cv = document.createElement('canvas');
      cv.width = cv.height = Math.min(size, s);
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, s, s, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => (URL.revokeObjectURL(url), reject());
    img.src = url;
  });
}

$('#import-input').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    const n = importData(await file.text());
    toast(`Imported ${n} resume${n === 1 ? '' : 's'}`);
  } catch (err) {
    toast(`Import failed: ${err.message || 'invalid file'}`, { kind: 'err', ms: 5000 });
  }
});

function openPublish() {
  const r = active();
  const gh = (r.contact.github || '').match(/github\.com\/([^/\s]+)/i)?.[1] || 'your-username';
  const body = `<p class="modal-sub">Creates a standalone web page of <b>${esc(r.name)}</b> that anyone can open, with a built-in “Download PDF” button. Host it on GitHub Pages and link it from your portfolio.</p>
<div class="pub-opts">
  <div class="pub-opts-label">${icon('globe', 14)} The page will be public. Choose what to include:</div>
  <label class="check"><input type="checkbox" id="pub-email" checked><span>Email address</span></label>
  <label class="check"><input type="checkbox" id="pub-phone"><span>Phone number</span></label>
  <label class="check"><input type="checkbox" id="pub-photo" ${r.showPhoto && r.contact.photo ? 'checked' : ''} ${r.contact.photo ? '' : 'disabled'}><span>Photo</span></label>
  <label class="check"><input type="checkbox" id="pub-personal"><span>Personal details (birthdate, civil status…)</span></label>
</div>
<ol class="steps">
  <li>Download <b>index.html</b> below.</li>
  <li>On GitHub, create a public repository named <code>resume</code> and upload the file.</li>
  <li>Go to <b>Settings → Pages</b>, set Source to <b>Deploy from a branch</b>, pick <code>main</code> / <code>root</code>, and save.</li>
  <li>In a minute your resume is live at <code>https://${esc(gh)}.github.io/resume/</code>. Add it to your portfolio, LinkedIn or job applications.</li>
</ol>
<p class="note subtle">${icon('info', 13)}<span>To update it later, download again and replace the file in the repository.</span></p>`;
  const opts = (root) => ({
    email: $('#pub-email', root).checked,
    phone: $('#pub-phone', root).checked,
    photo: $('#pub-photo', root).checked,
    personal: $('#pub-personal', root).checked,
  });
  openModal({
    title: 'Publish as a web page',
    body,
    wide: true,
    actions: [
      {
        label: `${icon('eye', 15)} Preview`,
        kind: 'ghost',
        onClick: async ({ root }) => {
          const html = await buildPublishedPage(active(), opts(root));
          const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
          window.open(url, '_blank', 'noopener');
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
      },
      {
        label: `${icon('download', 15)} Download index.html`,
        kind: 'primary',
        onClick: async ({ root, close }) => {
          const html = await buildPublishedPage(active(), opts(root));
          download('index.html', html, 'text/html');
          close();
          toast('index.html downloaded. Upload it to your “resume” repo');
        },
      },
    ],
  });
}

/* =========================================================
   Layout, mobile, install, boot
   ========================================================= */
function setMobileView(v) {
  app.dataset.view = v;
  $$('.mobile-switch button').forEach((b) => b.classList.toggle('on', b.dataset.act === `view-${v}`));
  if (v === 'preview') requestAnimationFrame(layoutPaper);
}

new ResizeObserver(() => layoutPaper()).observe(stageScroll);
document.fonts?.addEventListener?.('loadingdone', () => layoutPaper());

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    toast('Vitae saves automatically on this device');
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    printPDF();
  }
  if (e.key === 'Escape') {
    closeVerbs();
    closeVersionMenu();
  }
});

let installEvent = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  $('#install-btn').hidden = false;
});

async function boot() {
  await load();
  renderAll();
  saveState.innerHTML = `${icon('check', 13)}Saved on this device`;
  document.fonts?.ready.then(layoutPaper);
  app.classList.add('ready');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
boot();
