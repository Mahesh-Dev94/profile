import { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Alert,
} from '@mui/material'
import { getTraineeCounts } from '../../services/mockApi'
import useLoader from '../../hooks/useLoader'
import Loader from '../common/Loader'
import EmailInput from '../common/EmailInput'

const TrainingRequestForm = ({ onSubmit, onCancel, trainers = [] }) => {
  const { loading, withLoader } = useLoader()
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    trainerId: '',
    emailId: '',
    numberOfTrainees: '',
    description: '',
    proposedCost: 1000, // Default cost, can be negotiated
  })
  const [traineeCounts, setTraineeCounts] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadTraineeCounts()
  }, [])

  const loadTraineeCounts = async () => {
    try {
      const counts = getTraineeCounts()
      setTraineeCounts(counts)
    } catch (error) {
      console.error('Failed to load trainee counts:', error)
    }
  }

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleEmailChange = (emailString) => {
    setFormData({
      ...formData,
      emailId: emailString,
    })
    if (errors.trainerOrEmail) {
      setErrors({ ...errors, trainerOrEmail: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Either trainerId OR emailId is required
    if (!formData.trainerId && !formData.emailId) {
      newErrors.trainerOrEmail = 'Either select a trainer or provide an email ID'
    }
    
    if (!formData.title) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    
    if (!formData.numberOfTrainees) {
      newErrors.numberOfTrainees = 'Number of trainees is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const numberOfTrainees = parseInt(formData.numberOfTrainees)
    if (numberOfTrainees > 50) {
      setErrors({ numberOfTrainees: 'Maximum 50 trainees per session' })
      return
    }

    await withLoader(async () => {
      onSubmit({
        ...formData,
        numberOfTrainees,
      })
    }, 'Submitting request...')
  }

  const timeSlots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  if (loading) {
    return <Loader message="Loading form..." />
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {errors.trainerOrEmail && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.trainerOrEmail}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Training Title"
            value={formData.title}
            onChange={handleChange('title')}
            required
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            InputLabelProps={{
              shrink: true,
            }}
            required
            error={!!errors.date}
            helperText={errors.date}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Start Time"
            value={formData.startTime}
            onChange={handleChange('startTime')}
            required
          >
            {timeSlots.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="End Time"
            value={formData.endTime}
            onChange={handleChange('endTime')}
            required
          >
            {timeSlots.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Trainer (Optional)</InputLabel>
            <Select
              value={formData.trainerId}
              label="Trainer (Optional)"
              onChange={handleChange('trainerId')}
            >
              <MenuItem value="">None</MenuItem>
              {trainers.map((trainer) => (
                <MenuItem key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Email ID (Optional)
            </Typography>
            <EmailInput
              value={formData.emailId}
              onChange={handleEmailChange}
              helperText="Required if trainer is not selected. Type or select multiple emails"
              error={!!errors.trainerOrEmail && !formData.trainerId}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required error={!!errors.numberOfTrainees}>
            <InputLabel>Number of Trainees</InputLabel>
            <Select
              value={formData.numberOfTrainees}
              label="Number of Trainees"
              onChange={handleChange('numberOfTrainees')}
            >
              {traineeCounts.map((count) => (
                <MenuItem key={count} value={count}>
                  {count} trainees
                </MenuItem>
              ))}
            </Select>
            {errors.numberOfTrainees && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.numberOfTrainees}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Proposed Cost (₹)"
            value={formData.proposedCost}
            onChange={handleChange('proposedCost')}
            inputProps={{ min: 0, step: 100 }}
            helperText="Cost can be negotiated with admin/trainer"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TrainingRequestForm
