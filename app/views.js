// The four surfaces, each a pure function of live API data.
//   board(items)        the bounty board
//   bounty(b)           one bounty's page: summary, rules, rewards table, dates
//   leaderboard(lb)     a bounty's leaderboard, paginated 25 rows a page
//   profile(p)          an account's public profile
import { money, timeLeft, date, esc, md } from './format.js';

const bountyLink = (slug) => `#/bounty/${encodeURIComponent(slug)}`;
const boardLink = (slug) => bountyLink(slug);
const profileLink = (handle) => `#/u/${encodeURIComponent(handle)}`;
const livePot = (b) => (b.potUsd != null ? Number(b.potUsd) : b.rewardAmount);

export function boardCard(b) {
  const pot = livePot(b);
  return `<article class="card"><h2><a href="${boardLink(b.slug)}">${esc(b.title)}</a></h2>
  <p class="meta"><span class="pot">${money(pot)}</span><span>${b.entryFeeUsd ? 'Fee ' + money(b.entryFeeUsd) : 'Free entry'}</span>
  <span class="left">${timeLeft(b.deadline)}</span><span>${b.submissionCount ?? 0} entries</span></p>
  <p class="meta"><span class="tag">${esc(b.category || '')}</span><span class="mut">${esc(b.sponsor?.name || '')}</span></p></article>`;
}

export function board(items, query) {
  const q = (query || '').toLowerCase();
  const shown = q ? items.filter((b) => (b.title + ' ' + (b.category || '') + ' ' + (b.skills || []).join(' ')).toLowerCase().includes(q)) : items;
  return `<h1>Live bounties</h1>
  <p class="mut">${items.length} open · rewards show the live pot (base reward + entry fees paid)</p>
  <div class="toolbar"><label class="sr" for="q">Filter bounties</label>
  <input type="search" id="q" placeholder="Filter by title, category or skill…" value="${esc(query || '')}"></div>
  <div class="grid">${shown.map(boardCard).join('') || '<p>No bounties match.</p>'}</div>`;
}

