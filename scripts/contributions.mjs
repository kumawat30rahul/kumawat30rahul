// Renders assets/contributions.svg — an animated, light-theme contribution history card.
// In GitHub Actions it pulls live data through the GraphQL API (GITHUB_TOKEN).
// Locally:  node scripts/contributions.mjs path/to/data.json   ({"YYYY-MM-DD": count, ...})
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const USER = process.env.GH_USER || "kumawat30rahul";

const font = (file, family, weight) =>
  `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(
    join(ROOT, "assets/fonts", file)
  ).toString("base64")}) format('woff2')}`;

async function fetchLive() {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const days = {};
  for (const w of json.data.user.contributionsCollection.contributionCalendar.weeks)
    for (const d of w.contributionDays) days[d.date] = d.contributionCount;
  return days;
}

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

export function render(counts, today = new Date()) {
  // Build a 53-week grid ending on `today`, Sunday-first like GitHub.
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = addDays(end, -(52 * 7 + end.getUTCDay()));
  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push({ date: iso(d), n: counts[iso(d)] || 0, dow: d.getUTCDay(), d });

  const total = days.reduce((s, x) => s + x.n, 0);
  const active = days.filter((x) => x.n > 0).length;
  const best = days.reduce((a, b) => (b.n > a.n ? b : a), days[0]);
  let longest = 0, run = 0;
  for (const x of days) { run = x.n ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].n) current++;
    else if (i === days.length - 1) continue; // today not counted yet is fine
    else break;
  }
  const max = Math.max(...days.map((x) => x.n), 1);
  const nz = days.map((x) => x.n).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => nz[Math.floor((nz.length - 1) * p)] || 1;
  const level = (n) => (n === 0 ? 0 : n <= q(0.25) ? 1 : n <= q(0.5) ? 2 : n <= q(0.8) ? 3 : 4);
  const COLORS = ["#eef0f6", "#c7d2fe", "#a5b4fc", "#6366f1", "#3730a3"];

  const W = 900, H = 330, CELL = 12, GAP = 3, GX = 52, GY = 150;
  let cells = "", months = "", lastMonth = -1;
  days.forEach((x, i) => {
    const col = Math.floor(i / 7) + (start.getUTCDay() ? 0 : 0);
    const cx = GX + col * (CELL + GAP), cy = GY + x.dow * (CELL + GAP);
    const lv = level(x.n);
    const delay = (col * 0.035 + x.dow * 0.02).toFixed(2);
    cells += `<rect class="c" style="animation-delay:${delay}s" x="${cx}" y="${cy}" width="${CELL}" height="${CELL}" rx="3" fill="${COLORS[lv]}"><title>${x.n} on ${x.date}</title></rect>`;
    const m = x.d.getUTCMonth();
    if (x.dow === 0 && m !== lastMonth && x.d.getUTCDate() <= 7) {
      months += `<text x="${cx}" y="${GY - 10}" class="lbl">${x.d.toLocaleString("en", { month: "short", timeZone: "UTC" })}</text>`;
      lastMonth = m;
    }
  });
  const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleString("en", { month: "short", day: "numeric", timeZone: "UTC" });
  const stat = (x, value, label, delay) => `
    <g class="up" style="animation-delay:${delay}s">
      <text x="${x}" y="78" class="num">${value}</text>
      <text x="${x}" y="102" class="lbl2">${label}</text>
    </g>`;
  const legend = COLORS.map((c, i) => `<rect x="${W - 150 + i * 17}" y="${H - 32}" width="12" height="12" rx="3" fill="${c}"/>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f5f7ff"/></linearGradient>
<style>
${font("geist-800.woff2", "Geist", 800)}${font("geist-500.woff2", "Geist", 500)}${font("geist-mono-400.woff2", "Geist Mono", 400)}
text{font-family:Geist,'Segoe UI',Arial,sans-serif}
.h{font-size:18px;font-weight:800;fill:#0b1020;letter-spacing:-.2px}
.sub{font-family:'Geist Mono',monospace;font-size:12px;fill:#5b6478}
.num{font-size:30px;font-weight:800;fill:#0b1020;letter-spacing:-.8px}
.lbl2{font-size:13px;font-weight:500;fill:#5b6478}
.lbl{font-family:'Geist Mono',monospace;font-size:11px;fill:#5b6478}
.c{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .45s cubic-bezier(.2,.9,.3,1.3) forwards}
@keyframes pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
.up{opacity:0;animation:up .7s ease-out forwards}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.live{animation:bl 1.6s ease-in-out infinite}@keyframes bl{50%{opacity:.25}}
</style></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="url(#bg)" stroke="#e3e6f0"/>
<text x="28" y="40" class="h">Last 12 months</text>

${(() => { const t = `${fmt(days[0].date)} → ${fmt(days[days.length - 1].date)}`; return `<circle class="live" cx="${W - 28 - t.length * 7.2 - 12}" cy="35.5" r="4" fill="#10b981"/><text x="${W - 28}" y="40" text-anchor="end" class="sub">${t}</text>`; })()}
${stat(28, total.toLocaleString("en"), "contributions this year", 0.1)}
${stat(238, `${current}d`, "current streak", 0.25)}
${stat(408, `${longest}d`, "longest streak", 0.4)}
${stat(578, active, "active days", 0.55)}
${stat(728, best.n, `best day · ${fmt(best.date)}`, 0.7)}
<line x1="28" y1="122" x2="${W - 28}" y2="122" stroke="#e8eaf2"/>
${months}
<text x="22" y="${GY + 1 * (CELL + GAP) + 10}" class="lbl">Mon</text>
<text x="22" y="${GY + 3 * (CELL + GAP) + 10}" class="lbl">Wed</text>
<text x="22" y="${GY + 5 * (CELL + GAP) + 10}" class="lbl">Fri</text>
${cells}
<text x="${W - 160}" y="${H - 22}" text-anchor="end" class="lbl">Less</text>${legend}<text x="${W - 60}" y="${H - 22}" class="lbl">More</text>
<text x="28" y="${H - 22}" class="lbl">updated daily · github.com/${USER}</text>
</svg>`;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const counts = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : await fetchLive();
  const today = process.env.TODAY ? new Date(process.env.TODAY) : new Date();
  writeFileSync(join(ROOT, "assets/contributions.svg"), render(counts, today));
  console.log("wrote assets/contributions.svg");
}
