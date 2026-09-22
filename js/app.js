/* Spectroton — Anwendung.
   Am 14.09.2026 unveraendert aus index.html herausgeloest. Laeuft wie zuvor
   am Ende des Body, also mit fertigem DOM. Kein Inhalt geaendert. */
"use strict";

/* ---------- Farbmathematik: sRGB ⇄ Oklab ⇄ OKLCH, ohne Bibliothek ---------- */

const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

function srgbToLin(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255
  };
}

function rgbToHex({ r, g, b }) {
  const h = v => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0");
  return "#" + (h(r) + h(g) + h(b)).toUpperCase();
}

function linRgbToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  };
}

function oklabToLinRgb(L, a, bb) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bb;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  };
}

function hexToOklch(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { L, a, b } = linRgbToOklab(srgbToLin(rgb.r), srgbToLin(rgb.g), srgbToLin(rgb.b));
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/* Rohes lineares sRGB für ein OKLCH-Tripel */
function oklchToLinRgb(L, C, H) {
  const rad = H * Math.PI / 180;
  return oklabToLinRgb(L, C * Math.cos(rad), C * Math.sin(rad));
}

const EPS = 1e-4;
const inRange = v => v >= -EPS && v <= 1 + EPS;

function inSrgb(L, C, H) {
  const { r, g, b } = oklchToLinRgb(L, C, H);
  return inRange(r) && inRange(g) && inRange(b);
}

/* Display-P3-Prüfung: linear sRGB → XYZ(D65) → linear P3 */
function inP3(L, C, H) {
  const { r, g, b } = oklchToLinRgb(L, C, H);
  const X = 0.4123907993 * r + 0.3575843394 * g + 0.1804807884 * b;
  const Y = 0.2126390059 * r + 0.7151686788 * g + 0.0721923154 * b;
  const Z = 0.0193308187 * r + 0.1191947798 * g + 0.9505321522 * b;
  const pr = 2.4934969119 * X - 0.9313836179 * Y - 0.4027107845 * Z;
  const pg = -0.8294889696 * X + 1.7626640603 * Y + 0.0236246858 * Z;
  const pb = 0.0358458302 * X - 0.0761723893 * Y + 0.9568845240 * Z;
  return inRange(pr) && inRange(pg) && inRange(pb);
}

/* Gamut-Mapping: Chroma per Bisektion senken, Lightness und Hue bleiben stehen.
   Nie hart clippen — das würde den Farbton verziehen. */
function clampChroma(L, C, H) {
  if (inSrgb(L, C, H)) return C;
  let lo = 0, hi = C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgb(L, mid, H)) lo = mid; else hi = mid;
  }
  return lo;
}

function oklchToHex(L, C, H) {
  const lin = oklchToLinRgb(L, C, H);
  return rgbToHex({
    r: linToSrgb(clamp01(lin.r)),
    g: linToSrgb(clamp01(lin.g)),
    b: linToSrgb(clamp01(lin.b))
  });
}

