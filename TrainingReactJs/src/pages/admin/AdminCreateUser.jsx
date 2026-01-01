import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import { userApi, notificationApi } from '../../services/mockApi'
import useLoader from '../../hooks/useLoader'
import Loader from '../../components/common/Loader'

const AdminCreateUser = () => {
  const { loading, withLoader } = useLoader()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trainer',
    phone: '',
    specialization: '',
    experience: '',
    priorityScore: '',
    rating: '',
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required')
      return
    }

    await withLoader(async () => {
      try {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
        }

        if (formData.role === 'trainer') {
          userData.specialization = formData.specialization
          userData.experience = formData.experience
          userData.rating = formData.rating ? parseFloat(formData.rating) : 0
        } else if (formData.role === 'client') {
          userData.priorityScore = formData.priorityScore ? parseInt(formData.priorityScore) : 0
          userData.rating = formData.rating ? parseFloat(formData.rating) : 0
          userData.contactPerson = formData.name
          userData.industry = 'Technology'
        } else if (formData.role === 'admin') {
          userData.department = 'Administration'
        }

        await userApi.createUser(userData)

        // Notify the new user
        const allUsers = await userApi.getUsers()
        const newUser = allUsers.find((u) => u.email === formData.email)
        if (newUser) {
          await notificationApi.createNotification({
            userId: newUser.id,
            type: 'info',
            message: `Your account has been created. Login with email: ${formData.email}`,
          })
        }

        setSuccess(true)
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'trainer',
          phone: '',
          specialization: '',
          experience: '',
          priorityScore: '',
          rating: '',
        })
      } catch (err) {
        setError(err.message || 'Failed to create user')
      }
    }, 'Creating user...')
  }

  if (loading) {
    return <Loader fullScreen message="Creating user..." />
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Create User Credentials
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          User created successfully! They can now login with the provided credentials.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, backgroundColor: '#1E1E1E' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={formData.role}
                  label="User Role"
                  onChange={handleChange('role')}
                >
                  <MenuItem value="trainer">Trainer</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>

            {formData.role === 'trainer' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    value={formData.specialization}
                    onChange={handleChange('specialization')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Experience"
                    value={formData.experience}
                    onChange={handleChange('experience')}
                    placeholder="e.g., 5 years"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rating"
                    value={formData.rating}
                    onChange={handleChange('rating')}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                  />
                </Grid>
              </>
            )}

            {formData.role === 'client' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority Score"
                    value={formData.priorityScore}
                    onChange={handleChange('priorityScore')}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rating"
                    value={formData.rating}
                    onChange={handleChange('rating')}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={loading}>
                  Create User
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default AdminCreateUser

