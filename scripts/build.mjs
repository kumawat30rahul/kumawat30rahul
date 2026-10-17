// Builds the static animated SVGs in assets/. Run once after editing content:
//   npm i simple-icons && node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as si from "simple-icons";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = (f) => join(ROOT, "assets", f);
mkdirSync(A("social"), { recursive: true });

// ───────────────────────── design tokens ─────────────────────────
const C = {
  ink: "#0b1020", body: "#283046", muted: "#5b6478", line: "#e3e6f0",
  indigo: "#4f46e5", sky: "#0284c7", pink: "#db2777", green: "#10b981",
};
const fontCache = {};
const font = (file, family, weight) =>
  (fontCache[file] ??= `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(
    A("fonts/" + file)
  ).toString("base64")}) format('woff2')}`);
const F = {
  s4: () => font("geist-400.woff2", "Geist", 400),
  s5: () => font("geist-500.woff2", "Geist", 500),
  s6: () => font("geist-600.woff2", "Geist", 600),
  s8: () => font("geist-800.woff2", "Geist", 800),
  m4: () => font("geist-mono-400.woff2", "Geist Mono", 400),
  m5: () => font("geist-mono-500.woff2", "Geist Mono", 500),
};
const BASE = `text{font-family:Geist,'Segoe UI',Arial,sans-serif;text-rendering:geometricPrecision}.mono{font-family:'Geist Mono',Consolas,monospace}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"><defs>${defs}</defs>${body}</svg>`;
const icon = (key, x, y, size, color) => {
  const ic = si[key];
  const s = size / 24;
  return `<path transform="translate(${x} ${y}) scale(${s})" d="${ic.path}" fill="${color ?? "#" + ic.hex}"/>`;
};
// Hand-drawn glyphs for things without a brand icon
const GLYPH = {
  linkedin: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})"><rect width="24" height="24" rx="4" fill="${c}"/><path d="M6.6 9.6h2.6V18H6.6zM7.9 5.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.9 9.6h2.5v1.2c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18h-2.6v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.7z" fill="#fff"/></g>`,
  globe: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c2.8 3 4 6.4 4 10s-1.2 7-4 10c-2.8-3-4-6.4-4-10s1.2-7 4-10z"/></g>`,
  agent: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="${c}"><path d="M12 1.5l2.2 6.3 6.3 2.2-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-2.2z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z" opacity=".65"/><path d="M5 16l.6 1.7 1.7.6-1.7.6L5 20.6l-.6-1.7-1.7-.6 1.7-.6z" opacity=".45"/></g>`,
};

// ───────────────────────── header ─────────────────────────
{
  const W = 1200, H = 360;
  const defs = `
  <radialGradient id="b1"><stop stop-color="#c7d2fe" stop-opacity=".9"/><stop offset="1" stop-color="#c7d2fe" stop-opacity="0"/></radialGradient>
  <radialGradient id="b2"><stop stop-color="#bae6fd" stop-opacity=".9"/><stop offset="1" stop-color="#bae6fd" stop-opacity="0"/></radialGradient>
  <radialGradient id="b3"><stop stop-color="#fbcfe8" stop-opacity=".8"/><stop offset="1" stop-color="#fbcfe8" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.2" fill="#0b1020" fill-opacity=".07"/></pattern>
  <clipPath id="r"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <style>${F.s8()}${F.s5()}${F.m4()}${F.m5()}${BASE}
  .b1{animation:f1 16s ease-in-out infinite}.b2{animation:f2 19s ease-in-out infinite}.b3{animation:f3 13s ease-in-out infinite}
  @keyframes f1{50%{transform:translate(240px,50px)}}@keyframes f2{50%{transform:translate(-260px,-50px)}}@keyframes f3{50%{transform:translate(-140px,80px)}}
  .rise{opacity:0;animation:rise .9s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .blink{animation:bl 1.6s ease-in-out infinite}@keyframes bl{50%{opacity:.25}}
  .orb{transform-origin:1000px 180px;animation:spin 20s linear infinite}.orb2{transform-origin:1000px 180px;animation:spin 12s linear infinite reverse}
  @keyframes spin{to{transform:rotate(360deg)}}
  .float{animation:fl 5s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-8px)}}
  .ul{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.4s 1.1s cubic-bezier(.6,0,.2,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}
  </style>`;
  const body = `<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="#fbfcff"/>
  <circle class="b1" cx="200" cy="60" r="300" fill="url(#b1)"/>
  <circle class="b2" cx="1020" cy="320" r="300" fill="url(#b2)"/>
  <circle class="b3" cx="680" cy="-10" r="240" fill="url(#b3)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <g class="rise" style="animation-delay:.1s">
    <rect x="80" y="64" width="246" height="34" rx="17" fill="#ffffff" stroke="${C.line}"/>
    <circle class="blink" cx="101" cy="81" r="5" fill="${C.green}"/>
    <text x="115" y="86" class="mono" font-size="14" font-weight="500" fill="${C.body}">SDE-1 @ SwiffyLabs</text>
  </g>
  <text class="rise" style="animation-delay:.3s" x="76" y="178" font-size="80" font-weight="800" letter-spacing="-3" fill="${C.ink}">Rahul Kumawat</text>
  <path class="ul" d="M82 196 H500" stroke="${C.indigo}" stroke-width="4" stroke-linecap="round"/>
  <text class="rise" style="animation-delay:.6s" x="80" y="240" font-size="25" font-weight="500" fill="${C.body}">Software Engineer · Full-stack developer · Product builder</text>
  <text class="rise mono" style="animation-delay:.9s" x="81" y="288" font-size="15" fill="${C.muted}">React · Next.js · TypeScript · Node.js · Agentic coding</text>
  <g class="float">
    <circle cx="1000" cy="180" r="112" stroke="#0b1020" stroke-opacity=".08" fill="#ffffff" fill-opacity=".55"/>
    <circle cx="1000" cy="180" r="76" stroke="${C.indigo}" stroke-opacity=".25" stroke-dasharray="4 7"/>
    <g class="orb"><circle cx="1000" cy="68" r="8" fill="${C.indigo}"/><circle cx="1112" cy="180" r="5" fill="${C.pink}"/></g>
    <g class="orb2"><circle cx="1000" cy="256" r="6" fill="${C.sky}"/></g>
    <rect x="952" y="148" width="96" height="64" rx="16" fill="${C.ink}"/>
    <text x="1000" y="190" text-anchor="middle" font-size="28" font-weight="500" class="mono" fill="#ffffff">&lt;/&gt;</text>
  </g></g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23.5" stroke="${C.line}"/>`;
  writeFileSync(A("header.svg"), svg(W, H, defs, body));
}