/* WCAG 2.2 Kontrastverhältnis */
function relLum(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function contrast(hexA, hexB) {
  const a = relLum(hexA), b = relLum(hexB);
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/* APCA-W3 (SAPC-4g, Konstanten 0.1.9). Nicht normativ — Entwurf für WCAG 3.
   Liefert Lc: positiv = dunkler Text auf hellem Grund, negativ = heller Text auf dunklem.
   Anders als WCAG ist APCA nicht symmetrisch: Text- und Hintergrundrolle zählen. */
function apcaY(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126729 * Math.pow(r, 2.4) + 0.7151522 * Math.pow(g, 2.4) + 0.0721750 * Math.pow(b, 2.4);
}
function apca(textHex, bgHex) {
  const soft = y => y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;
  const yt = soft(apcaY(textHex)), yb = soft(apcaY(bgHex));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  const sapc = yb > yt
    ? (Math.pow(yb, 0.56) - Math.pow(yt, 0.57)) * 1.14
    : (Math.pow(yb, 0.65) - Math.pow(yt, 0.62)) * 1.14;
  if (Math.abs(sapc) < 0.1) return 0;
  return sapc > 0 ? (sapc - 0.027) * 100 : (sapc + 0.027) * 100;
}

/* ---------- Rampe ---------- */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const state = {
  colors: [{ hex: "#3B82F6", H: 0, locks: {} }],
  lmax: 0.97, lmin: 0.21, cmax: 0.16, hshift: 0, fmt: "css",
  contrastMode: "wcag"
};

/* ---------- Akzentfarben: Harmonie-Vorschläge in OKLCH-Hue-Raum ---------- */

const HARMONIES = {
  comp:   { labelKey: "harmComp",   offsets: [180] },
  triad:  { labelKey: "harmTriad",  offsets: [120, 240] },
  analog: { labelKey: "harmAnalog", offsets: [30, -30] },
  split:  { labelKey: "harmSplit",  offsets: [150, 210] }
};

function angleDist(a, b) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

/* Nächster freier Punkt für eine Harmonie, relativ zur Primärfarbe.
   Sind alle Standardpunkte schon belegt, wird leicht nachjustiert statt zu duplizieren. */
function nextHarmonyHue(kind) {
  const base = state.colors[0].H;
  const { offsets } = HARMONIES[kind];
  const existing = state.colors.slice(1).map(c => c.H);
  for (const off of offsets) {
    const h = (base + off + 360) % 360;
    if (!existing.some(e => angleDist(e, h) < 8)) return h;
  }
  const jitter = existing.length * 17;
  return (base + offsets[0] + jitter + 360) % 360;
}

function addAccent(H) {
  const C = clampChroma(0.62, Math.max(state.cmax, 0.08), H);
  const hex = oklchToHex(0.62, C, H);
  state.colors.push({ hex, H, locks: {} });
  render();
}

function removeAccent(i) {
  state.colors.splice(i, 1);
  render();
}

function editAccent(i, hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const norm = rgbToHex(rgb);
  const c = hexToOklch(norm);
  state.colors[i].hex = norm;
  state.colors[i].H = c.H;
  render();
}

function colorLabel(i) {
  return i === 0 ? i18n.t("labelPrimary") : i18n.fmt("labelAccent", { n: i });
}

/* Export-Namenssegment: bei nur einer Farbe bleibt der Name unverändert wie bisher,
   erst ab zwei Farben bekommt jede ihr eigenes Segment. */
function colorSlug(i, total) {
  if (total === 1) return null;
  return i === 0 ? "primary" : `accent-${i}`;
}

function buildRamp(color) {
  const n = STEPS.length;
  const locks = color.locks || {};
  const finish = s => {
    s.cw = contrast(s.hex, "#FFFFFF");
    s.cb = contrast(s.hex, "#000000");
    s.aw = apca(s.hex, "#FFFFFF");
    s.ab = apca(s.hex, "#000000");
    return s;
  };
  return STEPS.map((step, i) => {
    /* Gesperrte Stufe: eingefrorener HEX-Wert, unabhängig von Reglern und Basisfarbe */
    const frozen = locks[step];
    if (frozen) {
      const o = hexToOklch(frozen);
      return finish({ step, L: o.L, C: o.C, H: o.H, hex: frozen, clipped: false, p3only: false, locked: true });
    }

    const t = i / (n - 1);
    // Helligkeit: leicht gestauchte Kurve, damit die hellen Stufen enger beieinander liegen
    const L = state.lmax - (state.lmax - state.lmin) * Math.pow(t, 1.15);
    // Buntheit: Glocke mit Maximum in der Mitte, Enden bleiben bei 35 %
    const C = state.cmax * (0.35 + 0.65 * Math.sin(Math.PI * Math.pow(t, 0.9)));
    const H = (color.H + state.hshift * (t - 0.5) * 2 + 360) % 360;

    const wanted = C;
    const C2 = clampChroma(L, C, H);
    const clipped = wanted - C2 > 0.002;
    const p3only = clipped && inP3(L, wanted, H);

    const hex = oklchToHex(L, C2, H);
    return finish({ step, L, C: C2, H, hex, clipped, p3only, locked: false });
  });
}

/* ---------- Ausgabe ---------- */

const $ = id => document.getElementById(id);
const fmtNum = (v, d = 2) => v.toFixed(d);
const ok = (L, C, H) => `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(4)} ${H.toFixed(1)})`;
const FILE_NAMES = { css: "colors.css", tw: "tailwind.colors.js", json: "tokens.json", hex: "colors.txt" };

const LOCK_OPEN   = '<svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true"><rect x="1" y="6" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 6V4a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const LOCK_CLOSED = '<svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true"><rect x="1" y="6" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

function renderRamp(ramp, host, ci) {
  host.textContent = "";
  const apcaMode = state.contrastMode === "apca";
  ramp.forEach(s => {
    const onDark = s.cw >= s.cb;           // heller Text liest sich besser?
    const ink = onDark ? "#FFFFFF" : "#000000";
    const row = document.createElement("div");
    row.className = "row" + (s.locked ? " locked" : "");
    row.setAttribute("role", "button");
    row.tabIndex = 0;
    row.style.background = s.hex;
    row.style.color = ink;
    row.setAttribute("aria-label", i18n.fmt("ariaStepCopy", { step: s.step, hex: s.hex }));

    const v1 = apcaMode ? Math.round(Math.abs(s.aw)) : fmtNum(s.cw);
    const v2 = apcaMode ? Math.round(Math.abs(s.ab)) : fmtNum(s.cb);
    const f1 = apcaMode ? Math.abs(s.aw) < 30 : s.cw < 3;
    const f2 = apcaMode ? Math.abs(s.ab) < 30 : s.cb < 3;
    /* Schild an Stufen, deren Buntheit für sRGB gekappt wurde. Die Zeile ist
       role="button" mit eigenem aria-label, ihr Inhalt wird also nie vorgelesen —
       die Erklärung hängt deshalb per aria-describedby an der Zeile selbst. */
    let flag = "";
    if (s.clipped) {
      const key = s.p3only ? "flagP3" : "flagClipped";
      const desc = escapeHtml(i18n.t(key + "Desc"));
      const id = `flag-${ci}-${s.step}`;
      flag = `<span class="flag" title="${desc}" aria-hidden="true">${escapeHtml(i18n.t(key))}</span>` +
             `<span class="sr-only" id="${id}">${desc}</span>`;
      row.setAttribute("aria-describedby", id);
    }
    row.innerHTML =
      `<span class="step">${s.step}</span>` +
      `<span class="hex">${s.hex}${flag}</span>` +
      `<span class="cw ${f1 ? "fail" : ""}">${v1}</span>` +
      `<span class="cb ${f2 ? "fail" : ""}">${v2}</span>` +
      `<button type="button" class="lock" aria-pressed="${s.locked}" aria-label="${i18n.fmt(s.locked ? "ariaStepUnlock" : "ariaStepLock", { step: s.step })}">${s.locked ? LOCK_CLOSED : LOCK_OPEN}</button>`;

    const copy = () => copyText(s.hex, i18n.fmt("noteHexCopied", { hex: s.hex }));
    row.addEventListener("click", copy);
    row.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copy(); }
    });
    row.querySelector(".lock").addEventListener("click", e => {
      e.stopPropagation();
      toggleLock(ci, s.step);
    });
    host.appendChild(row);
  });
}

