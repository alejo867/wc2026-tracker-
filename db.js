// ============================================================
// db.js — Supabase client + all data operations
// Loaded as a module from index.html
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Client ────────────────────────────────────────────────────
// These placeholders are replaced at deploy time via Vercel env vars
// injected into config.js (see vercel.json build step)
const SUPABASE_URL  = window.__WC_CONFIG__?.supabaseUrl  || '';
const SUPABASE_KEY  = window.__WC_CONFIG__?.supabaseKey  || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// ── Auth ──────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    }
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Predictions ───────────────────────────────────────────────

export async function loadPredictions(userId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, home_score, away_score, predicted_winner')
    .eq('user_id', userId);
  if (error) throw error;
  // Convert to { matchId: { h, a, w } } map for fast lookup
  return Object.fromEntries(
    data.map(r => [r.match_id, { h: r.home_score, a: r.away_score, w: r.predicted_winner }])
  );
}

export async function savePrediction(userId, matchId, homeScore, awayScore, winner) {
  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id: userId,
      match_id: matchId,
      home_score: parseInt(homeScore),
      away_score: parseInt(awayScore),
      predicted_winner: winner || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,match_id' });
  if (error) throw error;
}

// ── Events (watch plans) ──────────────────────────────────────

export async function loadEvents(userId) {
  const { data, error } = await supabase
    .from('events')
    .select('match_id, event_type, notes')
    .eq('user_id', userId);
  if (error) throw error;
  return Object.fromEntries(data.map(r => [r.match_id, r.event_type]));
}

export async function saveEvent(userId, matchId, eventType) {
  if (!eventType) {
    // Delete if cleared
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('user_id', userId)
      .eq('match_id', matchId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('events')
    .upsert({
      user_id: userId,
      match_id: matchId,
      event_type: eventType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,match_id' });
  if (error) throw error;
}

// ── Favorites ─────────────────────────────────────────────────

export async function loadFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('match_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map(r => r.match_id));
}

export async function toggleFavorite(userId, matchId, isFav) {
  if (isFav) {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, match_id: matchId });
    if (error && error.code !== '23505') throw error; // ignore duplicate
  } else {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('match_id', matchId);
    if (error) throw error;
  }
}

// ── Shared snapshots ──────────────────────────────────────────

function makeSlug(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export async function createShareLink(userId, displayName, predictions) {
  const slug = makeSlug();
  const { error } = await supabase
    .from('shared_snapshots')
    .insert({
      user_id: userId,
      slug,
      display_name: displayName,
      predictions,
    });
  if (error) throw error;
  return `${window.location.origin}/share/${slug}`;
}

export async function loadSharedSnapshot(slug) {
  const { data, error } = await supabase
    .from('shared_snapshots')
    .select('display_name, predictions, created_at')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

// ── Bulk load (called once on sign-in) ────────────────────────

export async function loadAllUserData(userId) {
  const [preds, evts, favs] = await Promise.all([
    loadPredictions(userId),
    loadEvents(userId),
    loadFavorites(userId),
  ]);
  return { preds, evts, favs };
}
