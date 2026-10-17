// Builds the static animated SVGs in assets/. Run after editing content:
//   npm i && npm run build
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as si from "simple-icons";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = (f) => join(ROOT, "assets", f);
mkdirSync(A("social"), { recursive: true });

// ───────────────────────── design tokens (dark, soft pastel accents) ─────────────────────────
export const C = {
  bg: "#0b0b0f", surface: "#111116", raised: "#16161c", line: "#24242c", hair: "#1c1c23",
  ink: "#f4f4f6", body: "#c6c7cf", muted: "#8a8c97", faint: "#5d5f6a",
  lav: "#c4b5fd", sky: "#93c5fd", mint: "#86efac", peach: "#fdba74", rose: "#f9a8d4",
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
const EASE = "cubic-bezier(.22,.8,.24,1)";
const FADE = `.fx{opacity:0;animation:fx .9s ${EASE} forwards}@keyframes fx{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"><defs>${defs}</defs>${body}</svg>`;
const DARK_HEX = ["000000", "0A0A0A", "181717", "121212"];
const icon = (key, x, y, size, color) => {
  const ic = si[key];
  const fill = color ?? (DARK_HEX.includes(ic.hex.toUpperCase()) ? C.ink : "#" + ic.hex);
  return `<path transform="translate(${x} ${y}) scale(${size / 24})" d="${ic.path}" fill="${fill}"/>`;
};
const GLYPH = {
  linkedin: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 24})"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path d="M6.6 9.6h2.6V18H6.6zM7.9 5.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.9 9.6h2.5v1.2c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1V18h-2.6v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.7z" fill="#fff"/></g>`,
  globe: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c2.8 3 4 6.4 4 10s-1.2 7-4 10c-2.8-3-4-6.4-4-10s1.2-7 4-10z"/></g>`,
  agent: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="${c}"><path d="M12 1.5l2.2 6.3 6.3 2.2-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-2.2z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z" opacity=".65"/><path d="M5 16l.6 1.7 1.7.6-1.7.6L5 20.6l-.6-1.7-1.7-.6 1.7-.6z" opacity=".45"/></g>`,
};
// A 1px pastel sheen along the top edge — the signature "light gradient" detail
const sheen = (id, w, a = C.lav, b = C.sky) =>
  `<linearGradient id="${id}" x1="0" x2="${w}" gradientUnits="userSpaceOnUse"><stop stop-color="${a}" stop-opacity="0"/><stop offset=".3" stop-color="${a}" stop-opacity=".9"/><stop offset=".7" stop-color="${b}" stop-opacity=".9"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></linearGradient>`;
const frame = (w, h, r, sheenId) =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" stroke="${C.line}"/>` +
  (sheenId ? `<rect x="${r}" y="0" width="${w - 2 * r}" height="1" fill="url(#${sheenId})"/>` : "");

