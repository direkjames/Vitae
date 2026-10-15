// Vitae — data model, defaults and persistence
// Author: direk james

import { uid, clone, debounce } from './util.js';
import { dbGet, dbSet, requestPersistence } from './db.js';

export const SECTIONS = {
  summary: { label: 'Summary', side: false },
  experience: { label: 'Experience', side: false },
  projects: { label: 'Projects', side: false },
  skills: { label: 'Skills', side: true },
  education: { label: 'Education', side: true },
  certifications: { label: 'Certifications', side: true },
};
export const DEFAULT_ORDER = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'];

export const TEMPLATES = [
  { id: 'meridian', name: 'Meridian', note: 'Modern · 2 columns' },
  { id: 'atelier', name: 'Atelier', note: 'Elegant · labeled' },
  { id: 'plain', name: 'Plain', note: 'ATS-friendly' },
  { id: 'harvard', name: 'Harvard', note: 'Classic · serif' },
];

export const FONTS = [
  { id: 'modern', name: 'Modern', head: "'Manrope'", body: "'Inter'" },
  { id: 'studio', name: 'Studio', head: "'Geist'", body: "'Geist'" },
  { id: 'refined', name: 'Refined', head: "'Plus Jakarta Sans'", body: "'Plus Jakarta Sans'" },
  { id: 'geometric', name: 'Geometric', head: "'Outfit'", body: "'DM Sans'" },
  { id: 'technical', name: 'Technical', head: "'Space Grotesk'", body: "'Inter'" },
  { id: 'soft', name: 'Soft', head: "'Sora'", body: "'Inter'" },
  { id: 'classic', name: 'Classic', head: "'Inter'", body: "'Inter'" },
];
export const HARVARD_FONT = "'EB Garamond', Garamond, 'Times New Roman', Georgia, serif";
export const FONT_STACK = ", 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
// Google Fonts families used by the resume (also used by the published page)
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Geist:wght@400..700&family=Inter:wght@400..700&family=Manrope:wght@400..800&family=Outfit:wght@400..700&family=Plus+Jakarta+Sans:wght@400..800&family=Sora:wght@400..700&family=Space+Grotesk:wght@400..700&display=swap';

export const ACCENTS = [
  { name: 'Ink', value: '#1E2430' },
  { name: 'Emerald', value: '#0F6E5F' },
  { name: 'Sapphire', value: '#1F4FD1' },
  { name: 'Indigo', value: '#4A3FD0' },
  { name: 'Plum', value: '#7A2E8E' },
  { name: 'Garnet', value: '#A3253A' },
  { name: 'Bronze', value: '#9A6416' },
  { name: 'Slate', value: '#4A5568' },
];

export const PAPER = {
  a4: { name: 'A4', w: 210, h: 297, css: 'A4' },
  letter: { name: 'Letter', w: 215.9, h: 279.4, css: 'letter' },
};

export const PERSONAL_FIELDS = [
  ['dateOfBirth', 'Date of birth', 'e.g. March 4, 2000'],
  ['placeOfBirth', 'Place of birth', 'e.g. Quezon City'],
  ['gender', 'Gender', ''],
  ['civilStatus', 'Civil status', 'e.g. Single'],
  ['nationality', 'Nationality', 'e.g. Filipino'],
  ['religion', 'Religion', ''],
  ['languages', 'Languages', 'e.g. English, Filipino'],
];

/* ---------- Factories ---------- */
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractual', 'Project-based', 'Freelance', 'Self-employed', 'Internship', 'OJT', 'Apprenticeship', 'Seasonal', 'Volunteer'];
export const newExperience = () => ({ id: uid(), role: '', company: '', type: '', location: '', start: '', end: '', current: false, bullets: [''] });
export const newProject = () => ({ id: uid(), name: '', url: '', tech: '', description: '', bullets: [] });
export const newSkillGroup = () => ({ id: uid(), name: '', items: '' });
export const newEducation = () => ({ id: uid(), school: '', degree: '', location: '', start: '', end: '', details: '' });
export const newCertification = () => ({ id: uid(), name: '', issuer: '', date: '', url: '' });
export const FACTORY = {
  experience: newExperience,
  projects: newProject,
  skills: newSkillGroup,
  education: newEducation,
  certifications: newCertification,
};

