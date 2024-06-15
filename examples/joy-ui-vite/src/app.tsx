import { Box, CssBaseline } from '@mui/joy'
import { CssVarsProvider } from '@mui/joy/styles'

import { Confirmer } from '@/components/confirmer'
import { Header } from '@/components/layout/header'
import { Demo } from '@/demo'

export const App = () => (
  <CssVarsProvider defaultMode="system">
    <CssBaseline />
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      }}
    >
      <Header />
      <Demo />
    </Box>
    <Confirmer />
  </CssVarsProvider>
)
