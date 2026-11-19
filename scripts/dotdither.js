/* dotdither.js — clean-room re-implementation of the claude.dev dot-dither look.
   Not their code: same technique (fixed dot grid, 3 levels, noise-scored, stepped
   animation), written from the teardown in ../notes.md. No dependencies.

   Core idea: every cell of a fixed grid is scored 0 / 1 / 2 → no dot / small dot /
   big dot. One ink colour. Shading comes only from dot SIZE + DENSITY, never alpha,
   so it reads as print, not as a gradient. */

// ---------- deterministic noise ----------
export function hash3(x, y, s) {                // integer lattice → [0,1)
  let h = (Math.imul(x, 0x165667b1) + Math.imul(y, 0x27d4eb2f) + Math.imul(s, 69069)) | 0;
  h = Math.imul(h ^ (h >>> 13), 0x4bf19f61);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const ss = t => t * t * (3 - 2 * t);
export function vnoise(x, y, s, scale) {        // smooth value noise
  const u = x / scale, v = y / scale, i = Math.floor(u), j = Math.floor(v);
  const fx = ss(u - i), fy = ss(v - j);
  const a = hash3(i, j, s), b = hash3(i + 1, j, s), c = hash3(i, j + 1, s), d = hash3(i + 1, j + 1, s);
  return a + (b - a) * fx + (c + (d - c) * fx - (a + (b - a) * fx)) * fy;
}
export function vnoiseT(x, y, s, scale, t) {    // noise that MORPHS through time slices
  const k = Math.floor(t), f = ss(t - k);
  const n0 = vnoise(x, y, s ^ Math.imul(k, 0x9e3779b1), scale);
  return n0 + (vnoise(x, y, s ^ Math.imul(k + 1, 0x9e3779b1), scale) - n0) * f;
}
export function seedOf(str) { let h = 0; for (const c of String(str)) h = (31 * h + c.charCodeAt(0)) >>> 0; return h || 1; }

// ---------- the painter ----------
// level(px, py, col, row) → 0 | 1 | 2
export function paintDots(ctx, W, H, { spacing = 9, rA = 1.35, rB = 2.4, color = '#7a7a7a' }, level) {
  const ox = (W % spacing) / 2, oy = (H % spacing) / 2;   // centre the grid
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = color;
  for (let row = 0, y = oy; y <= H; y += spacing, row++)
    for (let col = 0, x = ox; x <= W; x += spacing, col++) {
      const l = level(x, y, col, row);
      if (!l) continue;
      ctx.beginPath(); ctx.arc(x, y, l === 2 ? rB : rA, 0, 6.2832); ctx.fill();
    }
}

// ---------- level functions (the "shaders") ----------
// 1. Lit blob: a signed-distance-ish shape, lit from lightAng, with frayed edges.
//    field(x,y) returns {f, ox, oy}: f>0 inside (1 at centre), (ox,oy) = shape centre.
export function litShape(field, { seed = 1, lightAng = -135, fray = .5, dither = .5, sparkle = .008, t = 0 } = {}) {
  const la = lightAng * Math.PI / 180, lx = Math.cos(la), ly = Math.sin(la);
  return (x, y, col, row) => {
    const g = field(x, y);
    if (g.f <= 0) return 0;
    const edge = .02 + .14 * fray;                        // frayed rim: drop dots stochastically
    if (g.f < edge && hash3(col, row, seed ^ 95) > Math.pow(g.f / edge, 1.5)) return 0;
    let nx = x - g.ox, ny = y - g.oy; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    const lambert = nx * lx + ny * ly;                    // which side faces the light
    const body = Math.min(g.f, 1), rim = body < .12 ? body / .12 : 1 - (body - .12) * .35;
    const n = .88 * vnoiseT(col, row, seed, 3.2, t) + .12 * hash3(col, row, seed ^ 40503);
    let big = (.5 * lambert + .5) * rim + (n - .5) * (.15 + .5 * dither) > .7;
    if (hash3(col, row, seed ^ 44) < sparkle) big = !big;  // 0.8% flipped cells = life
    return big ? 2 : 1;
  };
}
// Circle / crescent / ring helpers for litShape fields.
export const circle = (cx, cy, r) => (x, y) => ({ f: 1 - Math.hypot(x - cx, y - cy) / r, ox: cx, oy: cy });
export const crescent = (cx, cy, r, bite = .55) => (x, y) => {
  const a = 1 - Math.hypot(x - cx, y - cy) / r, b = 1 - Math.hypot(x - cx - r * bite, y - cy - r * .15) / r;
  return { f: Math.min(a, -b * 3), ox: cx, oy: cy };
};
export const union = (...fs) => (x, y) => fs.reduce((best, f) => { const g = f(x, y); return g.f > best.f ? g : best; }, { f: -1 });

// 2. Texture: sparse morphing speckle (the page-wide ambient layer).
export function speckle({ seed = 7, density = .3, t = 0 } = {}) {
  return (x, y, col, row) => {
    const k = .8 * vnoiseT(col, row, seed, 7, t) + .25 * hash3(col, row, seed ^ 9);
    const cut = .8 - .5 * density;
    return k < cut ? 0 : k > cut + .24 ? 2 : 1;
  };
}

// 3. Any image / text / canvas → dots (luminance → level). Use this to dither your own art.
export function fromImage(img, W, H, { invert = false, t1 = .33, t2 = .66, jitter = .08, seed = 3 } = {}) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  return (x, y, col, row) => {
    const i = (Math.min(H - 1, y | 0) * W + Math.min(W - 1, x | 0)) * 4;
    let d = 1 - (px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114) / 255;  // darkness
    if (px[i + 3] < 20) return 0;
    if (invert) d = 1 - d;
    d += (hash3(col, row, seed) - .5) * jitter;                            // break banding
    return d > t2 ? 2 : d > t1 ? 1 : 0;
  };
}

