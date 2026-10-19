import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import '../prototype.css'
import { MotionPage } from './MotionPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <MotionPage />
    </TooltipProvider>
  </StrictMode>,
)