function toggleLock(ci, step) {
  const color = state.colors[ci];
  color.locks = color.locks || {};
  if (color.locks[step]) {
    delete color.locks[step];
    note(i18n.fmt("noteStepFree", { step: step }));
  } else {
    const s = buildRamp(color).find(x => x.step === step);
    color.locks[step] = s.hex;
    note(i18n.fmt("noteStepLock", { step: step }));
  }
  render();
}

function renderAccentChips() {
  const chips = $("accentChips");
  const accents = state.colors.slice(1);

  /* Gleiche Anzahl: nur Werte nachziehen, Elemente stehen lassen —
     sonst verliert ein gerade offener Farbwähler sein Input-Element. */
  if (chips.children.length === accents.length) {
    accents.forEach((c, idx) => {
      const input = chips.children[idx].querySelector("input");
      const v = c.hex.toLowerCase();
      if (input.value !== v) input.value = v;
    });
    return;
  }

  chips.textContent = "";
  accents.forEach((c, idx) => {
    const i = idx + 1;
    const wrap = document.createElement("div");
    wrap.className = "accent-chip";

    const input = document.createElement("input");
    input.type = "color";
    input.value = c.hex.toLowerCase();
    input.setAttribute("aria-label", i18n.fmt("ariaAccentColor", { n: i }));
    input.addEventListener("input", e => editAccent(i, e.target.value));

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "rm";
    rm.textContent = "×";
    rm.setAttribute("aria-label", i18n.fmt("ariaAccentRemove", { n: i }));
    rm.addEventListener("click", () => removeAccent(i));

    wrap.appendChild(input);
    wrap.appendChild(rm);
    chips.appendChild(wrap);
  });
}

function initHarmonyButtons() {
  const add = $("accentAdd");
  /* Leeren, bevor neu gebaut wird: beim Sprachwechsel laeuft das hier ein
     zweites Mal, sonst stuenden die alten Knoepfe daneben. */
  add.textContent = "";
  Object.entries(HARMONIES).forEach(([key, h]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "harmony-btn";
    b.textContent = i18n.t(h.labelKey);
    b.addEventListener("click", () => addAccent(nextHarmonyHue(key)));
    add.appendChild(b);
  });
}