// ---------- modifiers ----------
// Avoid mask: never paint behind text. Returns (x,y)->0..2 (2 = hard clear, 1 = fray zone).
export function avoidMask(selector, spacing, { pad = 26, fray = 30 } = {}) {
  const rects = [...document.querySelectorAll(selector)].map(e => e.getBoundingClientRect()).filter(r => r.width);
  return (x, y) => {
    let m = 0;
    for (const r of rects) {
      if (x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad) return 2;
      if (x > r.left - pad - fray && x < r.right + pad + fray && y > r.top - pad - fray && y < r.bottom + pad + fray) m = 1;
    }
    return m;
  };
}
export const withAvoid = (level, mask, seed = 5) => (x, y, c, r) => {
  const m = mask(x, y); if (m === 2) return 0;
  const l = level(x, y, c, r); return m === 1 && hash3(c, r, seed) < .6 ? 0 : l;  // fray thins, doesn't cut
};
// Cursor wipe: a circle that grows while the mouse moves and decays after.
export function cursorWipe(target = window) {
  const s = { x: -1e4, y: -1e4, r: 0 }; let t;
  target.addEventListener('mousemove', e => {
    s.x = e.clientX; s.y = e.clientY; s.r = Math.min(140, s.r + 12); clearTimeout(t);
    t = setTimeout(function decay() { s.r = Math.max(0, s.r - 9); if (s.r) t = setTimeout(decay, 70); }, 260);
  }, { passive: true });
  return s;
}
export const withWipe = (level, wipe, origin = () => [0, 0]) => (x, y, c, r) => {
  const [ox, oy] = origin(); return Math.hypot(x + ox - wipe.x, y + oy - wipe.y) < wipe.r ? 0 : level(x, y, c, r);
};
// Scroll reveal: a cell only appears once progress p passes its random reveal value.
export const withReveal = (level, getP, seed = 11) => (x, y, c, r) => hash3(c, r, seed) > getP() ? 0 : level(x, y, c, r);

// ---------- animation: STEPPED, never 60fps ----------
// The look depends on holding frames: 5–13 fps morph, 180–420 ms drift steps.
export function stepLoop(fps, draw) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(0); return () => {}; }
  let raf, last = 0, frame = 0;
  const tick = now => { if (now - last >= 1000 / fps) { last = now; draw(frame++); } raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
}

// ---------- the reading meter (text, not a <progress>) ----------
export function readingMeter(el, articleEl, cells = 28) {
  const upd = () => {
    const end = articleEl.getBoundingClientRect().bottom + scrollY - innerHeight;   // to ARTICLE end
    const p = Math.max(0, Math.min(1, scrollY / Math.max(1, end))), n = Math.round(cells * p);
    el.innerHTML = `<b>${'▓'.repeat(n)}</b>${'░'.repeat(cells - n)} <span>${String(Math.round(100 * p)).padStart(2, '0')}%</span>`;
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

// Canvas that tracks its box at up to 2× DPR.
export function fitCanvas(host) {
  const c = document.createElement('canvas'); c.style.cssText = 'display:block;width:100%;height:100%'; host.appendChild(c);
  const ctx = c.getContext('2d');
  const fit = () => { const d = Math.min(2, devicePixelRatio || 1), b = host.getBoundingClientRect();
    c.width = Math.max(1, b.width * d); c.height = Math.max(1, b.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); };
  fit(); new ResizeObserver(fit).observe(host);
  return { c, ctx, size: () => [c.clientWidth, c.clientHeight] };
}