// ───────────────────────── header ─────────────────────────
{
  const W = 1200, H = 320;
  const defs = `
  <radialGradient id="g1"><stop stop-color="${C.lav}" stop-opacity=".26"/><stop offset="1" stop-color="${C.lav}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2"><stop stop-color="${C.sky}" stop-opacity=".2"/><stop offset="1" stop-color="${C.sky}" stop-opacity="0"/></radialGradient>
  <linearGradient id="ul" x1="82" x2="520" gradientUnits="userSpaceOnUse"><stop stop-color="${C.lav}"/><stop offset="1" stop-color="${C.sky}"/></linearGradient>
  ${sheen("sh", W)}
  <clipPath id="r"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <style>${F.s8()}${F.s5()}${F.m4()}${F.m5()}${BASE}${FADE}
  .d1{animation:d1 22s ease-in-out infinite}.d2{animation:d2 26s ease-in-out infinite}
  @keyframes d1{50%{transform:translate(160px,40px)}}@keyframes d2{50%{transform:translate(-180px,-30px)}}
  .blink{animation:bl 2s ease-in-out infinite}@keyframes bl{50%{opacity:.3}}
  .ul{stroke-dasharray:440;stroke-dashoffset:440;animation:draw 1.6s 1s ${EASE} forwards}@keyframes draw{to{stroke-dashoffset:0}}
  .orb{transform-origin:1010px 160px;animation:spin 24s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  </style>`;
  const body = `<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <circle class="d1" cx="220" cy="40" r="340" fill="url(#g1)"/>
  <circle class="d2" cx="1040" cy="300" r="320" fill="url(#g2)"/>
  <g class="fx" style="animation-delay:.1s">
    <rect x="80" y="58" width="222" height="32" rx="16" fill="${C.surface}" stroke="${C.line}"/>
    <circle class="blink" cx="100" cy="74" r="4.5" fill="${C.mint}"/>
    <text x="113" y="78.5" class="mono" font-size="13.5" font-weight="500" fill="${C.body}">SDE-1 @ SwiffyLabs</text>
  </g>
  <text class="fx" style="animation-delay:.25s" x="76" y="166" font-size="76" font-weight="800" letter-spacing="-3" fill="${C.ink}">Rahul Kumawat</text>
  <path class="ul" d="M82 186 H520" stroke="url(#ul)" stroke-width="2" stroke-linecap="round"/>
  <text class="fx" style="animation-delay:.5s" x="80" y="228" font-size="23" font-weight="500" fill="${C.body}">Software Engineer · Full-stack developer · Product builder</text>
  <text class="fx mono" style="animation-delay:.75s" x="81" y="270" font-size="14" fill="${C.muted}">React · Next.js · TypeScript · Node.js · Agentic coding</text>
  <g class="fx" style="animation-delay:.5s">
    <circle cx="1010" cy="160" r="96" stroke="${C.hair}"/>
    <circle cx="1010" cy="160" r="64" stroke="${C.line}" stroke-dasharray="2 6"/>
    <g class="orb"><circle cx="1010" cy="64" r="4" fill="${C.lav}"/><circle cx="1106" cy="160" r="3" fill="${C.sky}"/></g>
    <rect x="966" y="130" width="88" height="60" rx="14" fill="${C.surface}" stroke="${C.line}"/>
    <text x="1010" y="168" text-anchor="middle" font-size="24" font-weight="500" class="mono" fill="${C.ink}">&lt;/&gt;</text>
  </g></g>
  ${frame(W, H, 20, "sh")}`;
  writeFileSync(A("header.svg"), svg(W, H, defs, body));
}

// ───────────────────────── typing line ─────────────────────────
{
  const lines = [
    "SDE-1 at SwiffyLabs",
    "Building a portfolio generator",
    "Shipping brainup.in & calculatorhq.in",
    "Coding with AI agents, shipping faster",
    "Progressing little by little",
  ];
  const W = 820, H = 44, FS = 20, CW = FS * 0.6, SLOT = 4.4;
  const total = lines.length * SLOT;
  let groups = "";
  lines.forEach((t, i) => {
    const w = t.length * CW, x0 = (W - w) / 2;
    const vals = [], times = [];
    const t0 = i * SLOT, typeDur = Math.min(1.6, t.length * 0.055), hold = 1.9, eraseDur = 0.5;
    const push = (s, v) => { vals.push(v); times.push(Math.min(1, s / total).toFixed(4)); };
    push(0, 0);
    if (t0 > 0) push(t0, 0);
    for (let c = 1; c <= t.length; c++) push(t0 + (typeDur * c) / t.length, c * CW);
    push(t0 + typeDur + hold, w);
    for (let c = t.length - 1; c >= 0; c -= 3) push(t0 + typeDur + hold + (eraseDur * (t.length - c)) / t.length, c * CW);
    push(t0 + typeDur + hold + eraseDur, 0);
    push(total, 0);
    const V = [], T = [];
    times.forEach((tt, k) => { if (!T.length || tt > T[T.length - 1]) { T.push(tt); V.push(vals[k]); } });
    T[T.length - 1] = "1";
    const anim = (attr, map) => `<animate attributeName="${attr}" dur="${total}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${T.join(";")}" values="${V.map(map).join(";")}"/>`;
    groups += `<clipPath id="c${i}"><rect x="${x0}" y="0" height="${H}" width="0">${anim("width", (v) => v.toFixed(1))}</rect></clipPath>
      <text clip-path="url(#c${i})" x="${x0}" y="28" font-size="${FS}" class="mono" font-weight="500" fill="${C.lav}">${esc(t)}</text>
      <rect y="11" width="2" height="22" rx="1" fill="${C.ink}" x="${x0}" opacity="0">${anim("x", (v) => (x0 + v + 2).toFixed(1))}<animate attributeName="opacity" dur="${total}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${((i * SLOT) / total).toFixed(4)};${(((i + 1) * SLOT) / total).toFixed(4)};1" values="0;1;0;0"/></rect>`;
  });
  writeFileSync(A("typing.svg"), svg(W, H, `<style>${F.m5()}${BASE}</style>`, groups));
}

