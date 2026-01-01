import { Box, CircularProgress, Typography } from '@mui/material'

const Loader = ({ message = 'Loading...', size = 40, fullScreen = false }) => {
  const loaderContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={size} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  )

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {loaderContent}
      </Box>
    )
  }

  return loaderContent
}

export default Loader