// ───────────────────────── typing line (self-hosted) ─────────────────────────
{
  const lines = [
    "SDE-1 at SwiffyLabs",
    "Building a portfolio generator",
    "Shipping brainup.in & calculatorhq.in",
    "Coding with AI agents, shipping faster",
    "Progressing little by little",
  ];
  const W = 820, H = 48, FS = 22, CW = FS * 0.6, SLOT = 4.4;
  const total = lines.length * SLOT;
  let groups = "";
  lines.forEach((t, i) => {
    const w = t.length * CW, x0 = (W - w) / 2;
    const vals = [], times = [];
    const t0 = i * SLOT, typeDur = Math.min(1.6, t.length * 0.055), hold = 1.8, eraseDur = 0.6;
    const push = (s, v) => { vals.push(v); times.push(Math.min(1, s / total).toFixed(4)); };
    push(0, 0);
    if (t0 > 0) push(t0, 0);
    for (let c = 1; c <= t.length; c++) push(t0 + (typeDur * c) / t.length, c * CW);
    push(t0 + typeDur + hold, w);
    for (let c = t.length - 1; c >= 0; c -= 3) push(t0 + typeDur + hold + (eraseDur * (t.length - c)) / t.length, c * CW);
    push(t0 + typeDur + hold + eraseDur, 0);
    push(total, 0);
    // de-duplicate monotonic times
    const V = [], T = [];
    times.forEach((tt, k) => { if (!T.length || tt > T[T.length - 1]) { T.push(tt); V.push(vals[k]); } });
    T[T.length - 1] = "1";
    const anim = (attr, map) => `<animate attributeName="${attr}" dur="${total}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${T.join(";")}" values="${V.map(map).join(";")}"/>`;
    groups += `<clipPath id="c${i}"><rect x="${x0}" y="0" height="${H}" width="0">${anim("width", (v) => v.toFixed(1))}</rect></clipPath>
      <text clip-path="url(#c${i})" x="${x0}" y="31" font-size="${FS}" class="mono" font-weight="500" fill="${C.indigo}">${esc(t)}</text>
      <rect y="12" width="2.5" height="24" rx="1" fill="${C.ink}" x="${x0}" opacity="0">${anim("x", (v) => (x0 + v + 2).toFixed(1))}<animate attributeName="opacity" dur="${total}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${(i * SLOT / total).toFixed(4)};${(((i + 1) * SLOT) / total).toFixed(4)};1" values="0;1;0;0"/></rect>`;
  });
  writeFileSync(A("typing.svg"), svg(W, H, `<style>${F.m5()}${BASE}</style>`, groups));
}

