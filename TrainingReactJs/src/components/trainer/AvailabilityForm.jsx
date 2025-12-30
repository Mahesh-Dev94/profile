import { useState } from 'react'
import {
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
} from '@mui/material'

const AvailabilityForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    maxTrainees: 50,
  })

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const timeSlots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
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
            <TextField
              fullWidth
              type="number"
              label="Maximum Trainees"
              value={formData.maxTrainees}
              onChange={handleChange('maxTrainees')}
              inputProps={{ min: 1, max: 50 }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save Availability
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
  )
}

export default AvailabilityForm

