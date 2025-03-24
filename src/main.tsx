import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { MusicProvider } from '@/ui/contexts/MusicContext'
import { AppRouter } from '@/ui/router/AppRouter'
import { theme } from '@/ui/themes/theme'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <MusicProvider>
        <AppRouter />
      </MusicProvider>
    </ThemeProvider>
  </StrictMode>,
)