// ───────────────────────── social buttons ─────────────────────────
const socials = [
  { id: "portfolio", label: "Portfolio", draw: (x, y) => GLYPH.globe(x, y, 17, C.lav) },
  { id: "github", label: "GitHub", draw: (x, y) => icon("siGithub", x, y, 17) },
  { id: "linkedin", label: "LinkedIn", draw: (x, y) => GLYPH.linkedin(x, y, 17) },
  { id: "medium", label: "Medium", draw: (x, y) => icon("siMedium", x, y, 17) },
  { id: "instagram", label: "Instagram", draw: (x, y) => icon("siInstagram", x, y, 17) },
  { id: "email", label: "Email", draw: (x, y) => icon("siGmail", x, y, 17) },
];
socials.forEach((s, i) => {
  const W = Math.ceil(18 + 17 + 10 + s.label.length * 8.2 + 18), H = 42;
  const defs = `${sheen("sh", W)}<style>${F.s5()}${BASE}${FADE}</style>`;
  const body = `<g class="fx" style="animation-delay:${(0.1 + i * 0.08).toFixed(2)}s">
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="${C.surface}" stroke="${C.line}"/>
    <rect x="12" y="0" width="${W - 24}" height="1" fill="url(#sh)" opacity=".6"/>
    ${s.draw(18, 12.5)}
    <text x="45" y="26" font-size="14.5" font-weight="500" fill="${C.ink}">${s.label}</text></g>`;
  writeFileSync(A(`social/${s.id}.svg`), svg(W, H, defs, body));
});