/* Baut für jede Farbe der Palette eine eigene Rampen-Karte und liefert
   die Rohdaten gleich mit zurück, damit der Export sie weiterverwenden kann. */
function renderAllRamps() {
  const host = $("rampsHost");
  host.textContent = "";
  const results = [];
  state.colors.forEach((c, i) => {
    const ramp = buildRamp(c);
    results.push({ label: colorLabel(i), hex: c.hex, ramp });

    const section = document.createElement("section");
    section.className = "card";
    section.innerHTML =
      `<h2>${colorLabel(i)} · ${c.hex}</h2>` +
      `<div class="ramp-head"><span>${i18n.t("rampStep")}</span><span>${i18n.t("rampColor")}</span><span>${i18n.t("rampWhite")}</span><span>${i18n.t("rampBlack")}</span><span></span></div>` +
      `<div class="ramp"></div>` +
      rampLegend(ramp);
    renderRamp(ramp, section.querySelector(".ramp"), i);
    host.appendChild(section);
  });
  return results;
}

/* Legende unter der Rampe: nennt nur die Schilder, die in dieser Rampe vorkommen.
   Gedacht für Touch-Geräte, wo das title am Schild nie erscheint — mit Maus
   blendet das CSS sie aus. */
function rampLegend(ramp) {
  const clipped = ramp.some(s => s.clipped && !s.p3only);
  const p3 = ramp.some(s => s.p3only);
  if (!clipped && !p3) return "";
  const item = (flagKey, textKey) =>
    `<p class="legend-item"><span class="flag">${escapeHtml(i18n.t(flagKey))}</span> <span>${escapeHtml(i18n.t(textKey))}</span></p>`;
  return `<div class="ramp-legend"><p>${escapeHtml(i18n.t("legendLead"))}</p>` +
    (clipped ? item("flagClipped", "legendClipped") : "") +
    (p3 ? item("flagP3", "legendP3") : "") +
    `</div>`;
}

function exportText(results) {
  const p = ($("prefix").value.trim() || "brand").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const total = results.length;

  if (state.fmt === "css") {
    const fb = [], ok2 = [];
    results.forEach((r, i) => {
      const slug = colorSlug(i, total);
      const seg = slug ? `${p}-${slug}` : p;
      r.ramp.forEach(s => {
        fb.push(`  --${seg}-${s.step}: ${s.hex};`);
        ok2.push(`    --${seg}-${s.step}: ${ok(s.L, s.C, s.H)};`);
      });
    });
    return `:root {\n${fb.join("\n")}\n}\n\n@supports (color: oklch(0% 0 0)) {\n  :root {\n${ok2.join("\n")}\n  }\n}\n`;
  }

  if (state.fmt === "tw") {
    const groups = results.map((r, i) => {
      const slug = colorSlug(i, total);
      const key = slug ? `${p}-${slug}` : p;
      const body = r.ramp.map(s => `          ${s.step}: "${s.hex}",`).join("\n");
      return `        "${key}": {\n${body}\n        },`;
    }).join("\n");
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${groups}\n      },\n    },\n  },\n};\n`;
  }

  if (state.fmt === "json") {
    const group = {};
    results.forEach((r, i) => {
      const slug = colorSlug(i, total);
      const target = slug ? (group[slug] = {}) : group;
      r.ramp.forEach(s => {
        target[s.step] = {
          $type: "color",
          $value: s.hex,
          $extensions: { "de.spectroton.oklch": ok(s.L, s.C, s.H) }
        };
      });
    });
    return JSON.stringify({ [p]: group }, null, 2) + "\n";
  }

  if (total === 1) return results[0].ramp.map(s => s.hex).join("\n") + "\n";
  return results.map(r => `# ${r.label} — ${r.hex}\n` + r.ramp.map(s => s.hex).join("\n")).join("\n\n") + "\n";
}

/* Aurora nutzt die echten Akzentfarben, sobald welche existieren;
   ohne Akzente greift der bisherige synthetische Versatz. */
function updateAurora() {
  const h0 = state.colors[0].H;
  const h1 = state.colors[1] ? state.colors[1].H : (h0 + 150) % 360;
  const h2 = state.colors[2] ? state.colors[2].H : (h0 + 30) % 360;
  const glow = (L, C, H) => oklchToHex(L, clampChroma(L, C, H), H);
  $("aurora1").style.background = glow(0.52, 0.13, h0);
  $("aurora2").style.background = glow(0.40, 0.13, h1);
  $("aurora3").style.background = glow(0.64, 0.10, h2);
}

