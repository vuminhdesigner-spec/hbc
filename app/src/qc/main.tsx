import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import '../prototype.css'
import { Qc } from './Qc'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <Qc />
    </TooltipProvider>
  </StrictMode>,
)