// ───────────────────────── social buttons ─────────────────────────
const socials = [
  { id: "portfolio", label: "Portfolio", draw: (x, y) => GLYPH.globe(x, y, 18, C.indigo) },
  { id: "github", label: "GitHub", draw: (x, y) => icon("siGithub", x, y, 18) },
  { id: "linkedin", label: "LinkedIn", draw: (x, y) => GLYPH.linkedin(x, y, 18, "#0A66C2") },
  { id: "medium", label: "Medium", draw: (x, y) => icon("siMedium", x, y, 18) },
  { id: "instagram", label: "Instagram", draw: (x, y) => icon("siInstagram", x, y, 18) },
  { id: "email", label: "Email", draw: (x, y) => icon("siGmail", x, y, 18) },
];
socials.forEach((s, i) => {
  const W = 20 + 18 + 10 + s.label.length * 8.6 + 20, H = 44;
  const defs = `<linearGradient id="sh" x1="0" x2="1"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="r"><rect width="${W}" height="${H}" rx="12"/></clipPath>
  <style>${F.s6()}${BASE}.sh{animation:sh 6s ${i * 0.5}s ease-in-out infinite;transform:translateX(-90px)}@keyframes sh{0%{transform:translateX(-90px) skewX(-20deg)}35%,100%{transform:translateX(${W + 90}px) skewX(-20deg)}}
  .in{opacity:0;animation:in .6s ${0.1 + i * 0.12}s ease-out forwards}@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}</style>`;
  const body = `<g class="in"><g clip-path="url(#r)"><rect width="${W}" height="${H}" fill="#ffffff"/><rect y="${H - 3}" width="${W}" height="3" fill="${C.indigo}" fill-opacity=".08"/>
    <rect class="sh" width="70" height="${H}" fill="url(#sh)"/></g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="11.5" stroke="#d9dce8"/>
    ${s.draw(20, 13)}
    <text x="48" y="27.5" font-size="15" font-weight="600" fill="${C.ink}">${s.label}</text></g>`;
  writeFileSync(A(`social/${s.id}.svg`), svg(Math.ceil(W), H, defs, body));
});

