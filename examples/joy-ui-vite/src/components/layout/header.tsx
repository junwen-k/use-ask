import { DarkModeRounded, LightModeRounded } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/joy'
import { useColorScheme } from '@mui/joy/styles'
import * as React from 'react'

const ColorSchemeToggle = () => {
  const { mode, setMode } = useColorScheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) {
    return <IconButton size="sm" variant="outlined" color="primary" />
  }
  return (
    <Tooltip title="Change theme" variant="outlined">
      <IconButton
        id="toggle-mode"
        size="sm"
        variant="plain"
        color="neutral"
        sx={{ alignSelf: 'center' }}
        onClick={() => {
          if (mode === 'light') {
            setMode('dark')
          } else {
            setMode('light')
          }
        }}
      >
        {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
      </IconButton>
    </Tooltip>
  )
}

export const Header = () => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3.5 }}>
    <ColorSchemeToggle />
  </Box>
)
