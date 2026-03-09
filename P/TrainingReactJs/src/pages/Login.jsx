import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { login } from '../store/slices/authSlice'
import { authApi } from '../services/mockApi'

const Login = () => {
  const [email, setEmail] = useState('client1@gmail.com')
  const [password, setPassword] = useState('password')
  const [role, setRole] = useState('client')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value
    setRole(selectedRole)
    
    // Auto-fill sample email and password based on role
    const roleEmails = {
      trainer: 'trainer1@gmail.com',
      client: 'client1@gmail.com',
      admin: 'admin1@gmail.com',
    }
    setEmail(roleEmails[selectedRole] || '')
    setPassword('password') // Auto-fill password
    setEmailError('')
    setPasswordError('')
    setError('')
  }

  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError('')
    setError('')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setPasswordError('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validate email
    const emailValidationError = validateEmail(email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    // Validate password
    if (!password || password.trim() === '') {
      setPasswordError('Password is required')
      return
    }

    setLoading(true)

    try {
      const result = await authApi.login(email.trim(), password)
      dispatch(login(result))

      // Navigate based on role
      const roleRoutes = {
        trainer: '/trainer',
        client: '/client',
        admin: '/admin',
      }
      navigate(roleRoutes[result.user.role] || '/')
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Life Labs Training Platform
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select User Role</InputLabel>
              <Select
                value={role}
                label="Select User Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="trainer">Trainer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError || "Email auto-filled based on role. You can change it to use trainer2@gmail.com, client2@gmail.com, admin2@gmail.com, etc."}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              error={!!passwordError}
              helperText={passwordError || "Password auto-filled. You can change it if needed."}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Demo accounts: trainer1@gmail.com, trainer2@gmail.com, client1@gmail.com, client2@gmail.com, admin1@gmail.com, admin2@gmail.com (password: "password")
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
