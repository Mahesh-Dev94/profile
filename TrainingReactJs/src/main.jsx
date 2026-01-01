import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App'
import { store } from './store/store'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
      contrastText: '#000',
    },
    secondary: {
      main: '#CE93D8',
      light: '#E1BEE7',
      dark: '#BA68C8',
      contrastText: '#000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
    h1: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.8125rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.6875rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: '0.8125rem',
          minHeight: '32px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          fontSize: '1.125rem',
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          gap: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '24px',
        },
        label: {
          padding: '0 8px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          padding: '10px 16px',
        },
        head: {
          fontSize: '0.8125rem',
          fontWeight: 600,
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

