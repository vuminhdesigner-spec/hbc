import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import './prototype.css'
import { W1 } from './w1/W1'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <W1 />
    </TooltipProvider>
  </StrictMode>,
)
