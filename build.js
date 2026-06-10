// build.js — Vercel build script
const fs = require('fs');

const supabaseUrl    = process.env.SUPABASE_URL       || '';
const supabaseKey    = process.env.SUPABASE_ANON_KEY   || '';
const footballApiKey = process.env.FOOTBALL_API_KEY    || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[build] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set.');
}

const config = `// Auto-generated at build time — do not edit
window.__WC_CONFIG__ = {
  supabaseUrl:      ${JSON.stringify(supabaseUrl)},
  supabaseKey:      ${JSON.stringify(supabaseKey)},
  footballApiKey:   ${JSON.stringify(footballApiKey)},
};
`;

fs.writeFileSync('config.js', config);
console.log('[build] config.js written.');
console.log('[build] supabaseUrl:    ', supabaseUrl    ? '✓ set' : '✗ missing');
console.log('[build] supabaseKey:    ', supabaseKey    ? '✓ set' : '✗ missing');
console.log('[build] footballApiKey:', footballApiKey ? '✓ set' : '○ not set — add FOOTBALL_API_KEY in Vercel env vars');
