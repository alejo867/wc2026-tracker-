// build.js — runs during Vercel build to inject env vars into config.js
// Vercel makes process.env available during build from your project settings.

const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[build] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set.');
  console.warn('[build] The app will load but Supabase features will not work.');
  console.warn('[build] Add them in Vercel → Project Settings → Environment Variables.');
}

const config = `// Auto-generated at build time — do not edit
window.__WC_CONFIG__ = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseKey: ${JSON.stringify(supabaseKey)},
};
`;

fs.writeFileSync('config.js', config);
console.log('[build] config.js written. supabaseUrl:', supabaseUrl ? '✓ set' : '✗ missing');
