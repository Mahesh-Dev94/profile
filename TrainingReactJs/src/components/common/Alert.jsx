import { Alert as MuiAlert, Snackbar } from '@mui/material'
import { useState, useEffect } from 'react'

const Alert = ({ message, severity = 'info', duration = 6000, onClose }) => {
  const [open, setOpen] = useState(!!message)

  useEffect(() => {
    setOpen(!!message)
  }, [message])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
    if (onClose) {
      onClose()
    }
  }

  if (!message) return null

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert
        onClose={handleClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  )
}

export default Alert