// ───────────────────────── about (code editor card) ─────────────────────────
{
  const W = 860, H = 420;
  const k = (t) => `<tspan fill="${C.lav}">${esc(t)}</tspan>`, p = (t) => `<tspan fill="${C.sky}">${esc(t)}</tspan>`,
    s = (t) => `<tspan fill="${C.mint}">${esc(t)}</tspan>`, m = (t) => `<tspan fill="${C.faint}">${esc(t)}</tspan>`,
    w = (t) => `<tspan fill="${C.ink}">${esc(t)}</tspan>`, o = (t) => `<tspan fill="${C.peach}">${esc(t)}</tspan>`;
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
    const y = 92 + i * 25;
    rows += `<text x="28" y="${y}" class="mono" font-size="13" fill="${C.faint}">${String(i + 1).padStart(2, " ")}</text>
      <g class="fx" style="animation-delay:${(0.25 + i * 0.16).toFixed(2)}s"><text x="${68 + ind * 26}" y="${y}" class="mono" font-size="15">${t}</text></g>`;
  });
  const curY = 92 + (L.length - 1) * 25;
  const defs = `${sheen("sh", W)}<style>${F.m4()}${F.s5()}${BASE}${FADE}
  .cur{animation:cb 1.1s steps(1) infinite}@keyframes cb{50%{opacity:0}}</style>`;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="${C.bg}"/>
  <path d="M.5 18a17.5 17.5 0 0 1 17.5-17.5h${W - 36}A17.5 17.5 0 0 1 ${W - 0.5} 18v26H.5z" fill="${C.surface}"/>
  <line x1="0" y1="44.5" x2="${W}" y2="44.5" stroke="${C.line}"/>
  <circle cx="24" cy="22" r="5.5" fill="#3a3a44"/><circle cx="42" cy="22" r="5.5" fill="#3a3a44"/><circle cx="60" cy="22" r="5.5" fill="#3a3a44"/>
  <text x="${W / 2}" y="27" text-anchor="middle" class="mono" font-size="12.5" fill="${C.muted}">about-me.ts</text>
  ${rows}
  <rect class="cur" x="${68 + 15 * 0.6 * 22}" y="${curY - 14}" width="2" height="18" fill="${C.lav}"/>
  <line x1="0" y1="${H - 38.5}" x2="${W}" y2="${H - 38.5}" stroke="${C.hair}"/>
  <text x="28" y="${H - 15}" class="mono" font-size="12" fill="${C.faint}">main   ·   0 problems   ·   TypeScript   ·   UTF-8</text>
  ${frame(W, H, 18, "sh")}`;
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
  const W = 900, TW = 160, TH = 44, GAP = 12, X0 = 186;
  let y = 28, body = "", n = 0;
  for (const [gi, [title, items]] of groups.entries()) {
    body += `<text x="28" y="${y + 27}" font-size="12" font-weight="600" fill="${C.muted}" letter-spacing="1">${esc(title.toUpperCase())}</text>`;
    items.forEach(([name, key], i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = X0 + col * (TW + GAP), yy = y + row * (TH + GAP);
      const special = key === "agent";
      const ic = special ? GLYPH.agent(x + 14, yy + 12, 20, C.lav) : icon(key, x + 14, yy + 12, 20);
      body += `<g class="fx" style="animation-delay:${(0.05 * n++).toFixed(2)}s">
        <rect x="${x + 0.5}" y="${yy + 0.5}" width="${TW - 1}" height="${TH - 1}" rx="10.5" fill="${special ? "url(#ag)" : C.surface}" stroke="${special ? C.lav : C.line}" stroke-opacity="${special ? 0.45 : 1}"/>
        ${ic}<text x="${x + 44}" y="${yy + 27}" font-size="14" font-weight="500" fill="${C.ink}">${name}</text></g>`;
    });
    y += Math.ceil(items.length / 4) * (TH + GAP) + 18;
    if (gi < groups.length - 1) body += `<line x1="28" y1="${y - 9.5}" x2="${W - 28}" y2="${y - 9.5}" stroke="${C.hair}"/>`;
  }
  const H = y + 6;
  const defs = `<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${C.lav}" stop-opacity=".16"/><stop offset="1" stop-color="${C.sky}" stop-opacity=".08"/></linearGradient>
  ${sheen("sh", W)}<style>${F.s5()}${F.s6()}${BASE}${FADE}</style>`;
  writeFileSync(A("skills.svg"), svg(W, H, defs, `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="${C.bg}"/>${body}${frame(W, H, 18, "sh")}`));
}

// ───────────────────────── project cards ─────────────────────────
const wrap = (t, n) => { const out = []; let cur = ""; for (const w of t.split(" ")) { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); } out.push(cur); return out; };
const cardGlyph = {
  doc: (c) => `<g stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M42 36h11l7 7v17a2 2 0 0 1-2 2H42a2 2 0 0 1-2-2V38a2 2 0 0 1 2-2z"/><path d="M53 36v7h7M45 50h10M45 55h7"/></g>`,
  calc: (c) => `<g stroke="${c}" stroke-width="1.8" stroke-linecap="round"><rect x="41" y="35" width="18" height="26" rx="3"/><path d="M45 41h10"/></g><g fill="${c}"><circle cx="46" cy="48" r="1.5"/><circle cx="50" cy="48" r="1.5"/><circle cx="54" cy="48" r="1.5"/><circle cx="46" cy="54" r="1.5"/><circle cx="50" cy="54" r="1.5"/><circle cx="54" cy="54" r="1.5"/></g>`,
};
function card({ file, title, desc, tags, a, b, glyph, status }) {
  const W = 430, H = 214;
  const d = wrap(desc, 48).map((l, i) => `<text x="28" y="${110 + i * 21}" font-size="14" fill="${C.body}">${esc(l)}</text>`).join("");
  let x = 28, pills = "";
  for (const t of tags) { const w = t.length * 7 + 22; pills += `<rect x="${x + 0.5}" y="${H - 47.5}" width="${w}" height="25" rx="12.5" fill="${C.raised}" stroke="${C.line}"/><text x="${x + 11.5}" y="${H - 30.5}" font-size="12" font-weight="500" fill="${C.body}">${t}</text>`; x += w + 8; }
  const defs = `<linearGradient id="wash" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${a}" stop-opacity=".16"/><stop offset=".55" stop-color="${b}" stop-opacity=".05"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></linearGradient>
  <radialGradient id="glow"><stop stop-color="${a}" stop-opacity=".2"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
  ${sheen("sh", W, a, b)}<clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <style>${F.s4()}${F.s5()}${F.s8()}${BASE}${FADE}
  .gl{animation:gl 9s ease-in-out infinite}@keyframes gl{50%{transform:translate(-50px,30px)}}
  .bl{animation:bl 2s ease-in-out infinite}@keyframes bl{50%{opacity:.3}}
  .ar{animation:ar 3s ${EASE} infinite}@keyframes ar{0%,60%,100%{transform:none}30%{transform:translate(3px,-3px)}}</style>`;
  const body = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${C.surface}"/><rect width="${W}" height="${H}" fill="url(#wash)"/>
  <circle class="gl" cx="${W - 40}" cy="10" r="160" fill="url(#glow)"/></g>
  <g class="fx">
  <rect x="28.5" y="26.5" width="43" height="43" rx="11.5" fill="${C.bg}" stroke="${C.line}"/>${cardGlyph[glyph](a)}
  <text x="86" y="55" font-size="21" font-weight="800" letter-spacing="-.5" fill="${C.ink}">${esc(title)}</text>
  <g class="ar"><text x="${W - 28}" y="55" text-anchor="end" font-size="18" fill="${C.muted}">↗</text></g>
  ${d}${pills}
  <circle class="bl" cx="${W - 70}" cy="${H - 35}" r="4" fill="${C.mint}"/><text x="${W - 28}" y="${H - 30.5}" text-anchor="end" font-size="12" font-weight="500" fill="${C.body}">${status}</text></g>
  ${frame(W, H, 18, "sh")}`;
  writeFileSync(A(file), svg(W, H, defs, body));
}
card({ file: "card-brainup.svg", title: "brainup.in", desc: "Free resume builder for Indian job seekers — ATS-friendly templates, zero paywalls.", tags: ["Resumes", "Free"], a: C.lav, b: C.sky, glyph: "doc", status: "Live" });
card({ file: "card-calculatorhq.svg", title: "calculatorhq.in", desc: "A fast, no-clutter home for everyday calculators — finance, health, maths and more.", tags: ["Calculators", "Free"], a: C.mint, b: C.sky, glyph: "calc", status: "Live" });

// Wide "now building" card
{
  const W = 880, H = 226;
  const defs = `<linearGradient id="wash" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${C.peach}" stop-opacity=".14"/><stop offset=".5" stop-color="${C.rose}" stop-opacity=".07"/><stop offset="1" stop-color="${C.lav}" stop-opacity=".1"/></linearGradient>
  <linearGradient id="pb" x1="0" x2="1"><stop stop-color="${C.peach}"/><stop offset="1" stop-color="${C.rose}"/></linearGradient>
  ${sheen("sh", W, C.peach, C.lav)}<clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <style>${F.s4()}${F.s5()}${F.s8()}${F.m4()}${BASE}${FADE}
  .bl{animation:bl 1.8s ease-in-out infinite}@keyframes bl{50%{opacity:.3}}
  .bar{animation:bar 6s ${EASE} infinite;transform-box:fill-box;transform-origin:left}@keyframes bar{0%{transform:scaleX(.12)}70%,100%{transform:scaleX(1)}}
  .sk{animation:sk 2s ease-in-out infinite}@keyframes sk{50%{opacity:.5}}
  .t1,.t2,.t3{opacity:0;animation:tin 6s ${EASE} infinite}.t2{animation-delay:.4s}.t3{animation-delay:.8s}
  @keyframes tin{0%{opacity:0;transform:translateY(6px)}15%,82%{opacity:1;transform:none}100%{opacity:0}}
  .cur{animation:cu 6s ${EASE} infinite}@keyframes cu{0%,100%{transform:none}35%{transform:translate(-120px,32px)}65%{transform:translate(-40px,78px)}}</style>`;
  const body = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${C.surface}"/><rect width="${W}" height="${H}" fill="url(#wash)"/></g>
  <g class="fx">
  <rect x="28.5" y="28.5" width="123" height="27" rx="13.5" fill="${C.bg}" stroke="${C.line}"/>
  <circle class="bl" cx="44" cy="42" r="4" fill="${C.peach}"/><text x="55" y="46.5" font-size="12.5" font-weight="500" fill="${C.body}">Now building</text>
  <text x="28" y="98" font-size="28" font-weight="800" letter-spacing="-.9" fill="${C.ink}">Portfolio Generator</text>
  <text x="28" y="128" font-size="14.5" fill="${C.body}">Turn your experience and projects into a polished,</text>
  <text x="28" y="149" font-size="14.5" fill="${C.body}">shareable developer portfolio — in minutes.</text>
  <text x="28" y="186" class="mono" font-size="12" fill="${C.muted}">progress</text>
  <rect x="96" y="179" width="300" height="6" rx="3" fill="${C.raised}"/>
  <rect class="bar" x="96" y="179" width="300" height="6" rx="3" fill="url(#pb)"/>
  </g>
  <g class="fx" style="animation-delay:.2s"><g transform="translate(540 28)">
    <rect x=".5" y=".5" width="311" height="169" rx="12.5" fill="${C.bg}" stroke="${C.line}"/>
    <line x1="0" y1="24.5" x2="312" y2="24.5" stroke="${C.line}"/>
    <circle cx="15" cy="12.5" r="3.5" fill="#3a3a44"/><circle cx="27" cy="12.5" r="3.5" fill="#3a3a44"/><circle cx="39" cy="12.5" r="3.5" fill="#3a3a44"/>
    <rect x="80.5" y="6.5" width="151" height="12" rx="6" fill="${C.surface}" stroke="${C.line}"/><text x="156" y="15.5" text-anchor="middle" class="mono" font-size="8" fill="${C.muted}">you.dev</text>
    <circle class="sk" cx="34" cy="54" r="15" fill="${C.peach}" fill-opacity=".55"/>
    <rect class="sk" x="58" y="45" width="110" height="8" rx="4" fill="${C.ink}" fill-opacity=".85"/>
    <rect class="sk" x="58" y="59" width="74" height="6" rx="3" fill="${C.ink}" fill-opacity=".25"/>
    <g class="t1"><rect x="18" y="86" width="86" height="66" rx="8" fill="${C.lav}" fill-opacity=".12" stroke="${C.lav}" stroke-opacity=".25"/><rect x="28" y="135" width="48" height="5" rx="2.5" fill="${C.lav}" fill-opacity=".7"/></g>
    <g class="t2"><rect x="113" y="86" width="86" height="66" rx="8" fill="${C.mint}" fill-opacity=".1" stroke="${C.mint}" stroke-opacity=".25"/><rect x="123" y="135" width="42" height="5" rx="2.5" fill="${C.mint}" fill-opacity=".7"/></g>
    <g class="t3"><rect x="208" y="86" width="86" height="66" rx="8" fill="${C.rose}" fill-opacity=".1" stroke="${C.rose}" stroke-opacity=".25"/><rect x="218" y="135" width="54" height="5" rx="2.5" fill="${C.rose}" fill-opacity=".7"/></g>
    <g class="cur"><path d="M262 40v17l4.6-4.6 3.7 7.6 2.8-1.4-3.7-7.5h6.6z" fill="${C.ink}" stroke="${C.bg}" stroke-width="1.2"/></g>
  </g></g>
  ${frame(W, H, 18, "sh")}`;
  writeFileSync(A("card-portfolio-generator.svg"), svg(W, H, defs, body));
}

// ───────────────────────── divider & footer ─────────────────────────
writeFileSync(A("divider.svg"), svg(1200, 20,
  `${sheen("g", 1200)}<style>.d{animation:run 7s ${EASE} infinite}@keyframes run{0%{transform:translateX(0);opacity:0}10%,90%{opacity:1}100%{transform:translateX(1100px);opacity:0}}</style>`,
  `<rect y="9.5" width="1200" height="1" fill="url(#g)" opacity=".35"/><g class="d"><circle cx="50" cy="10" r="7" fill="${C.lav}" fill-opacity=".15"/><circle cx="50" cy="10" r="2.5" fill="${C.lav}"/></g>`));

{
  const W = 1200, H = 120;
  writeFileSync(A("footer.svg"), svg(W, H,
    `${sheen("g", W)}<radialGradient id="gl"><stop stop-color="${C.lav}" stop-opacity=".18"/><stop offset="1" stop-color="${C.lav}" stop-opacity="0"/></radialGradient>
    <style>${F.s5()}${BASE}${FADE}.p{animation:p 6s ease-in-out infinite}@keyframes p{50%{opacity:.5}}</style>`,
    `<ellipse class="p" cx="600" cy="120" rx="420" ry="70" fill="url(#gl)"/>
     <rect x="200" y="96" width="800" height="1" fill="url(#g)" opacity=".7"/>
     <text class="fx" x="600" y="56" text-anchor="middle" font-size="17" font-weight="500" fill="${C.muted}">Thanks for stopping by — let's build something great</text>`));
}
console.log("built");
