// Vitae — bullet point helper: action verbs and quick checks
// Author: direk james

export const VERB_GROUPS = [
  { name: 'Built', verbs: ['Built', 'Developed', 'Designed', 'Engineered', 'Created', 'Launched', 'Shipped', 'Implemented', 'Architected', 'Automated', 'Integrated', 'Prototyped'] },
  { name: 'Led', verbs: ['Led', 'Managed', 'Coordinated', 'Organized', 'Mentored', 'Directed', 'Spearheaded', 'Owned', 'Oversaw', 'Trained'] },
  { name: 'Improved', verbs: ['Improved', 'Optimized', 'Reduced', 'Increased', 'Streamlined', 'Accelerated', 'Boosted', 'Enhanced', 'Refactored', 'Modernized', 'Cut', 'Grew'] },
  { name: 'Supported', verbs: ['Resolved', 'Supported', 'Assisted', 'Handled', 'Maintained', 'Moderated', 'Answered', 'Processed', 'Scheduled', 'Organized'] },
  { name: 'Communicated', verbs: ['Wrote', 'Documented', 'Presented', 'Collaborated', 'Negotiated', 'Coordinated', 'Partnered', 'Published'] },
  { name: 'Analyzed', verbs: ['Analyzed', 'Researched', 'Tested', 'Debugged', 'Monitored', 'Evaluated', 'Audited', 'Identified', 'Measured'] },
];
const ALL_VERBS = new Set(VERB_GROUPS.flatMap((g) => g.verbs.map((v) => v.toLowerCase())));

const WEAK = /^(?:i\s+)?(was\s+)?(responsible\s+for|helped(\s+to|\s+with)?|worked\s+on|assisted\s+(in|with)|tasked\s+with|in\s+charge\s+of|duties\s+included|involved\s+in|did|made|handled)\b\s*/i;

// Returns hint objects for a bullet: { kind: 'warn'|'tip', text }
export function lintBullet(text) {
  const t = String(text || '').trim();
  if (!t) return [];
  const hints = [];
  if (WEAK.test(t)) hints.push({ kind: 'warn', text: 'Start with a strong action verb instead.' });
  else {
    const first = t.split(/\s+/)[0].replace(/[^a-z]/gi, '').toLowerCase();
    if (/^(i|my|we|our)$/.test(first)) hints.push({ kind: 'warn', text: 'Skip "I/We". Lead with the verb.' });
  }
  if (!/\d/.test(t) && t.length > 25) hints.push({ kind: 'tip', text: 'Add a number: users, %, time saved, revenue.' });
  if (t.length > 200) hints.push({ kind: 'tip', text: 'Long bullet. Aim for 1–2 lines.' });
  return hints;
}

// Put a verb at the start of a bullet, replacing a weak opener or an existing action verb.
export function applyVerb(text, verb) {
  let t = String(text || '').trim();
  if (!t) return verb + ' ';
  if (WEAK.test(t)) t = t.replace(WEAK, '');
  else {
    const [first, ...rest] = t.split(/\s+/);
    if (ALL_VERBS.has(first.replace(/[^a-z]/gi, '').toLowerCase()) || /ed$/i.test(first)) t = rest.join(' ');
  }
  if (!t) return verb + ' ';
  const lowered = /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
  return `${verb} ${lowered}`;
}
