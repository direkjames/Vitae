// Vitae — job description matcher (runs entirely on-device)
// Author: direk james

// Known skills and phrases worth matching as a unit. [match term, display label]
const DICT = [
  // Dev
  ['java', 'Java'], ['kotlin', 'Kotlin'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['python', 'Python'],
  ['c#', 'C#'], ['c++', 'C++'], ['php', 'PHP'], ['rust', 'Rust'], ['swift', 'Swift'], ['dart', 'Dart'], ['lua', 'Lua'],
  ['html', 'HTML'], ['css', 'CSS'], ['sass', 'Sass'], ['tailwind', 'Tailwind'], ['bootstrap', 'Bootstrap'],
  ['react native', 'React Native'], ['react', 'React'], ['next.js', 'Next.js'], ['vue', 'Vue'], ['angular', 'Angular'], ['svelte', 'Svelte'], ['node.js', 'Node.js'],
  ['laravel', 'Laravel'], ['django', 'Django'], ['flask', 'Flask'], ['spring boot', 'Spring Boot'], ['spring', 'Spring'],
  ['flutter', 'Flutter'], ['jetpack compose', 'Jetpack Compose'], ['android', 'Android'], ['ios', 'iOS'],
  ['sql', 'SQL'], ['mysql', 'MySQL'], ['postgresql', 'PostgreSQL'], ['mongodb', 'MongoDB'], ['sqlite', 'SQLite'], ['redis', 'Redis'], ['firebase', 'Firebase'], ['supabase', 'Supabase'],
  ['rest api', 'REST API'], ['graphql', 'GraphQL'], ['api', 'API'], ['json', 'JSON'], ['websocket', 'WebSocket'],
  ['git', 'Git'], ['github', 'GitHub'], ['gitlab', 'GitLab'], ['ci/cd', 'CI/CD'], ['docker', 'Docker'], ['kubernetes', 'Kubernetes'], ['linux', 'Linux'],
  ['aws', 'AWS'], ['azure', 'Azure'], ['gcp', 'GCP'], ['google cloud', 'Google Cloud'], ['vercel', 'Vercel'], ['netlify', 'Netlify'], ['cloudflare', 'Cloudflare'],
  ['gradle', 'Gradle'], ['maven', 'Maven'], ['intellij', 'IntelliJ'], ['vs code', 'VS Code'], ['unit testing', 'Unit testing'], ['testing', 'Testing'], ['debugging', 'Debugging'],
  ['figma', 'Figma'], ['ui/ux', 'UI/UX'], ['ux', 'UX'], ['ui design', 'UI design'], ['responsive design', 'Responsive design'], ['accessibility', 'Accessibility'], ['seo', 'SEO'],
  ['pwa', 'PWA'], ['wordpress', 'WordPress'], ['shopify', 'Shopify'], ['webflow', 'Webflow'], ['wix', 'Wix'],
  ['machine learning', 'Machine learning'], ['ai', 'AI'], ['chatgpt', 'ChatGPT'], ['claude', 'Claude'], ['prompt engineering', 'Prompt engineering'], ['llm', 'LLM'],
  ['unity', 'Unity'], ['unreal', 'Unreal'], ['game development', 'Game development'],
  // Minecraft
  ['minecraft', 'Minecraft'], ['spigot', 'Spigot'], ['paper', 'Paper'], ['bukkit', 'Bukkit'], ['purpur', 'Purpur'], ['folia', 'Folia'], ['velocity', 'Velocity'],
  ['bungeecord', 'BungeeCord'], ['fabric', 'Fabric'], ['forge', 'Forge'], ['neoforge', 'NeoForge'], ['plugin development', 'Plugin development'],
  ['mod development', 'Mod development'], ['plugins', 'Plugins'], ['mods', 'Mods'], ['skript', 'Skript'], ['luckperms', 'LuckPerms'], ['vault', 'Vault'],
  ['placeholderapi', 'PlaceholderAPI'], ['worldguard', 'WorldGuard'], ['pterodactyl', 'Pterodactyl'], ['server management', 'Server management'], ['discord bot', 'Discord bot'], ['discord', 'Discord'],
  // VA / business
  ['virtual assistant', 'Virtual assistant'], ['data entry', 'Data entry'], ['customer service', 'Customer service'], ['customer support', 'Customer support'],
  ['email management', 'Email management'], ['calendar management', 'Calendar management'], ['inbox management', 'Inbox management'], ['scheduling', 'Scheduling'],
  ['social media management', 'Social media management'], ['social media', 'Social media'], ['content creation', 'Content creation'], ['copywriting', 'Copywriting'],
  ['lead generation', 'Lead generation'], ['cold calling', 'Cold calling'], ['appointment setting', 'Appointment setting'], ['bookkeeping', 'Bookkeeping'],
  ['quickbooks', 'QuickBooks'], ['xero', 'Xero'], ['crm', 'CRM'], ['hubspot', 'HubSpot'], ['salesforce', 'Salesforce'], ['zendesk', 'Zendesk'], ['gohighlevel', 'GoHighLevel'],
  ['google workspace', 'Google Workspace'], ['google sheets', 'Google Sheets'], ['google docs', 'Google Docs'], ['microsoft office', 'Microsoft Office'],
  ['excel', 'Excel'], ['powerpoint', 'PowerPoint'], ['canva', 'Canva'], ['photoshop', 'Photoshop'], ['notion', 'Notion'], ['trello', 'Trello'],
  ['asana', 'Asana'], ['clickup', 'ClickUp'], ['jira', 'Jira'], ['slack', 'Slack'], ['zapier', 'Zapier'], ['project management', 'Project management'],
  ['e-commerce', 'E-commerce'], ['amazon', 'Amazon'], ['research', 'Research'], ['video editing', 'Video editing'], ['graphic design', 'Graphic design'],
  // Soft skills (ranked lower)
  ['communication', 'Communication', 1], ['problem solving', 'Problem solving', 1], ['problem-solving', 'Problem-solving', 1], ['time management', 'Time management', 1],
  ['attention to detail', 'Attention to detail', 1], ['teamwork', 'Teamwork', 1], ['leadership', 'Leadership', 1], ['self-motivated', 'Self-motivated', 1],
  ['independently', 'Works independently', 1], ['english', 'English', 1], ['remote', 'Remote', 1],
];

const ALIASES = {
  javascript: ['js', 'es6'], typescript: ['ts'], 'node.js': ['nodejs', 'node'], 'next.js': ['nextjs'], postgresql: ['postgres'],
  'rest api': ['restful', 'rest apis', 'apis'], api: ['apis'], 'ci/cd': ['cicd', 'github actions'], 'ui/ux': ['ux/ui', 'ui', 'ux'],
  'customer service': ['customer support'], 'customer support': ['customer service'], excel: ['spreadsheets', 'google sheets'],
  'google sheets': ['spreadsheets'], paper: ['paper api', 'papermc'], spigot: ['spigot api', 'spigotmc'], intellij: ['intellij idea'],
  'microsoft office': ['ms office', 'office 365', 'microsoft 365'], 'google workspace': ['g suite', 'gsuite'],
  'plugin development': ['plugins', 'plugin'], plugins: ['plugin'], mods: ['mod'], 'social media': ['social media management'],
  'problem solving': ['problem-solving'], 'problem-solving': ['problem solving'],
};

const STOP = new Set(`a about above across after again against all almost also although always am among an and another any anyone anything are around as at
available be because been before being below best better between both but by can candidate candidates company could daily day days did do does doing done
each eg e.g either else end ensure etc even ever every experience experienced field for from full get give given go good great has have having help helping
here high highly how however i ideal ie i.e if in include includes including into is it its it's job join just keep key know knowledge least level like
looking make making manage many may me more most must my need needed needs new no nor not now of off on one only or other our out over own part per
plus position preferred previous provide quality re related required requirement requirements responsibilities responsible role same should skill skills so
some someone strong such team than that the their them then there these they thing things this those through time to together too tools under understanding
up us use used using various very want we well what when where whether which while who will with within work working would year years yet you your able
ability across apply applicant applicants based benefit benefits bonus building clients client closely create current currently deliver detail details
develop developer developers development duties environment excellent exciting expected familiar familiarity fast great growing hire hiring hour hours
hourly ideally impact important interest interested learn learning month monthly opportunity pay paid passion passionate perform plus proficiency proficient
proven qualifications range relevant salary schedule seeking solid start success successful support task tasks team's track week weekly world write
written yrs minimum maximum etc. including: must-have nice-to-have looking. join. based. remote-first fulltime full-time part-time freelance contract`.split(/\s+/));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (term) => new RegExp(`(?<![a-z0-9])${escapeRe(term)}(?![a-z0-9+#])`, 'gi');

function count(hay, term) {
  return (hay.match(termRe(term)) || []).length;
}

// Extract ranked keywords from a job post.
export function extractKeywords(jobText) {
  const text = ' ' + String(jobText || '').toLowerCase().replace(/[‘’]/g, "'") + ' ';
  if (text.trim().length < 20) return [];
  const found = new Map();
  const covered = new Set();

  for (const [term, label, weight = 3] of DICT) {
    const n = count(text, term);
    if (!n) continue;
    // Skip if a longer dictionary phrase already covers this word (e.g. "social media" inside "social media management")
    if ([...found.keys()].some((k) => k.includes(term) && k !== term)) continue;
    found.set(term, { term, label, score: weight * 10 + n, kind: weight > 1 ? 'hard' : 'soft' });
    term.split(/\s+/).forEach((w) => covered.add(w));
  }

  // Frequent single words that aren't in the dictionary (tools, domain terms)
  const freq = new Map();
  for (const m of text.matchAll(/[a-z][a-z0-9+#.\-/]*[a-z0-9+#]/g)) {
    const w = m[0].replace(/\.$/, '');
    if (w.length < 3 || STOP.has(w) || covered.has(w) || /^\d/.test(w) || /ing$|ly$/.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  for (const [w, n] of freq) {
    if (n < 2 || found.has(w)) continue;
    found.set(w, { term: w, label: w[0].toUpperCase() + w.slice(1), score: n, kind: 'other' });
  }

  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, 32);
}

export function matchResume(jobText, resumeText) {
  const keywords = extractKeywords(jobText);
  const hay = ' ' + String(resumeText || '').toLowerCase() + ' ';
  const matched = [];
  const missing = [];
  for (const k of keywords) {
    const variants = [k.term, ...(ALIASES[k.term] || [])];
    (variants.some((v) => count(hay, v) > 0) ? matched : missing).push(k);
  }
  const weightOf = (k) => (k.kind === 'hard' ? 3 : k.kind === 'soft' ? 1 : 1.5);
  const total = keywords.reduce((s, k) => s + weightOf(k), 0);
  const got = matched.reduce((s, k) => s + weightOf(k), 0);
  return { keywords, matched, missing, score: total ? Math.round((got / total) * 100) : 0 };
}