function render() {
  renderAccentChips();
  const results = renderAllRamps();
  updateAurora();

  const primary = state.colors[0];
  const base = hexToOklch(primary.hex);
  const nearest = results[0].ramp.reduce((a, b) => Math.abs(b.L - base.L) < Math.abs(a.L - base.L) ? b : a);
  $("baseOut").textContent = i18n.fmt("baseReadout", { oklch: ok(base.L, base.C, base.H), step: nearest.step });

  $("lmaxV").textContent = Math.round(state.lmax * 100) + " %";
  $("lminV").textContent = Math.round(state.lmin * 100) + " %";
  $("cmaxV").textContent = state.cmax.toFixed(2);
  $("hshiftV").textContent = (state.hshift > 0 ? "+" : "") + state.hshift + "°";

  $("out").value = exportText(results);
  scheduleSave();
}

/* ---------- Eingaben ---------- */

function setBase(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const norm = rgbToHex(rgb);
  const c = hexToOklch(norm);
  state.colors[0].hex = norm;
  state.colors[0].H = c.H;
  state.cmax = Math.max(0.02, Math.min(0.37, Math.round(c.C * 100) / 100));
  $("cmax").value = Math.round(state.cmax * 100);
  $("swatch").value = norm.toLowerCase();
  return true;
}

$("swatch").addEventListener("input", e => {
  setBase(e.target.value);
  $("hexInput").value = state.colors[0].hex;
  render();
  scheduleLookup();
});

$("hexInput").addEventListener("input", e => {
  if (setBase(e.target.value)) { render(); scheduleLookup(); }
});
$("hexInput").addEventListener("blur", () => { $("hexInput").value = state.colors[0].hex; });

/* Slider feuern beim Ziehen viele Events pro Sekunde — auf einen Frame bündeln,
   sonst wird bei mehreren Rampen jedes Mal der komplette DOM neu gebaut. */
const raf = window.requestAnimationFrame ? cb => window.requestAnimationFrame(cb) : cb => setTimeout(cb, 16);
let renderPending = false;
function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  raf(() => { renderPending = false; render(); });
}

[["lmax", v => state.lmax = v / 100],
 ["lmin", v => state.lmin = v / 100],
 ["cmax", v => state.cmax = v / 100],
 ["hshift", v => state.hshift = v]].forEach(([id, fn]) => {
  $(id).addEventListener("input", e => { fn(Number(e.target.value)); scheduleRender(); });
});

$("prefix").addEventListener("input", () => scheduleRender());

document.querySelectorAll("#fmtTabs .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    state.fmt = tab.dataset.fmt;
    syncControls();
    render();
  });
});

document.querySelectorAll("#modeTabs .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    state.contrastMode = tab.dataset.mode;
    syncControls();
    render();
  });
});

/* ---------- Kopieren, Speichern, Teilen ---------- */

let noteTimer;
function note(msg) {
  const el = $("note");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => el.classList.remove("on"), 1600);
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    note(msg);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); note(msg); }
    catch { note(i18n.t("noteCopyBlocked")); }
    ta.remove();
  }
}

$("copy").addEventListener("click", () => copyText($("out").value, i18n.t("noteExportCopied")));

const mime = () => state.fmt === "json" ? "application/json"
  : state.fmt === "css" ? "text/css"
  : state.fmt === "tw" ? "text/javascript" : "text/plain";

$("save").addEventListener("click", async () => {
  const name = $("filename").value.trim() || "colors.txt";
  const text = $("out").value;
  const blob = new Blob([text], { type: mime() + ";charset=utf-8" });

  const canPick = "showSaveFilePicker" in window && (() => {
    try { return window.self === window.top; } catch { return false; }
  })();

  if (canPick) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: name });
      const w = await handle.createWritable();
      await w.write(blob);
      await w.close();
      note(i18n.fmt("noteWrittenTo", { file: handle.name }));
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
      // sonst: Fallback unten
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  note(i18n.t("noteDownloaded"));
});

/* Teilen nur zeigen, wenn das Gerät Dateien wirklich teilen kann */
(function initShare() {
  const probe = new File(["x"], "x.txt", { type: "text/plain" });
  if (navigator.canShare && navigator.canShare({ files: [probe] })) {
    const btn = $("share");
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      const name = $("filename").value.trim() || "colors.txt";
      const file = new File([$("out").value], name, { type: mime() });
      try { await navigator.share({ files: [file], title: name }); }
      catch (e) { if (!e || e.name !== "AbortError") note(i18n.t("noteShareFailed")); }
    });
  }
})();

