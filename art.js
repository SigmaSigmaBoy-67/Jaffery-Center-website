// The mihrab art, drawn live with the vault's dot-dither kit (scripts/dotdither.js, copied byte for byte).
// Kit rules followed: a fixed grid (9px), three levels per cell (none / small dot / big dot, small about half
// the big), one ink per layer, no alpha, lit and frayed shapes, 0.8% flipped cells, and STEPPED motion
// (8 fps held frames, never 60). Two inks (forest-black A, vermilion B) multiply on the paper in CSS, and B sits
// a few px off register. Art never sits behind text: it lives in its own plate and strip bands.
import * as D from './scripts/dotdither.js'

const DOT = { spacing: 9, rA: 1.4, rB: 2.6 }
const FPS = 8
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()

// The niche is a vertical axis that ends in a half circle at the top. A ring is a band at distance r from it.
const axis = (cx, yc) => (x, y) => { const oy = Math.max(y, yc); return { d: Math.hypot(x - cx, y - oy), ox: cx, oy } }
const ring = (ax, r, half) => (x, y) => { const g = ax(x, y); return { f: 1 - Math.abs(g.d - r) / half, ox: g.ox, oy: g.oy } }
const first = (...fs) => (x, y, c, r) => { for (const f of fs) { const l = f(x, y, c, r); if (l) return l } return 0 }

// box: the .art-box element. opts come from its data attributes.
function geometry(W, H, hero, o) {
  const narrow = W < 560
  const a = hero ? Math.min(W * (narrow ? 0.3 : 0.255), H * 0.33) : narrow ? W * 0.27 : Math.min(Math.max(W * 0.19, 110), 270)
  const cx = narrow ? W * 0.5 : W * o.ox
  const oy = narrow ? Math.min(o.oy, 0.15) : o.oy     // on a phone the strip always keeps the dome and moon in view
  const yTop = hero ? H * 0.09 : -oy * a              // a strip is a window that slides down the scene
  return { a, cx, yc: yTop + a }
}

function scene(W, H, hero, o, f) {
  const { a, cx, yc } = geometry(W, H, hero, o)
  const ax = axis(cx, yc), t = (f / FPS) * 0.5, seed = o.seed
  const lit = (field, extra) => D.litShape(field, { seed, lightAng: -135, fray: 0.55, dither: 0.55, t, ...extra })
  const niche = (x, y) => ax(x, y).d < a * 0.82       // inside the frame

  // layer A: three arch rings (heavy, then two fainter echoes), sparse stars and a little speckle in the niche
  const rings = first(
    lit(ring(ax, a * 1.0, a * 0.17)),
    lit(ring(ax, a * 1.34, a * 0.07), { fray: 0.9 }),
    lit(ring(ax, a * 1.64, a * 0.05), { fray: 1 }),
    ...(hero ? [] : [lit(ring(ax, a * 1.92, a * 0.045), { fray: 1 }), lit(ring(ax, a * 2.2, a * 0.04), { fray: 1 })]))
  const speck = D.speckle({ seed: seed + 5, density: 0.22, t })
  const star = (x, y, c, r) => {
    let l = D.hash3(c, r, seed ^ 77) < 0.011 ? (D.hash3(c, r, seed ^ 78) < 0.25 ? 2 : 1) : 0
    if (l && D.hash3(c, r, 90 + (f >> 1)) < 0.05) l = 0   // a few stars blink off between held frames
    return l
  }
  const A = (x, y, c, r) => rings(x, y, c, r) || (niche(x, y) ? speck(x, y, c, r) && D.hash3(c, r, seed ^ 3) < 0.5 ? 1 : star(x, y, c, r) : star(x, y, c, r))

  // layer B: a crescent that drifts a few px in held steps, and a star beside it
  const bob = Math.round(Math.sin(f * 0.35) * 2) * 2
  // solid bodies with a lit rim: big dots across the body, small dots on the rim, frayed edge, 0.8% flipped cells
  const body = (field, sd, rim) => (x, y, c, r) => {
    const g = field(x, y)
    if (g.f <= 0) return 0
    if (g.f < 0.1 && D.hash3(c, r, sd ^ 95) > Math.pow(g.f / 0.1, 1.5)) return 0
    let l = g.f < rim || D.vnoiseT(c, r, sd, 3.2, t) > 0.95 ? 1 : 2
    if (D.hash3(c, r, sd ^ 44) < 0.008) l = l === 2 ? 1 : 2
    return l
  }
  const crescent = D.crescent(cx - a * 0.12, yc + a * 0.08 + bob, a * 0.5, 0.72)
  const sx = cx + a * 0.42, sy = yc - a * 0.3 + bob, sr = a * 0.16
  const fourStar = (x, y) => ({ f: 1 - (Math.abs(x - sx) / sr) ** 0.7 - (Math.abs(y - sy) / sr) ** 0.7, ox: sx, oy: sy })
  const B = first(body(crescent, seed + 1, 0.1), body(fourStar, seed + 2, 0.2))
  return { A, B }
}

function mount(box) {
  const hero = box.dataset.art === 'hero'
  const o = { ox: +(box.dataset.ox ?? 0.5), oy: +(box.dataset.oy ?? 0), flip: +(box.dataset.flip ?? 1), seed: +(box.dataset.seed ?? 11) }
  const ca = D.fitCanvas(box.querySelector('.dots.a')), cb = D.fitCanvas(box.querySelector('.dots.b'))
  const inkA = css('--ink'), inkB = css('--spot')
  let f0 = null, last = 0
  const wipe = hero && !reduced && matchMedia('(hover: hover)').matches ? D.cursorWipe() : null
  const rect = () => box.getBoundingClientRect()

  function draw(f) {
    last = f
    if (f0 === null) f0 = f
    const [W, H] = ca.size()
    if (!W || !H) return
    const s = scene(W, H, hero, o, f)
    const p = reduced ? 1 : Math.min(1, (f - f0 + 1) / 12)   // the dots arrive at random over 1.5s, then stay
    const wrap = (l, seed) => {
      let g = D.withReveal(l, () => p, seed)
      if (o.flip < 0) { const h = g; g = (x, y, c, r) => h(W - x, y, c, r) }
      return wipe ? D.withWipe(g, wipe, () => { const b = rect(); return [b.left, b.top] }) : g
    }
    D.paintDots(ca.ctx, W, H, { ...DOT, color: inkA }, wrap(s.A, 11))
    D.paintDots(cb.ctx, W, H, { ...DOT, color: inkB }, wrap(s.B, 12))
  }

  let stop = null, seen = false
  const run = () => { if (seen && !document.hidden && !stop) { f0 = null; stop = D.stepLoop(FPS, draw) } }
  const halt = () => { if (stop) { stop(); stop = null } }
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : halt() }, { rootMargin: '80px' }).observe(box)
  document.addEventListener('visibilitychange', () => (document.hidden ? halt() : run()))
  new ResizeObserver(() => draw(last)).observe(box)   // after fitCanvas has resized, so a still frame is redrawn too
}

for (const box of document.querySelectorAll('.art-box[data-art]')) mount(box)
