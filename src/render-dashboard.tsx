import { renderToStaticMarkup } from 'react-dom/server'
import AdjustableGlassDashboard from '@/components/ui/adjustable-glass-dashboard'

process.stdout.write(renderToStaticMarkup(<AdjustableGlassDashboard backgroundImage="assets/house-of-light.svg" />))