/* Fußzeile: was diese Umgebung tatsächlich kann.
   Benannt statt sofort ausgefuehrt, damit der Sprachwechsel sie erneut aufrufen kann. */
function envLine() {
  const bits = [];
  bits.push(i18n.t("showSaveFilePicker" in window ? "envSaveYes" : "envSaveNo"));
  bits.push(i18n.t(window.matchMedia("(color-gamut: p3)").matches ? "envGamutP3" : "envGamutSrgb"));
  /* Die Zeichensetzung steckt im Rahmen, nicht im Code: Japanisch und
     Chinesisch setzen einen anderen Schlusspunkt als die uebrigen. */
  $("env").textContent = i18n.fmt("envLine", { save: bits[0], gamut: bits[1] });
}
envLine();

/* ---------- Farbnamen über api.color.pizza ---------- */

const API = "https://api.color.pizza/v1";

function listName() { return $("nameList").value; }

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* Wie heißt die aktuelle Basisfarbe? */
async function lookupName() {
  const out = $("nameOut");
  const hex = state.colors[0].hex.slice(1).toLowerCase();
  out.textContent = i18n.t("nameSearching");
  try {
    const r = await fetch(`${API}/?values=${hex}&list=${listName()}`);
    const d = await r.json();
    const c = d.colors && d.colors[0];
    if (!c) { out.textContent = i18n.t("nameNone"); return; }
    const exact = c.hex.toLowerCase() === "#" + hex;
    out.textContent = exact
      ? i18n.fmt("nameExact", { name: c.name })
      : i18n.fmt("nameNearest", { name: c.name, hex: c.hex.toUpperCase() });
  } catch {
    out.textContent = i18n.t("nameOffline");
  }
}

/* Name eingetippt → passende Farben anbieten */
async function searchName(q) {
  const hits = $("hits");
  if (!q.trim()) { hits.textContent = ""; return; }
  try {
    const r = await fetch(`${API}/names/?name=${encodeURIComponent(q)}&list=${listName()}&maxResults=8`);
    const d = await r.json();
    hits.textContent = "";
    if (!d.colors || !d.colors.length) {
      const p = document.createElement("span");
      p.className = "readout";
      p.textContent = i18n.t("nameNothingFound");
      hits.appendChild(p);
      return;
    }
    d.colors.forEach(c => {
      const b = document.createElement("button");
      b.className = "hit";
      b.type = "button";
      b.innerHTML = `<span class="dot" style="background:${c.hex}"></span><span>${c.name}</span><span class="code">${c.hex.toUpperCase()}</span>`;
      b.addEventListener("click", () => {
        setBase(c.hex);
        $("hexInput").value = state.colors[0].hex;
        render();
        note(i18n.fmt("noteNameTaken", { name: c.name }));
        lookupName();
      });
      hits.appendChild(b);
    });
  } catch {
    hits.textContent = "";
    const p = document.createElement("span");
    p.className = "readout";
    p.textContent = i18n.t("nameSearchOffline");
    hits.appendChild(p);
  }
}

const scheduleLookup = debounce(lookupName, 450);

$("nameInput").addEventListener("input", debounce(e => searchName(e.target.value), 320));
$("nameList").addEventListener("change", () => {
  lookupName();
  searchName($("nameInput").value);
});

/* ---------- Snapshot: ein Format für Merken, Bibliothek und Link ---------- */

function snapshot() {
  return {
    colors: state.colors.map(c => ({
      hex: c.hex,
      H: Math.round(c.H * 100) / 100,
      locks: c.locks && Object.keys(c.locks).length ? c.locks : undefined
    })),
    lmax: state.lmax, lmin: state.lmin, cmax: state.cmax, hshift: state.hshift,
    prefix: $("prefix").value
  };
}

/* Alles von außen wird geprüft und auf gültige Bereiche begrenzt — ein kaputter,
   alter oder manipulierter Eintrag darf die App nie in einen unbrauchbaren Zustand bringen. */