export function rewardsTable(b) {
  const now = b.rewardsNow || [];
  const rows = now.length
    ? now.map((r) => `<tr><td>${r.place}${r.place === 1 ? 'st' : r.place === 2 ? 'nd' : r.place === 3 ? 'rd' : 'th'}</td><td class="num">${money(r.amountUsd)}</td><td class="mut small">base ${money(r.baseUsd)} + fees ${money(r.feeShareUsd)}</td></tr>`)
    : Object.entries(b.rewards || {}).map(([place, amt]) => `<tr><td>${place}</td><td class="num">${money(amt)}</td><td></td></tr>`);
  return `<h2>Rewards</h2><table><thead><tr><th>Place</th><th class="num">Prize</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

export function bounty(b) {
  return `<p><a href="#/">&larr; All bounties</a></p>
  <h1>${esc(b.title)}</h1>
  <p class="meta"><span class="pot">${money(livePot(b))} live pot</span>
  <span>${b.entryFeeUsd ? 'Entry fee ' + money(b.entryFeeUsd) : 'Free entry'}</span>
  <span class="left">${timeLeft(b.deadline)}</span><span>${b.submissionCount ?? 0} entries</span>
  <span class="tag">${esc(b.category || '')}</span></p>
  <p class="meta"><span>Closes ${date(b.deadline)}</span><span>Published ${date(b.publishedAt)}</span>
  <span>Status: ${esc(b.status || '')}</span></p>
  <p><a href="${bountyLink(b.slug)}/leaderboard">Leaderboard &rarr;</a> · <a href="https://make.fun/bounty/${esc(b.slug)}">View on make.fun &rarr;</a></p>
  ${rewardsTable(b)}
  <h2>Rules</h2><div class="md">${md(b.description || '')}</div>`;
}

export function leaderboard(lb, page) {
  // The API's columns carry the scored metrics; the hunter handle is a field
  // on each entry, not a column, so it gets its own first column (linked to
  // the hunter's public profile). Micro values (…_micro) read as percents.
  const cols = [{ key: '__handle', title: 'Hunter', sorting: null }].concat((lb.columns || []).filter((c) => !c.hidden));
  const rows = lb.entries || [];
  const per = 25, pages = Math.max(1, Math.ceil(rows.length / per));
  const p = Math.min(Math.max(1, page || 1), pages);
  const slice = rows.slice((p - 1) * per, p * per);
  const cell = (r, c) => {
    if (c.key === '__handle') return `<a href="${profileLink(r.handle)}">${esc(r.handle)}</a>`;
    const v = r.display ? r.display[c.key] : r[c.key];
    if (v == null || v === '') return '—';
    if (c.source && c.source.includes('_micro') && !Number.isNaN(Number(v))) return (Number(v) / 10000).toFixed(2) + '%';
    return esc(v);
  };
  return `<p><a href="${bountyLink(lb.competition.slug)}">&larr; ${esc(lb.competition.title)}</a></p>
  <h1>Leaderboard</h1>
  <p class="mut">${esc(lb.title || '')} · ${rows.length} entries · ${esc(lb.competition.status || '')}</p>
  ${(lb.views || []).length > 1 ? `<p class="small">View: ${lb.views.map((v) => v === lb.view ? `<b>${esc(v)}</b>` : `<a href="${bountyLink(lb.competition.slug)}/leaderboard?view=${v}">${esc(v)}</a>`).join(' · ')}</p>` : ''}
  <table><thead><tr><th>#</th>${cols.map((c) => `<th class="${c.sorting === 'desc' ? 'num' : ''}">${esc(c.title)}</th>`).join('')}</tr></thead>
  <tbody>${slice.map((r, i) => `<tr><td>${(p - 1) * per + i + 1}</td>${cols.map((c) => `<td class="${c.sorting === 'desc' ? 'num' : ''}">${cell(r, c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <div class="pager">${p > 1 ? `<a href="${bountyLink(lb.competition.slug)}/leaderboard?page=${p - 1}"><button class="ghost">&larr; Prev</button></a>` : ''}
  <span>Page ${p} of ${pages}</span>
  ${p < pages ? `<a href="${bountyLink(lb.competition.slug)}/leaderboard?page=${p + 1}"><button class="ghost">Next &rarr;</button></a>` : ''}</div>`;
}

export function profile(p) {
  const r = p.record || {};
  const sols = (p.solutions || []).map((s) => `<tr><td><a href="${bountyLink(s.competition.slug)}">${esc(s.competition.title)}</a></td>
    <td>${s.placement ? '#' + s.placement : '—'}</td><td class="num">${s.prize_usd ? money(s.prize_usd) : '—'}</td>
    <td>${s.score ? esc(s.score.display) : '—'}</td><td class="mut small">${date(s.entered_at)}</td></tr>`).join('');
  return `<p><a href="#/">&larr; All bounties</a></p>
  <h1><span class="avatar">${esc((p.handle || '?')[0].toUpperCase())}</span> @${esc(p.handle)}</h1>
  ${p.display_name ? `<p><b>${esc(p.display_name)}</b></p>` : ''}${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
  <p class="mut small">Joined ${date(p.joined_at)}${p.github_login ? ` · GitHub @${esc(p.github_login)}` : ''}${p.x ? ` · X @${esc(p.x)}` : ''}</p>
  <p><span class="stat"><b>${r.competitions_entered ?? 0}</b>entered</span>
  <span class="stat"><b>${r.competitions_placed ?? 0}</b>placed</span>
  <span class="stat"><b>${r.competitions_won ?? 0}</b>won</span>
  <span class="stat"><b>${r.best_placement ? '#' + r.best_placement : '—'}</b>best</span>
  <span class="stat"><b>${money(r.prize_usd)}</b>prizes</span></p>
  <h2>Entries (${(p.solutions || []).length})</h2>
  ${sols ? `<table><thead><tr><th>Bounty</th><th>Place</th><th class="num">Prize</th><th>Score</th><th>Entered</th></tr></thead><tbody>${sols}</tbody></table>` : '<p>No entries yet.</p>'}`;
}
