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
  Chip,
  Typography,
} from '@mui/material'
import { userApi } from '../../services/mockApi'

const TrainingRequestForm = ({ onSubmit, onCancel, trainers = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    trainerId: '',
    description: '',
    trainees: [],
  })
  const [availableTrainees, setAvailableTrainees] = useState([])
  const [selectedTraineeIds, setSelectedTraineeIds] = useState([])

  useEffect(() => {
    loadTrainees()
  }, [])

  const loadTrainees = async () => {
    try {
      const trainees = await userApi.getUsers('trainee')
      setAvailableTrainees(trainees)
    } catch (error) {
      console.error('Failed to load trainees:', error)
    }
  }

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
  }

  const handleTraineeSelect = (event) => {
    const value = event.target.value
    setSelectedTraineeIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleRemoveTrainee = (traineeId) => {
    setSelectedTraineeIds(selectedTraineeIds.filter((id) => id !== traineeId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedTraineeIds.length === 0) {
      alert('Please select at least one trainee')
      return
    }
    if (selectedTraineeIds.length > 50) {
      alert('Maximum 50 trainees per session')
      return
    }
    onSubmit({
      ...formData,
      trainees: selectedTraineeIds,
    })
  }

  const timeSlots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  const selectedTrainees = availableTrainees.filter((t) =>
    selectedTraineeIds.includes(t.id)
  )

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Training Title"
            value={formData.title}
            onChange={handleChange('title')}
            required
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
        <Grid item xs={12}>
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
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Trainees (Max 50)</InputLabel>
            <Select
              multiple
              value={selectedTraineeIds}
              onChange={handleTraineeSelect}
              label="Select Trainees (Max 50)"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const trainee = availableTrainees.find((t) => t.id === id)
                    return (
                      <Chip
                        key={id}
                        label={trainee?.name || id}
                        onDelete={() => handleRemoveTrainee(id)}
                        size="small"
                      />
                    )
                  })}
                </Box>
              )}
            >
              {availableTrainees.map((trainee) => (
                <MenuItem key={trainee.id} value={trainee.id}>
                  {trainee.name} ({trainee.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Selected: {selectedTraineeIds.length} / 50
          </Typography>
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
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Request
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TrainingRequestForm

