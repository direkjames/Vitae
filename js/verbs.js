// Vitae — bullet point helper: action verbs by profession and quick checks
// Author: direk james

export const PROFESSIONS = [
  {
    id: 'all',
    name: 'All',
    groups: [
      { name: 'Achieved', verbs: ['Achieved', 'Exceeded', 'Delivered', 'Completed', 'Earned', 'Won', 'Surpassed', 'Reached'] },
      { name: 'Led', verbs: ['Led', 'Managed', 'Coordinated', 'Organized', 'Mentored', 'Supervised', 'Trained', 'Oversaw', 'Spearheaded'] },
      { name: 'Improved', verbs: ['Improved', 'Increased', 'Reduced', 'Streamlined', 'Boosted', 'Enhanced', 'Grew', 'Saved', 'Simplified'] },
      { name: 'Created', verbs: ['Created', 'Built', 'Designed', 'Developed', 'Launched', 'Established', 'Introduced', 'Produced'] },
      { name: 'Supported', verbs: ['Supported', 'Assisted', 'Resolved', 'Handled', 'Maintained', 'Processed', 'Served', 'Prepared'] },
      { name: 'Communicated', verbs: ['Presented', 'Wrote', 'Documented', 'Collaborated', 'Negotiated', 'Partnered', 'Reported'] },
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    groups: [
      { name: 'Built', verbs: ['Built', 'Developed', 'Engineered', 'Architected', 'Implemented', 'Shipped', 'Deployed', 'Integrated', 'Automated', 'Prototyped'] },
      { name: 'Improved', verbs: ['Optimized', 'Refactored', 'Debugged', 'Reduced', 'Scaled', 'Migrated', 'Secured', 'Modernized', 'Accelerated'] },
      { name: 'Quality', verbs: ['Tested', 'Reviewed', 'Documented', 'Maintained', 'Monitored', 'Fixed', 'Released'] },
    ],
  },
  {
    id: 'teacher',
    name: 'Teacher',
    groups: [
      { name: 'Teaching', verbs: ['Taught', 'Instructed', 'Facilitated', 'Lectured', 'Tutored', 'Coached', 'Guided', 'Demonstrated'] },
      { name: 'Planning', verbs: ['Designed', 'Prepared', 'Developed', 'Adapted', 'Differentiated', 'Integrated', 'Organized', 'Planned'] },
      { name: 'Student results', verbs: ['Assessed', 'Evaluated', 'Monitored', 'Improved', 'Raised', 'Motivated', 'Encouraged', 'Supported'] },
      { name: 'School & community', verbs: ['Coordinated', 'Communicated', 'Collaborated', 'Advised', 'Counseled', 'Mentored', 'Led', 'Organized'] },
    ],
  },
  {
    id: 'bpo',
    name: 'BPO / Support',
    groups: [
      { name: 'Customer care', verbs: ['Resolved', 'Handled', 'Assisted', 'Answered', 'Supported', 'Troubleshot', 'Responded', 'Guided'] },
      { name: 'Performance', verbs: ['Exceeded', 'Achieved', 'Maintained', 'Retained', 'Upsold', 'Converted', 'Surpassed', 'Met'] },
      { name: 'Quality', verbs: ['De-escalated', 'Escalated', 'Documented', 'Verified', 'Processed', 'Updated', 'Followed', 'Complied'] },
      { name: 'Team', verbs: ['Trained', 'Coached', 'Mentored', 'Monitored', 'Coordinated', 'Onboarded'] },
    ],
  },
  {
    id: 'retail',
    name: 'Retail / Sales',
    groups: [
      { name: 'Sales', verbs: ['Sold', 'Upsold', 'Cross-sold', 'Achieved', 'Exceeded', 'Generated', 'Increased', 'Promoted', 'Recommended'] },
      { name: 'Customers', verbs: ['Assisted', 'Greeted', 'Served', 'Resolved', 'Advised', 'Handled', 'Built'] },
      { name: 'Store operations', verbs: ['Restocked', 'Organized', 'Arranged', 'Processed', 'Balanced', 'Counted', 'Opened', 'Closed', 'Maintained', 'Reduced'] },
      { name: 'Team', verbs: ['Trained', 'Supervised', 'Coordinated', 'Scheduled', 'Supported'] },
    ],
  },
  {
    id: 'crew',
    name: 'Service Crew',
    groups: [
      { name: 'Service', verbs: ['Served', 'Greeted', 'Took', 'Prepared', 'Cooked', 'Assembled', 'Delivered', 'Handled', 'Packed'] },
      { name: 'Operations', verbs: ['Maintained', 'Cleaned', 'Sanitized', 'Restocked', 'Operated', 'Opened', 'Closed', 'Followed', 'Complied'] },
      { name: 'Cashiering', verbs: ['Processed', 'Balanced', 'Counted', 'Recorded', 'Reconciled'] },
      { name: 'Team', verbs: ['Trained', 'Supported', 'Coordinated', 'Covered', 'Recognized'] },
    ],
  },
  {
    id: 'merch',
    name: 'Merchandiser',
    groups: [
      { name: 'Displays', verbs: ['Arranged', 'Displayed', 'Merchandised', 'Set up', 'Implemented', 'Refreshed', 'Rotated', 'Labeled', 'Priced'] },
      { name: 'Inventory', verbs: ['Monitored', 'Restocked', 'Replenished', 'Audited', 'Counted', 'Tracked', 'Reported', 'Ordered'] },
      { name: 'Results', verbs: ['Increased', 'Improved', 'Boosted', 'Maintained', 'Achieved', 'Secured'] },
      { name: 'Accounts', verbs: ['Coordinated', 'Communicated', 'Negotiated', 'Visited', 'Built', 'Covered'] },
    ],
  },
  {
    id: 'creative',
    name: 'Creative',
    groups: [
      { name: 'Ideas', verbs: ['Conceptualized', 'Created', 'Pitched', 'Storyboarded', 'Directed', 'Curated', 'Styled'] },
      { name: 'Production', verbs: ['Produced', 'Crafted', 'Photographed', 'Shot', 'Launched', 'Delivered', 'Published'] },
      { name: 'Results', verbs: ['Grew', 'Increased', 'Boosted', 'Engaged', 'Reached', 'Won'] },
      { name: 'Collaboration', verbs: ['Collaborated', 'Partnered', 'Presented', 'Managed', 'Coordinated'] },
    ],
  },
  {
    id: 'editor',
    name: 'Editor / Writer',
    groups: [
      { name: 'Editing', verbs: ['Edited', 'Proofread', 'Copyedited', 'Revised', 'Rewrote', 'Polished', 'Fact-checked', 'Localized'] },
      { name: 'Writing', verbs: ['Wrote', 'Authored', 'Drafted', 'Published', 'Researched', 'Translated', 'Ghostwrote', 'Scripted'] },
      { name: 'Results', verbs: ['Increased', 'Grew', 'Improved', 'Ranked', 'Standardized', 'Delivered'] },
    ],
  },
  {
    id: 'designer',
    name: 'Designer',
    groups: [
      { name: 'Design', verbs: ['Designed', 'Redesigned', 'Branded', 'Crafted', 'Composed', 'Created', 'Illustrated', 'Styled'] },
      { name: 'Process', verbs: ['Prototyped', 'Wireframed', 'Researched', 'Iterated', 'Refined', 'Tested', 'Presented'] },
      { name: 'Systems', verbs: ['Standardized', 'Systematized', 'Documented', 'Delivered', 'Launched', 'Improved'] },
    ],
  },
  {
    id: 'video',
    name: 'Video Editor',
    groups: [
      { name: 'Editing', verbs: ['Edited', 'Cut', 'Assembled', 'Trimmed', 'Synced', 'Captioned', 'Rendered', 'Repurposed'] },
      { name: 'Post-production', verbs: ['Color-graded', 'Graded', 'Mixed', 'Animated', 'Composited', 'Retouched', 'Mastered'] },
      { name: 'Production', verbs: ['Produced', 'Directed', 'Shot', 'Filmed', 'Storyboarded', 'Scripted'] },
      { name: 'Results', verbs: ['Grew', 'Increased', 'Boosted', 'Delivered', 'Reduced'] },
    ],
  },
  {
    id: 'illustrator',
    name: 'Illustrator',
    groups: [
      { name: 'Artwork', verbs: ['Illustrated', 'Drew', 'Sketched', 'Painted', 'Inked', 'Colored', 'Rendered', 'Animated'] },
      { name: 'Concepts', verbs: ['Conceptualized', 'Designed', 'Developed', 'Created', 'Storyboarded', 'Visualized'] },
      { name: 'Clients', verbs: ['Delivered', 'Collaborated', 'Completed', 'Published', 'Exhibited', 'Sold'] },
    ],
  },
];

const strip = (w) => String(w || '').replace(/[^a-z]/gi, '').toLowerCase();
const ALL_VERBS = new Set(PROFESSIONS.flatMap((p) => p.groups.flatMap((g) => g.verbs.map((v) => strip(v.split(' ')[0])))));

const WEAK = /^(?:i\s+)?(was\s+)?(responsible\s+for|helped(\s+to|\s+with)?|worked\s+on|assisted\s+(in|with)|tasked\s+with|in\s+charge\s+of|duties\s+included|involved\s+in|did|made)\b\s*/i;

// Returns hint objects for a bullet: { kind: 'warn'|'tip', text }
export function lintBullet(text) {
  const t = String(text || '').trim();
  if (!t) return [];
  const hints = [];
  if (WEAK.test(t)) hints.push({ kind: 'warn', text: 'Start with a strong action verb instead.' });
  else {
    const first = strip(t.split(/\s+/)[0]);
    if (/^(i|my|we|our)$/.test(first)) hints.push({ kind: 'warn', text: 'Skip "I/We". Lead with the verb.' });
  }
  if (!/\d/.test(t) && t.length > 25) hints.push({ kind: 'tip', text: 'Add a number: people, %, time saved, sales, ratings.' });
  if (t.length > 200) hints.push({ kind: 'tip', text: 'Long bullet. Aim for 1–2 lines.' });
  return hints;
}

// Put a verb at the start of a bullet, replacing a weak opener or an existing action verb.
export function applyVerb(text, verb) {
  let t = String(text || '').trim();
  if (!t) return verb + ' ';
  if (WEAK.test(t)) t = t.replace(WEAK, '');
  else {
    const words = t.split(/\s+/);
    const first = strip(words[0]);
    if (ALL_VERBS.has(first) || /ed$/i.test(words[0])) {
      words.shift();
      if (words.length && strip(words[0]) === 'up' && /^set$/i.test(first)) words.shift();
      t = words.join(' ');
    }
  }
  if (!t) return verb + ' ';
  const lowered = /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
  return `${verb} ${lowered}`;
}
