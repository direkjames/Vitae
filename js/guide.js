// Vitae — "How to use" guide
// Author: direk james

import { icon } from './util.js';
import { THUMBS } from './editor.js';

const STEPS = [
  ['Fill in your Profile', 'Name, headline and contact details. Use the <b>separator button</b> beside Headline to split titles, e.g. “Video Editor · Designer”. Add a photo and Personal details if the employer expects them (common in the Philippines).'],
  ['Build your sections', 'Add your Summary, Experience, Projects, Skills, Education and Certifications. Drag the <b>⋮⋮ handle</b> to reorder, tap the <b>eye</b> to hide a section, and click a section title to rename it.'],
  ['Write strong bullet points', 'Tap the <b>wand</b> on any bullet to pick an action verb for your field: Teacher, BPO, Retail, Service Crew, Merchandiser, Designer, Video Editor and more. Press <b>Enter</b> for a new bullet. Tips appear under each one.'],
  ['Pick a look', 'In <b>Design</b>, choose a template, accent color, font pairing, spacing and paper size (A4 or US Letter). Your content never changes when you switch.'],
  ['Tailor it to the job', 'In <b>Job match</b>, paste a job post to see which keywords you already have and which are missing. Save a tailored copy as a new version.'],
  ['Download your PDF', 'Watch the pill above the preview: it tells you if everything fits on one page. Then tap <b>Download PDF</b> and choose “Save as PDF”.'],
];

const TEMPLATES = [
  {
    id: 'meridian', name: 'Meridian', ats: 2,
    looks: 'Modern two-column layout. Skills appear as tags in a side column, with your accent color on headings.',
    best: 'Tech, creatives, startups and freelance profiles where you want skills visible at a glance.',
  },
  {
    id: 'atelier', name: 'Atelier', ats: 2,
    looks: 'Refined single column with section labels on the left and thin dividing lines. Calm and premium.',
    best: 'Experienced professionals, team leads and anyone who wants a polished, senior feel.',
  },
  {
    id: 'plain', name: 'Plain', ats: 3,
    looks: 'Simple single column with standard headings and minimal styling. Nothing for a scanner to trip on.',
    best: 'Job portals like JobStreet, Indeed and LinkedIn, BPO applications, government and large companies.',
  },
  {
    id: 'harvard', name: 'Harvard', ats: 3,
    looks: 'The classic format: serif type, black and white, centered name, organization and dates on each line, Education first.',
    best: 'Fresh graduates, internships, academe, banks, consulting, corporate and international roles.',
  },
];

const FEATURES = [
  ['layers', 'Versions', 'Keep one resume per kind of job (e.g. “Web dev” and “General VA”) from the menu at the top.'],
  ['box', 'Backup & import', 'Save all versions to a .json file, then import it on another device or browser.'],
  ['globe', 'Publish as a page', 'Download a ready-to-host index.html of your resume for GitHub Pages or any website.'],
  ['download', 'Install as an app', 'Use your browser’s Install option to add Vitae to your home screen. It works offline.'],
];

const atsDots = (n) => `<span class="ats">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}<small>${n === 3 ? 'Excellent' : 'Good'}</small></span>`;

export function openGuide(openModal) {
  const body = `<div class="guide">
  <div class="guide-hero">
    <div class="guide-badge">${icon('sparkle', 14)} How to use Vitae</div>
    <h2>Build a polished resume in minutes.</h2>
    <p>Free, private and works offline. Everything you type is saved automatically on this device. Nothing is uploaded.</p>
  </div>

  <h4 class="guide-h">Quick start</h4>
  <ol class="guide-steps">${STEPS.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>

  <h4 class="guide-h">Which template should I use?</h4>
  <div class="guide-tpls">${TEMPLATES.map(
    (t) => `<div class="guide-tpl">
      <div class="guide-thumb" style="--a:#0f6e5f">${THUMBS[t.id]}</div>
      <div class="guide-tpl-text">
        <div class="guide-tpl-top"><b>${t.name}</b>${atsDots(t.ats)}</div>
        <p><span>Looks</span>${t.looks}</p>
        <p><span>Best for</span>${t.best}</p>
      </div>
    </div>`,
  ).join('')}</div>
  <p class="guide-note">${icon('info', 13)}<span><b>ATS</b> (applicant tracking system) is software many companies use to scan resumes before a person reads them. Simpler layouts score more reliably.</span></p>

  <h4 class="guide-h">More you can do</h4>
  <div class="guide-feats">${FEATURES.map(([ic, t, d]) => `<div class="guide-feat"><span class="guide-ic">${icon(ic, 16)}</span><div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div>

  <h4 class="guide-h">Good to know</h4>
  <ul class="guide-list">
    <li>Clearing your browser data also clears Vitae. Use <b>Backup</b> now and then to keep a copy.</li>
    <li>Keyboard: <kbd>Ctrl</kbd> + <kbd>P</kbd> downloads the PDF. On a bullet, <kbd>Enter</kbd> adds one and <kbd>Backspace</kbd> on an empty bullet removes it. Focus a drag handle and use <kbd>↑</kbd> <kbd>↓</kbd> to move it.</li>
    <li>Only add keywords and skills that are true for you. Recruiters ask about them in interviews.</li>
  </ul>
</div>`;
  openModal({
    title: 'Guide',
    body,
    wide: true,
    actions: [{ label: 'Start building', kind: 'primary', onClick: ({ close }) => close() }],
    onOpen: (root) => root.querySelector('.modal')?.classList.add('guide-modal'),
  });
}
