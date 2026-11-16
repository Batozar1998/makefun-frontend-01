// make.fun's public API: read-only GET requests, open to any origin (CORS).
// Full API described at https://make.fun/api/openapi.json.
// One tiny cache: answers are re-used for 60 s so a back-and-forth view costs
// no new request, and each view fetches only what it shows.
const API = 'https://make.fun/api';
const TTL = 60_000;
const cache = new Map();

async function get(path) {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && now - hit.at < TTL) return hit.data;
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`make.fun API ${res.status} for ${path}`);
  const data = await res.json();
  cache.set(path, { at: now, data });
  return data;
}

export const clearCache = () => cache.clear();

/** Open bounties, newest page first: { items, next_cursor }. */
export const getBounties = (cursor) =>
  get('/competitions?status=open&activity=times&limit=50' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''));

/** One bounty, by slug: reward, live pot, entry fee, rewards, description, dates. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** A bounty's leaderboard: { competition, columns, entries } (entries are paged client-side). */
export const getLeaderboard = (slug, view) =>
  get(`/competitions/${encodeURIComponent(slug)}/leaderboard?rows=all` + (view ? `&view=${view}` : ''));

/** An account's public profile: { handle, bio, record, solutions }. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