function applySnapshot(s) {
  if (!s || !Array.isArray(s.colors) || !s.colors.length) return false;
  const cols = [];
  for (const c of s.colors) {
    if (!c || !hexToRgb(String(c.hex || "")) || !Number.isFinite(c.H)) continue;
    const locks = {};
    if (c.locks && typeof c.locks === "object") {
      for (const step of STEPS) {
        const v = c.locks[step];
        if (typeof v === "string" && hexToRgb(v)) locks[step] = rgbToHex(hexToRgb(v));
      }
    }
    cols.push({ hex: rgbToHex(hexToRgb(c.hex)), H: ((c.H % 360) + 360) % 360, locks });
  }
  if (!cols.length) return false;
  state.colors = cols;

  const num = (v, lo, hi, d) => Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  state.lmax   = num(s.lmax,   0.85, 0.99, 0.97);
  state.lmin   = num(s.lmin,   0.10, 0.45, 0.21);
  state.cmax   = num(s.cmax,   0,    0.37, 0.16);
  state.hshift = num(s.hshift, -30,  30,   0);
  $("prefix").value = typeof s.prefix === "string" ? s.prefix.slice(0, 40) : "brand";
  return true;
}

/* ---------- Merken zwischen Sitzungen ---------- */

const STORE_KEY = "spectroton.state.v1";

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      ...snapshot(), fmt: state.fmt, contrastMode: state.contrastMode
    }));
  } catch { /* privater Modus oder voll — dann eben ohne Merken */ }
}
const scheduleSave = debounce(saveState, 300);

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!applySnapshot(s)) return false;
    if (Object.prototype.hasOwnProperty.call(FILE_NAMES, s.fmt)) state.fmt = s.fmt;
    if (s.contrastMode === "apca" || s.contrastMode === "wcag") state.contrastMode = s.contrastMode;
    return true;
  } catch { return false; }
}

const HINTS = {
  wcag: "hintWcag",
  apca: "hintApca"
};

/* Bedienelemente auf den Zustand bringen — nach Wiederherstellen, Laden und Zurücksetzen */
function syncControls() {
  $("swatch").value = state.colors[0].hex.toLowerCase();
  $("hexInput").value = state.colors[0].hex;
  $("lmax").value = Math.round(state.lmax * 100);
  $("lmin").value = Math.round(state.lmin * 100);
  $("cmax").value = Math.round(state.cmax * 100);
  $("hshift").value = state.hshift;
  document.querySelectorAll("#fmtTabs .tab").forEach(t =>
    t.setAttribute("aria-selected", t.dataset.fmt === state.fmt ? "true" : "false"));
  document.querySelectorAll("#modeTabs .tab").forEach(t =>
    t.setAttribute("aria-selected", t.dataset.mode === state.contrastMode ? "true" : "false"));
  $("filename").value = FILE_NAMES[state.fmt];
  $("contrastHint").textContent = i18n.t(HINTS[state.contrastMode]);
}

$("reset").addEventListener("click", () => {
  if (!confirm(i18n.t("confirmReset"))) return;
  try { localStorage.removeItem(STORE_KEY); } catch {}
  state.colors = [{ hex: "#3B82F6", H: 0, locks: {} }];
  state.lmax = 0.97; state.lmin = 0.21; state.hshift = 0; state.fmt = "css";
  $("prefix").value = "brand";
  setBase("#3B82F6");
  syncControls();
  render();
  lookupName();
  note(i18n.t("noteReset"));
});

/* ---------- Bibliothek: mehrere Paletten im Gerät ---------- */

const LIB_KEY = "spectroton.library.v1";

function loadLibrary() {
  try {
    const lib = JSON.parse(localStorage.getItem(LIB_KEY) || "[]");
    return Array.isArray(lib) ? lib.filter(e => e && typeof e.name === "string" && e.snap) : [];
  } catch { return []; }
}
function saveLibrary(lib) {
  try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); return true; }
  catch { note(i18n.t("noteStorageFull")); return false; }
}