// ───────────────────────── about (code editor card) ─────────────────────────
{
  const W = 860, H = 430;
  const k = (t) => `<tspan fill="#7c3aed">${esc(t)}</tspan>`, p = (t) => `<tspan fill="#0369a1">${esc(t)}</tspan>`,
    s = (t) => `<tspan fill="#047857">${esc(t)}</tspan>`, m = (t) => `<tspan fill="#6b7280">${esc(t)}</tspan>`,
    w = (t) => `<tspan fill="${C.ink}">${esc(t)}</tspan>`, o = (t) => `<tspan fill="#b45309">${esc(t)}</tspan>`;
  const arr = (...xs) => m("[") + xs.map((x) => s(`"${x}"`)).join(m(", ")) + m("]");
  const L = [
    [0, k("const ") + w("rahul") + m(": ") + p("Developer") + m(" = {")],
    [1, p("role") + m(": ") + s('"Software Engineer (SDE-1)"') + m(",")],
    [1, p("company") + m(": ") + s('"SwiffyLabs"') + m(",")],
    [1, p("building") + m(": ") + s('"Portfolio Generator"') + m(",")],
    [1, p("shipped") + m(": ") + arr("brainup.in", "calculatorhq.in") + m(",")],
    [1, p("stack") + m(": ") + arr("React", "Next.js", "TypeScript", "Node.js") + m(",")],
    [1, p("workflow") + m(": ") + s('"agentic coding"') + m(",")],
    [1, p("learning") + m(": ") + arr("Java", "React Native") + m(",")],
    [1, p("motto") + m(": ") + o('"Progressing little by little"') + m(",")],
    [0, m("};")],
    [0, ""],
    [0, k("export default ") + w("rahul") + m(";")],
  ];
  let rows = "";
  L.forEach(([ind, t], i) => {
    const y = 96 + i * 25;
    rows += `<text x="30" y="${y}" class="mono ln">${i + 1}</text>
      <g class="l" style="animation-delay:${(0.3 + i * 0.22).toFixed(2)}s"><text x="${70 + ind * 26}" y="${y}" class="mono code">${t}</text></g>`;
  });
  const curY = 96 + (L.length - 1) * 25;
  const defs = `<style>${F.m4()}${F.s5()}${BASE}
  .ln{font-size:13px;fill:#b3b8c7}.code{font-size:15px}
  .l{opacity:0;animation:in .35s ease-out forwards}@keyframes in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
  .cur{animation:cb 1s steps(1) infinite}@keyframes cb{50%{opacity:0}}
  .hl{animation:hl 9s ease-in-out infinite}@keyframes hl{0%,100%{transform:translateY(0)}20%{transform:translateY(50px)}40%{transform:translateY(100px)}60%{transform:translateY(150px)}80%{transform:translateY(200px)}}</style>`;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="#ffffff" stroke="${C.line}"/>
  <path d="M.5 18.5a18 18 0 0 1 18-18h${W - 37}a18 18 0 0 1 18 18V46H.5z" fill="#f6f7fb"/><line x1="0" y1="46" x2="${W}" y2="46" stroke="${C.line}"/>
  <circle cx="26" cy="23" r="6" fill="#ff5f57"/><circle cx="46" cy="23" r="6" fill="#febc2e"/><circle cx="66" cy="23" r="6" fill="#28c840"/>
  <rect x="96" y="10" width="140" height="36" rx="8" fill="#ffffff" stroke="${C.line}"/><rect x="96" y="40" width="140" height="8" fill="#ffffff"/>
  <text x="114" y="33" class="mono" font-size="13" fill="${C.ink}">about-me.ts</text>
  <text x="${W - 24}" y="28" text-anchor="end" font-size="12" font-weight="500" fill="${C.muted}">TypeScript</text>
  <rect class="hl" x="1" y="${96 - 17 + 25}" width="${W - 2}" height="24" fill="${C.indigo}" fill-opacity=".05"/>
  ${rows}
  <rect class="cur" x="${70 + 22 * 9}" y="${curY - 15}" width="2" height="19" fill="${C.indigo}"/>
  <text x="30" y="${H - 18}" class="mono" font-size="12" fill="${C.muted}">● main   ✔ 0 errors   UTF-8   Ln ${L.length}</text>`;
  writeFileSync(A("about.svg"), svg(W, H, defs, body));
}

// ───────────────────────── skills ─────────────────────────
{
  const groups = [
    ["Frontend", [["React", "siReact"], ["Next.js", "siNextdotjs"], ["TypeScript", "siTypescript"], ["JavaScript", "siJavascript"], ["Redux", "siRedux"], ["Tailwind", "siTailwindcss"], ["HTML5", "siHtml5"], ["CSS", "siCss"]]],
    ["Backend & Cloud", [["Node.js", "siNodedotjs"], ["Express", "siExpress"], ["MongoDB", "siMongodb"], ["Google Cloud", "siGooglecloud"], ["Vercel", "siVercel"]]],
    ["Workflow", [["Agentic coding", "agent"], ["Git", "siGit"], ["GitHub", "siGithub"], ["Figma", "siFigma"]]],
    ["Learning", [["Java", "siOpenjdk"], ["React Native", "siReact"]]],
  ];
  const W = 900, TW = 160, TH = 46, GAP = 12, X0 = 186;
  let y = 30, body = "", n = 0;
  for (const [title, items] of groups) {
    body += `<text x="28" y="${y + 28}" font-size="13" font-weight="600" fill="${C.muted}" letter-spacing=".6">${esc(title.toUpperCase())}</text>`;
    items.forEach(([name, key], i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = X0 + col * (TW + GAP), yy = y + row * (TH + GAP);
      const special = key === "agent";
      const ic = special ? GLYPH.agent(x + 14, yy + 13, 20, C.indigo)
        : icon(key, x + 14, yy + 13, 20, ["000000", "0A0A0A", "181717"].includes(si[key].hex) ? C.ink : undefined);
      body += `<g class="t" style="animation-delay:${(0.08 * n++).toFixed(2)}s">
        <rect x="${x}" y="${yy}" width="${TW}" height="${TH}" rx="12" fill="${special ? "url(#ag)" : "#ffffff"}" stroke="${special ? "#a5b4fc" : C.line}"/>
        ${special ? `<rect class="pulse" x="${x}" y="${yy}" width="${TW}" height="${TH}" rx="12" stroke="${C.indigo}" stroke-opacity=".5"/>` : ""}
        ${ic}<text x="${x + 44}" y="${yy + 28.5}" font-size="14.5" font-weight="${special ? 600 : 500}" fill="${C.ink}">${name}</text></g>`;
    });
    y += Math.ceil(items.length / 4) * (TH + GAP) + 18;
    body += `<line x1="28" y1="${y - 9}" x2="${W - 28}" y2="${y - 9}" stroke="#eef0f6"/>`;
  }
  const H = y + 4;
  const defs = `<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef2ff"/><stop offset="1" stop-color="#fdf2f8"/></linearGradient>
  <style>${F.s5()}${F.s6()}${BASE}
  .t{opacity:0;animation:pop .5s cubic-bezier(.2,.9,.3,1.3) forwards}@keyframes pop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .pulse{animation:pu 2.2s ease-in-out infinite}@keyframes pu{50%{stroke-opacity:0}}</style>`;
  writeFileSync(A("skills.svg"), svg(W, H, defs, `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="#fcfcfe" stroke="${C.line}"/>${body}`));
}

// ───────────────────────── project cards ─────────────────────────
const wrap = (t, n) => { const out = []; let cur = ""; for (const w of t.split(" ")) { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); } out.push(cur); return out; };
const cardGlyph = {
  doc: (c) => `<g stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M42 36h11l7 7v17a2 2 0 0 1-2 2H42a2 2 0 0 1-2-2V38a2 2 0 0 1 2-2z"/><path d="M53 36v7h7M45 50h10M45 55h7"/></g>`,
  calc: (c) => `<g stroke="${c}" stroke-width="2" stroke-linecap="round"><rect x="41" y="35" width="18" height="26" rx="3"/><path d="M45 41h10"/></g><g fill="${c}"><circle cx="46" cy="48" r="1.6"/><circle cx="50" cy="48" r="1.6"/><circle cx="54" cy="48" r="1.6"/><circle cx="46" cy="54" r="1.6"/><circle cx="50" cy="54" r="1.6"/><circle cx="54" cy="54" r="1.6"/></g>`,
};
function card({ file, title, desc, tags, g1, g2, accent, glyph, status }) {
  const W = 430, H = 220;
  const d = wrap(desc, 48).map((l, i) => `<text x="28" y="${112 + i * 21}" font-size="14" fill="${C.body}">${esc(l)}</text>`).join("");
  let x = 28, pills = "";
  for (const t of tags) { const w = t.length * 7.2 + 24; pills += `<rect x="${x}" y="${H - 48}" width="${w}" height="26" rx="13" fill="#ffffff" fill-opacity=".75" stroke="${accent}" stroke-opacity=".3"/><text x="${x + 12}" y="${H - 30.5}" font-size="12" font-weight="600" fill="${C.ink}">${t}</text>`; x += w + 8; }
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/></linearGradient>
  <linearGradient id="sh" x1="0" x2="1"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="gl"><stop stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <style>${F.s4()}${F.s6()}${F.s8()}${BASE}
  .sh{animation:sh 6s ease-in-out infinite}@keyframes sh{0%{transform:translateX(-220px) skewX(-20deg)}55%,100%{transform:translateX(${W + 220}px) skewX(-20deg)}}
  .fl{animation:fl 7s ease-in-out infinite}@keyframes fl{50%{transform:translate(-40px,30px)}}
  .bob{animation:bob 3.2s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-4px)}}
  .bl{animation:bl 1.6s ease-in-out infinite}@keyframes bl{50%{opacity:.25}}
  .ar{animation:ar 2.4s ease-in-out infinite}@keyframes ar{50%{transform:translate(3px,-3px)}}</style>`;
  const body = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle class="fl" cx="${W - 60}" cy="30" r="150" fill="url(#gl)"/>
  <rect class="sh" width="150" height="${H}" fill="url(#sh)"/>
  <g class="bob"><rect x="28" y="26" width="44" height="44" rx="12" fill="#ffffff" stroke="${accent}" stroke-opacity=".35"/>${cardGlyph[glyph](accent)}</g>
  <text x="86" y="55" font-size="22" font-weight="800" letter-spacing="-.4" fill="${C.ink}">${esc(title)}</text>
  <g class="ar"><text x="${W - 28}" y="55" text-anchor="end" font-size="20" fill="${C.ink}">↗</text></g>
  ${d}${pills}
  <circle class="bl" cx="${W - 82}" cy="${H - 35}" r="4" fill="${C.green}"/><text x="${W - 28}" y="${H - 30.5}" text-anchor="end" font-size="12" font-weight="600" fill="${C.ink}">${status}</text>
  </g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" stroke="#0b1020" stroke-opacity=".08"/>`;
  writeFileSync(A(file), svg(W, H, defs, body));
}
card({ file: "card-brainup.svg", title: "brainup.in", desc: "Free resume builder for Indian job seekers — ATS-friendly templates, zero paywalls.", tags: ["Resumes", "Free"], g1: "#eef2ff", g2: "#e0f2fe", accent: C.indigo, glyph: "doc", status: "Live" });
card({ file: "card-calculatorhq.svg", title: "calculatorhq.in", desc: "A fast, no-clutter home for everyday calculators — finance, health, maths and more.", tags: ["Calculators", "Free"], g1: "#ecfdf5", g2: "#e0f2fe", accent: "#059669", glyph: "calc", status: "Live" });

