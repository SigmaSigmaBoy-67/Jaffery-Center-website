import { createRoot } from 'react-dom/client'
import type { MeadowColumn, MeadowLink, MeadowPalette } from '@/components/ui/meadow-rise-footer'
import logoUrl from '@/assets/brand/mihrab-color.svg?url'

interface FooterConfig {
  heading: string
  subheading: string
  cta: MeadowLink
  tagline: string
  invocation: string
  explore: MeadowLink[]
  find: MeadowLink[]
}

const palette: MeadowPalette = {
  sky: ['#eee8dc', '#f4efe4'], haze: '#dfd7c5', glow: '#b6a57d',
  ground: '#f4efe4', ink: '#26352b', sub: '#46564a',
  pill: '#244f38', pillInk: '#fbf8f0', text: '#26352b',
  muted: '#536153', line: 'rgba(46,72,51,0.24)',
  hills: [
    ['#97a58a', '#788b70'], ['#829779', '#687f64'],
    ['#718b68', '#587653'], ['#607e59', '#486b4b'],
    ['#4d704b', '#365c40'], ['#3b5f40', '#274b35'],
  ],
}

const mount = document.getElementById('footer-root')
if (mount) {
  let started = false
  const load = async () => {
    if (started) return
    started = true
    try {
      const config = JSON.parse(mount.dataset.config || '') as FooterConfig
      if (!config.heading || !config.cta?.href || !Array.isArray(config.explore) || !Array.isArray(config.find)) return
      const { default: MeadowRiseFooter } = await import('@/components/ui/meadow-rise-footer')
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const columns: MeadowColumn[] = [
        { title: 'Explore', links: config.explore },
        { title: 'Find us', links: config.find },
      ]
      // createRoot replaces the static fallback only after the component loads.
      createRoot(mount).render(<MeadowRiseFooter
        name="Jaffery Center" brandHref="index.html"
        logo={<img src={logoUrl} alt="" width={38} height={38} />}
        heading={config.heading} subheading={config.subheading} cta={config.cta}
        tagline={config.tagline} invocation={config.invocation}
        newsletter={false}
        columns={columns} copyright={`© ${new Date().getFullYear()} Jaffery Center of Roanoke.`}
        closingLine="Made with care for our community." palette={palette}
        seed={3} height={mobile ? '640px' : '720px'}
        heroHeight={mobile ? '300px' : 'clamp(320px, 46svh, 460px)'}
        botanicals={!mobile} scrollParallax={!mobile} drift={0} interactive={false}
        fontFamily={'"DM Sans", Arial, sans-serif'} serifFamily={'"Cormorant Garamond", Georgia, serif'}
      />)
    } catch {
      // Keep the complete, functional static footer if the island cannot load.
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { observer.disconnect(); void load() }
    }, { rootMargin: '600px 0px' })
    observer.observe(mount)
  } else void load()
}