function renderLibrary() {
  const host = $("libList");
  host.textContent = "";
  loadLibrary().forEach(entry => {
    const row = document.createElement("div");
    row.className = "lib-row";

    const dots = document.createElement("div");
    dots.className = "lib-dots";
    (entry.snap.colors || []).slice(0, 6).forEach(c => {
      const d = document.createElement("span");
      if (hexToRgb(String(c.hex || ""))) d.style.background = c.hex;
      dots.appendChild(d);
    });

    const name = document.createElement("div");
    name.className = "lib-name";
    const when = entry.at ? new Date(entry.at) : null;
    name.innerHTML = `${escapeHtml(entry.name)}<small>${when && !isNaN(when) ? when.toLocaleDateString(i18n.lang) : ""}</small>`;

    const load = document.createElement("button");
    load.type = "button"; load.className = "btn mini"; load.textContent = i18n.t("btnLoad");
    load.addEventListener("click", () => {
      if (!applySnapshot(entry.snap)) { note(i18n.t("noteEntryBroken")); return; }
      syncControls(); render(); lookupName();
      note(i18n.fmt("noteLoaded", { name: entry.name }));
    });

    const del = document.createElement("button");
    del.type = "button"; del.className = "btn mini"; del.textContent = "×";
    del.setAttribute("aria-label", i18n.fmt("ariaDelete", { name: entry.name }));
    del.addEventListener("click", () => {
      if (!confirm(i18n.fmt("confirmDelete", { name: entry.name }))) return;
      saveLibrary(loadLibrary().filter(e => e.id !== entry.id));
      renderLibrary();
    });

    row.append(dots, name, load, del);
    host.appendChild(row);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

$("libSave").addEventListener("click", () => {
  const lib = loadLibrary();
  const name = ($("libName").value.trim() || i18n.fmt("libDefaultName", { n: lib.length + 1 })).slice(0, 60);
  lib.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, at: new Date().toISOString(), snap: snapshot() });
  if (saveLibrary(lib)) {
    $("libName").value = "";
    renderLibrary();
    note(i18n.fmt("noteSaved", { name: name }));
  }
});
$("libName").addEventListener("keydown", e => { if (e.key === "Enter") $("libSave").click(); });

/* ---------- Palette als Link ---------- */

const b64u = {
  enc: str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))
};

$("shareLink").addEventListener("click", async () => {
  const url = location.origin + location.pathname + "#p=" + b64u.enc(JSON.stringify(snapshot()));
  if (navigator.share) {
    try { await navigator.share({ title: i18n.t("shareTitle"), url }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  copyText(url, i18n.t("noteLinkCopied"));
});

/* Beim Start: Link im Hash hat Vorrang vor dem gemerkten Zustand.
   Danach wird der Hash entfernt, damit spätere Änderungen nicht mit einem alten Link verwechselt werden. */
function importFromHash() {
  const m = /^#p=([A-Za-z0-9_-]+)$/.exec(location.hash);
  if (!m) return false;
  try {
    if (!applySnapshot(JSON.parse(b64u.dec(m[1])))) return false;
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => note(i18n.t("noteFromLink")), 400);
    return true;
  } catch { return false; }
}

/* ---------- Erscheinungsbild ---------- */

const THEME_KEY = "spectroton.theme.v1";
const THEME_BG = { light: "#f2f3f5", dark: "#17181a", "soft-dark": "#2a2c30" };
const THEME_VALUES = ["system", "light", "soft-dark", "dark"];

function setTheme(pref) {
  if (!THEME_VALUES.includes(pref)) pref = "system";
  const html = document.documentElement;
  if (pref === "system") {
    html.removeAttribute("data-theme");
    const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeColorMeta(dark ? THEME_BG["soft-dark"] : THEME_BG.light);
  } else {
    html.setAttribute("data-theme", pref);
    setThemeColorMeta(THEME_BG[pref]);
  }
  $("theme").value = pref;
  try { localStorage.setItem(THEME_KEY, pref); } catch { /* privater Modus — dann eben nur für diese Sitzung */ }
}
function setThemeColorMeta(hex) {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", hex);
}
function initTheme() {
  let v = "system";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEME_VALUES.includes(stored)) v = stored;
  } catch { /* nichts gespeichert oder kein Zugriff — Standard bleibt System */ }
  setTheme(v);
}
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ($("theme").value === "system") setTheme("system");
  });
}
$("theme").addEventListener("change", e => setTheme(e.target.value));

/* ---------- Als App installierbar machen ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/* ---------- Sprache ----------
   Muss vor dem ersten Rendern laufen: Rampenkoepfe und Harmonie-Knoepfe
   entstehen zur Laufzeit aus der Tabelle, nicht aus dem Markup. */
function initLanguage() {
  const sel = $("langSelect");
  Object.keys(I18N).forEach(code => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = I18N[code]._name;
    sel.appendChild(opt);
  });
  const lang = i18n.detect();
  sel.value = lang;
  i18n.apply(lang);
  sel.addEventListener("change", () => {
    i18n.apply(sel.value);
    /* Was im Markup steht, hat apply() erledigt. Alles zur Laufzeit
       Gebaute muss neu gezeichnet werden. */
    initHarmonyButtons();
    syncControls();
    render();
    renderLibrary();
    lookupName();
    envLine();
  });
}

/* Start */
initTheme();
initLanguage();
initHarmonyButtons();
if (!importFromHash() && !loadState()) setBase("#3B82F6");
syncControls();
render();
renderLibrary();
lookupName();