// Wide "now building" card
{
  const W = 880, H = 230;
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="#fff7ed"/><stop offset=".55" stop-color="#fdf2f8"/><stop offset="1" stop-color="#f5f3ff"/></linearGradient>
  <linearGradient id="pb" x1="0" x2="1"><stop stop-color="#f97316"/><stop offset="1" stop-color="#db2777"/></linearGradient>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <style>${F.s4()}${F.s6()}${F.s8()}${F.m4()}${BASE}
  .bl{animation:bl 1.4s ease-in-out infinite}@keyframes bl{50%{opacity:.25}}
  .bar{animation:bar 5s ease-in-out infinite;transform-box:fill-box;transform-origin:left}@keyframes bar{0%{transform:scaleX(.15)}70%,100%{transform:scaleX(1)}}
  .sk{animation:sk 1.6s ease-in-out infinite}@keyframes sk{50%{opacity:.45}}
  .p1{opacity:0;animation:pin 6s ease-in-out infinite}.p2{opacity:0;animation:pin 6s .5s ease-in-out infinite}.p3{opacity:0;animation:pin 6s 1s ease-in-out infinite}
  @keyframes pin{0%{opacity:0;transform:translateY(8px)}15%,80%{opacity:1;transform:none}100%{opacity:0}}
  .cur{animation:cu 6s ease-in-out infinite}@keyframes cu{0%{transform:translate(0,0)}30%{transform:translate(-120px,30px)}60%{transform:translate(-40px,80px)}100%{transform:translate(0,0)}}</style>`;
  const mx = 540, my = 30;
  const body = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="28" y="28" width="120" height="28" rx="14" fill="#ffffff" stroke="#fdba74"/>
  <circle class="bl" cx="45" cy="42" r="4.5" fill="#f97316"/><text x="56" y="46.5" font-size="12.5" font-weight="600" fill="${C.ink}">Now building</text>
  <text x="28" y="98" font-size="28" font-weight="800" letter-spacing="-.8" fill="${C.ink}">Portfolio Generator</text>
  <text x="28" y="128" font-size="14.5" fill="${C.body}">Turn your experience and projects into a polished,</text>
  <text x="28" y="149" font-size="14.5" fill="${C.body}">shareable developer portfolio — in minutes.</text>
  <text x="28" y="186" class="mono" font-size="12" fill="${C.muted}">progress</text>
  <rect x="96" y="178" width="300" height="8" rx="4" fill="#ffffff" stroke="#f3d3c4"/>
  <rect class="bar" x="96" y="178" width="300" height="8" rx="4" fill="url(#pb)"/>
  <g transform="translate(${mx} ${my})">
    <rect width="312" height="172" rx="14" fill="#ffffff" stroke="#ece7f2"/>
    <rect width="312" height="26" rx="14" fill="#faf8fc"/><rect y="14" width="312" height="12" fill="#faf8fc"/>
    <circle cx="16" cy="13" r="4" fill="#ff5f57"/><circle cx="30" cy="13" r="4" fill="#febc2e"/><circle cx="44" cy="13" r="4" fill="#28c840"/>
    <rect x="70" y="7" width="172" height="12" rx="6" fill="#ffffff" stroke="#ece7f2"/><text x="156" y="16.5" text-anchor="middle" class="mono" font-size="8" fill="${C.muted}">you.dev</text>
    <circle class="sk" cx="34" cy="56" r="16" fill="#fed7aa"/>
    <rect class="sk" x="58" y="46" width="110" height="9" rx="4.5" fill="#0b1020" fill-opacity=".8"/>
    <rect class="sk" x="58" y="61" width="74" height="7" rx="3.5" fill="#0b1020" fill-opacity=".25"/>
    <g class="p1"><rect x="18" y="88" width="86" height="66" rx="9" fill="#eef2ff"/><rect x="28" y="136" width="50" height="6" rx="3" fill="#6366f1" fill-opacity=".6"/></g>
    <g class="p2"><rect x="113" y="88" width="86" height="66" rx="9" fill="#ecfdf5"/><rect x="123" y="136" width="44" height="6" rx="3" fill="#059669" fill-opacity=".6"/></g>
    <g class="p3"><rect x="208" y="88" width="86" height="66" rx="9" fill="#fdf2f8"/><rect x="218" y="136" width="56" height="6" rx="3" fill="#db2777" fill-opacity=".6"/></g>
    <g class="cur"><path d="M262 40l0 18 5-5 4 8 3-1.5-4-8 7 0z" fill="${C.ink}" stroke="#fff" stroke-width="1.2"/></g>
  </g></g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" stroke="#0b1020" stroke-opacity=".08"/>`;
  writeFileSync(A("card-portfolio-generator.svg"), svg(W, H, defs, body));
}

