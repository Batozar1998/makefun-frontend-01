// Small formatting helpers: money, countdowns, dates. No dependencies.
export const money = (v) => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (n == null || Number.isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

export function timeLeft(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(ms)) return '—';
  if (ms <= 0) return 'ended';
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m % 60}m left`;
  return `${m}m left`;
}

export const date = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

/** Escape text for safe HTML insertion. */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Minimal Markdown for bounty descriptions: headings, lists, bold, code, links. */
export function md(src) {
  const lines = String(src ?? '').split('\n');
  let out = '', list = false;
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
  const closeList = () => { if (list) { out += '</ul>'; list = false; } };
  for (const line of lines) {
    const h3 = line.match(/^###\s+(.*)/), h2 = line.match(/^##\s+(.*)/);
    const li = line.match(/^[-*]\s+(.*)/);
    if (h2) { closeList(); out += `<h2>${inline(h2[1])}</h2>`; }
    else if (h3) { closeList(); out += `<h3>${inline(h3[1])}</h3>`; }
    else if (li) { if (!list) { out += '<ul>'; list = true; } out += `<li>${inline(li[1])}</li>`; }
    else if (line.trim() === '') { closeList(); }
    else { closeList(); out += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return out;
}
