import { createRoot, type Root } from 'react-dom/client'

const mount = document.getElementById('hero-hills-root')
const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

if (mount) {
  let root: Root | undefined
  let loading = false
  const update = async () => {
    if (motion.matches) {
      root?.unmount()
      root = undefined
      return
    }
    if (root || loading) return
    loading = true
    try {
      // The terrain is decorative; let the HTML and navigation paint first.
      await new Promise<void>(resolve => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 1200 })
        else setTimeout(resolve, 150)
      })
      if (motion.matches) return
      const { GLSLHills } = await import('@/components/ui/glsl-hills')
      if (!motion.matches && !root) {
        root = createRoot(mount)
        root.render(<GLSLHills speed={0.18} />)
      }
    } catch {
      // The CSS hero background is the progressive-enhancement fallback.
    } finally {
      loading = false
    }
  }
  motion.addEventListener('change', update)
  void update()
}
