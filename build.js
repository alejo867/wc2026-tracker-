// build.js — Vercel build script
const fs = require('fs');

const supabaseUrl  = process.env.SUPABASE_URL      || '';
const supabaseKey  = process.env.SUPABASE_ANON_KEY  || '';
const wcApiKey     = process.env.WC_API_KEY         || '';  // optional, get free at wc2026api.com

if (!supabaseUrl || !supabaseKey) {
  console.warn('[build] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set.');
}

const config = `// Auto-generated at build time — do not edit
window.__WC_CONFIG__ = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseKey: ${JSON.stringify(supabaseKey)},
  wcApiKey:    ${JSON.stringify(wcApiKey)},
};
`;

fs.writeFileSync('config.js', config);
console.log('[build] config.js written.');
console.log('[build] supabaseUrl:', supabaseUrl ? '✓' : '✗ missing');
console.log('[build] wcApiKey:',    wcApiKey    ? '✓ set' : '○ not set (live scores limited to 100 req/day free tier)');
