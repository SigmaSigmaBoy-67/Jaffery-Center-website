import { hydrateRoot } from 'react-dom/client'
import AdjustableGlassDashboard from '@/components/ui/adjustable-glass-dashboard'
import '@/components/ui/adjustable-glass-dashboard.css'

const mount = document.getElementById('community-dashboard-root')
if (mount) hydrateRoot(mount, <AdjustableGlassDashboard backgroundImage="assets/house-of-light.svg" />)