export function blankResume(name = 'Untitled resume') {
  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    template: 'meridian',
    theme: { accent: ACCENTS[0].value, font: 'modern', density: 'normal', paper: 'a4' },
    showPhoto: true,
    showPersonal: false,
    sectionOrder: [...DEFAULT_ORDER],
    hidden: {},
    titles: {},
    contact: { name: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', photo: '' },
    personal: Object.fromEntries(PERSONAL_FIELDS.map(([k]) => [k, ''])),
    summary: '',
    experience: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
    jobPost: '',
  };
}

export function sampleResume() {
  const r = blankResume('Minecraft dev');
  r.theme.accent = ACCENTS[1].value;
  r.contact = {
    name: 'Direk James',
    headline: 'Minecraft Plugin Developer · Web & App Builder',
    email: 'yourname@email.com',
    phone: '+63 900 000 0000',
    location: 'Philippines',
    website: 'direkjames.github.io',
    linkedin: '',
    github: 'github.com/direkjames',
    photo: '',
  };
  r.summary =
    'Self-driven developer who builds Minecraft server plugins and modern, offline-first web and mobile apps. I take products from idea to release: planning, design, code, testing and support. Comfortable using AI-assisted workflows to ship quickly while keeping code clean and maintainable.';
  r.experience = [
    {
      ...newExperience(),
      role: 'Plugin Developer & Server Owner',
      company: 'Oneblock Minecraft Servers',
      location: 'Remote',
      start: '',
      current: true,
      bullets: [
        'Built and maintain the dk plugin suite (dkCore, dkBank, dkChat, dkFly, dkAFK) that powers our Oneblock servers',
        'Run day-to-day operations including crates, voting rewards across 5 voting sites and player support',
        'Add a result here, e.g. grew to 120 daily players or cut lag reports by 40%',
      ],
    },
    {
      ...newExperience(),
      role: 'Independent App Developer',
      company: 'Self-employed',
      location: 'Remote',
      current: true,
      bullets: [
        'Designed and shipped offline-first web apps hosted on GitHub Pages, including Tessera and Inkfold',
        'Built Calorique, an Android nutrition tracker using Kotlin, Jetpack Compose and Room',
      ],
    },
  ];
  r.projects = [
    { ...newProject(), name: 'dkBank', url: '', tech: 'Java · Spigot / Paper API', description: 'Premium banking and economy plugin for Minecraft servers, sold as a premium resource.' },
    { ...newProject(), name: 'Kitly', url: 'direkjames.github.io', tech: 'HTML · CSS · JavaScript', description: 'Hub website that showcases all of my apps in one place.' },
    { ...newProject(), name: 'Tessera', url: '', tech: 'Web app · Infinite canvas', description: 'Visual board app for notes, images and links, a Milanote alternative.' },
  ];
  r.skills = [
    { ...newSkillGroup(), name: 'Languages', items: 'Java, Kotlin, JavaScript, HTML, CSS' },
    { ...newSkillGroup(), name: 'Platforms', items: 'Spigot / Paper API, Jetpack Compose, Room, PWA' },
    { ...newSkillGroup(), name: 'Tools', items: 'IntelliJ IDEA, VS Code, Git & GitHub, GitHub Pages' },
  ];
  r.education = [{ ...newEducation(), school: 'Your School or University', degree: 'Degree or course', start: '', end: '' }];
  r.personal.nationality = 'Filipino';
  r.personal.languages = 'English, Filipino';
  return r;
}

/* ---------- Store ---------- */
export const store = { resumes: {}, order: [], activeId: null };
const listeners = new Set();
export const on = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export const emit = (kind, detail) => listeners.forEach((fn) => fn(kind, detail));

export const active = () => store.resumes[store.activeId];

