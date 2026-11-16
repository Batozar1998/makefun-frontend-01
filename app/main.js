// Router + rendering. Hash routes, one per surface:
//   #/                          the bounty board
//   #/bounty/<slug>             one bounty's page (rules + rewards)
//   #/bounty/<slug>/leaderboard its leaderboard
//   #/u/<handle>                an account's public profile
// window.__shotReady is false while a route loads, true once its data is on
// screen, so a screenshot script knows when to capture.
import { getBounties, getBounty, getLeaderboard, getProfile, clearCache } from './api.js';
import { board, boardCard, bounty, leaderboard, profile } from './views.js';

const app = document.getElementById('app');
let boardItems = [];
let boardCursor = null;

function loading() {
  window.__shotReady = false;
  app.innerHTML = '<p>Loading…</p>';
}

function failed(err) {
  app.innerHTML = `<p class="err">Could not load live data from make.fun: ${err.message}. <button class="ghost" onclick="location.reload()">Retry</button></p>`;
  window.__shotReady = true;
}

async function renderBoard(query) {
  try {
    if (!boardItems.length) {
      const data = await getBounties();
      boardItems = data.items || [];
      boardCursor = data.next_cursor || null;
    }
    app.innerHTML = board(boardItems, query)
      + (boardCursor ? '<p><button id="more" class="ghost">Load more bounties</button></p>' : '')
      + '<p class="small mut"><button id="refresh" class="ghost">Refresh live data</button></p>';
    const q = document.getElementById('q');
    q.addEventListener('input', () => {
      const needle = q.value.toLowerCase();
      const shown = boardItems.filter((b) => (b.title + ' ' + (b.category || '') + ' ' + (b.skills || []).join(' ')).toLowerCase().includes(needle));
      app.querySelector('.grid').innerHTML = shown.map(boardCard).join('') || '<p>No bounties match.</p>';
    });
    const more = document.getElementById('more');
    if (more) more.addEventListener('click', async () => {
      more.disabled = true;
      const data = await getBounties(boardCursor);
      boardItems = boardItems.concat(data.items || []);
      boardCursor = data.next_cursor || null;
      renderBoard(q.value);
    });
    document.getElementById('refresh').addEventListener('click', () => { clearCache(); boardItems = []; renderBoard(); });
    document.title = 'make.fun bounties';
  } catch (err) { failed(err); }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

async function render() {
  loading();
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/').map(decodeURIComponent);
  const query = new URLSearchParams(location.hash.split('?')[1] || '');
  try {
    if (parts[0] === 'bounty' && parts[1] && parts[2] === 'leaderboard') {
      const lb = await getLeaderboard(parts[1], query.get('view'));
      app.innerHTML = leaderboard(lb, Number(query.get('page')) || 1);
      document.title = `Leaderboard · ${lb.competition.title} | make.fun`;
    } else if (parts[0] === 'bounty' && parts[1]) {
      const b = await getBounty(parts[1]);
      app.innerHTML = bounty(b);
      document.title = `${b.title} | make.fun`;
    } else if (parts[0] === 'u' && parts[1]) {
      const p = await getProfile(parts[1]);
      app.innerHTML = profile(p);
      document.title = `@${p.handle} | make.fun`;
    } else {
      await renderBoard();
      return;
    }
  } catch (err) { failed(err); }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

document.getElementById('lookup').addEventListener('submit', (e) => {
  e.preventDefault();
  const handle = document.getElementById('handle').value.trim().replace(/^@/, '');
  if (handle) location.hash = `#/u/${encodeURIComponent(handle)}`;
});

window.addEventListener('hashchange', render);
render();