// ───────────────────────── divider & footer ─────────────────────────
writeFileSync(A("divider.svg"), svg(1200, 24,
  `<linearGradient id="g" x1="0" x2="1200" gradientUnits="userSpaceOnUse"><stop stop-color="${C.line}" stop-opacity="0"/><stop offset=".5" stop-color="#c7cbe0"/><stop offset="1" stop-color="${C.line}" stop-opacity="0"/></linearGradient>
  <style>.d{animation:run 5s cubic-bezier(.6,0,.4,1) infinite}@keyframes run{to{transform:translateX(1100px)}}</style>`,
  `<rect y="11.5" width="1200" height="1" fill="url(#g)"/><g class="d"><circle cx="50" cy="12" r="9" fill="${C.indigo}" fill-opacity=".12"/><circle cx="50" cy="12" r="3.5" fill="${C.indigo}"/></g>`));

{
  const wave = (y, a) => "M0 " + y + " " + Array.from({ length: 4 }, (_, k) => `C${k * 600 + 150} ${y - a} ${k * 600 + 450} ${y + a} ${k * 600 + 600} ${y}`).join(" ") + " V170 H0Z";
  writeFileSync(A("footer.svg"), svg(1200, 170,
    `<style>${F.s5()}${BASE}.a{animation:w 10s linear infinite}.b{animation:w 15s linear infinite reverse}@keyframes w{to{transform:translateX(-1200px)}}
    .t{opacity:0;animation:in 1.2s .3s ease-out forwards}@keyframes in{to{opacity:1}}</style>`,
    `<g class="b"><path d="${wave(108, 26)}" fill="#e0e7ff"/></g><g class="a"><path d="${wave(124, 18)}" fill="#c7d2fe" fill-opacity=".7"/></g>
     <text class="t" x="600" y="56" text-anchor="middle" font-size="18" font-weight="500" fill="${C.muted}">Thanks for stopping by — let's build something great</text>`));
}
console.log("built");