// Fill in anything missing from older saves or imports.
export function normalize(r) {
  const base = blankResume(r.name || 'Untitled resume');
  const out = { ...base, ...r };
  out.theme = { ...base.theme, ...(r.theme || {}) };
  out.contact = { ...base.contact, ...(r.contact || {}) };
  out.personal = { ...base.personal, ...(r.personal || {}) };
  out.hidden = { ...(r.hidden || {}) };
  out.titles = { ...(r.titles || {}) };
  const order = (r.sectionOrder || []).filter((k) => SECTIONS[k]);
  DEFAULT_ORDER.forEach((k) => !order.includes(k) && order.push(k));
  out.sectionOrder = order;
  for (const k of Object.keys(FACTORY)) {
    out[k] = (Array.isArray(r[k]) ? r[k] : []).map((e) => ({ ...FACTORY[k](), ...e, id: e.id || uid() }));
  }
  out.experience.forEach((e) => (e.bullets = Array.isArray(e.bullets) ? e.bullets.map(String) : []));
  out.projects.forEach((e) => (e.bullets = Array.isArray(e.bullets) ? e.bullets.map(String) : []));
  return out;
}

export async function load() {
  requestPersistence();
  const saved = await dbGet('state');
  if (saved && saved.order?.length) {
    store.resumes = {};
    for (const id of saved.order) if (saved.resumes[id]) store.resumes[id] = normalize(saved.resumes[id]);
    store.order = saved.order.filter((id) => store.resumes[id]);
    store.activeId = store.resumes[saved.activeId] ? saved.activeId : store.order[0];
  }
  if (!store.order.length) {
    const r = sampleResume();
    store.resumes = { [r.id]: r };
    store.order = [r.id];
    store.activeId = r.id;
    await persist();
  }
}

async function persist() {
  const ok = await dbSet('state', { resumes: store.resumes, order: store.order, activeId: store.activeId });
  emit(ok ? 'saved' : 'save-failed');
}
const persistSoon = debounce(persist, 350);

// Call after any mutation. kind: content | structure | design | versions
export function commit(kind = 'content') {
  const r = active();
  if (r) r.updatedAt = Date.now();
  emit('saving');
  persistSoon();
  emit(kind);
}

/* ---------- Versions ---------- */
export function addResume(r, activate = true) {
  store.resumes[r.id] = r;
  store.order.push(r.id);
  if (activate) store.activeId = r.id;
  commit('versions');
  return r;
}
export function duplicateResume(id, name) {
  const src = store.resumes[id];
  const copy = clone(src);
  copy.id = uid();
  copy.name = name || `${src.name} copy`;
  copy.createdAt = copy.updatedAt = Date.now();
  return addResume(copy);
}
export function deleteResume(id) {
  delete store.resumes[id];
  store.order = store.order.filter((x) => x !== id);
  if (!store.order.length) {
    const r = blankResume('My resume');
    store.resumes[r.id] = r;
    store.order.push(r.id);
  }
  if (!store.resumes[store.activeId]) store.activeId = store.order[0];
  commit('versions');
}
export function setActive(id) {
  if (!store.resumes[id]) return;
  store.activeId = id;
  commit('versions');
}

/* ---------- Backup ---------- */
export function exportData() {
  return JSON.stringify(
    { app: 'vitae', format: 1, exportedAt: new Date().toISOString(), resumes: store.order.map((id) => store.resumes[id]) },
    null,
    2,
  );
}
export function importData(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.resumes || (data.contact ? [data] : null);
  if (!list || !list.length) throw new Error('No resumes found in this file.');
  const names = new Set(store.order.map((id) => store.resumes[id].name));
  const added = list.map((raw) => {
    const r = normalize(raw);
    r.id = uid();
    if (names.has(r.name)) r.name = `${r.name} (imported)`;
    store.resumes[r.id] = r;
    store.order.push(r.id);
    return r;
  });
  store.activeId = added[0].id;
  commit('versions');
  return added.length;
}
