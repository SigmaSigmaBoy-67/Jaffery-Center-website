// Small behaviours only: mobile menu, copy address, and the live dot art.
import './art.js'
const toggle = document.querySelector('.nav-toggle')
const list = document.getElementById('nav-list')
if (toggle && list) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open')
    toggle.setAttribute('aria-expanded', String(open))
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && list.classList.contains('open')) { list.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus() }
  })
}
for (const b of document.querySelectorAll('[data-copy]')) {
  const label = b.textContent
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied' }
    catch { b.textContent = b.dataset.copy }
    setTimeout(() => { b.textContent = label }, 2200)
  })
}
