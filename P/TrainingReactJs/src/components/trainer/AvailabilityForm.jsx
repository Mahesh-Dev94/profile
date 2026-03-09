import { useState } from 'react'
import {
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Typography,
  Chip,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import useLoader from '../../hooks/useLoader'
import Loader from '../common/Loader'

const AvailabilityForm = ({ onSubmit, onCancel }) => {
  const { loading, withLoader } = useLoader()
  const [mode, setMode] = useState('range') // 'range' or 'multiple'
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    maxTrainees: 50,
    status: 'open',
  })
  const [selectedDates, setSelectedDates] = useState([])
  const [newDate, setNewDate] = useState('')
  const [notAvailableDates, setNotAvailableDates] = useState([])
  const [newNotAvailableDate, setNewNotAvailableDate] = useState('')

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
  }

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode)
      setSelectedDates([])
      setNotAvailableDates([])
    }
  }

  const handleAddDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      setSelectedDates([...selectedDates, newDate].sort())
      setNewDate('')
    }
  }

  const handleRemoveDate = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date))
  }

  const handleAddNotAvailableDate = () => {
    if (newNotAvailableDate && !notAvailableDates.includes(newNotAvailableDate)) {
      const fromDate = new Date(formData.fromDate)
      const toDate = new Date(formData.toDate)
      const selectedDate = new Date(newNotAvailableDate)

      if (mode === 'range' && selectedDate >= fromDate && selectedDate <= toDate) {
        setNotAvailableDates([...notAvailableDates, newNotAvailableDate])
        setNewNotAvailableDate('')
      } else if (mode === 'multiple') {
        setNotAvailableDates([...notAvailableDates, newNotAvailableDate])
        setNewNotAvailableDate('')
      } else {
        alert('Not available date must be within the selected date range')
      }
    }
  }

  const handleRemoveNotAvailableDate = (date) => {
    setNotAvailableDates(notAvailableDates.filter((d) => d !== date))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let availabilitySlots = []

    if (mode === 'range') {
      // Generate availability slots for each date in range
      const fromDate = new Date(formData.fromDate)
      const toDate = new Date(formData.toDate)

      for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        
        // Skip if this date is marked as not available
        if (!notAvailableDates.includes(dateStr)) {
          availabilitySlots.push({
            date: dateStr,
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxTrainees: formData.maxTrainees,
            status: formData.status,
          })
        }
      }
    } else {
      // Use selected individual dates
      selectedDates.forEach((dateStr) => {
        if (!notAvailableDates.includes(dateStr)) {
          availabilitySlots.push({
            date: dateStr,
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxTrainees: formData.maxTrainees,
            status: formData.status,
          })
        }
      })
    }

    if (availabilitySlots.length === 0) {
      alert('Please select at least one available date')
      return
    }

    await withLoader(async () => {
      // Submit all slots
      for (const slot of availabilitySlots) {
        await onSubmit(slot)
      }
    }, 'Creating open slots...')
  }

  const timeSlots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  if (loading) {
    return <Loader message="Creating availability..." />
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Selection Mode
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="selection mode"
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="range" aria-label="date range">
              Date Range
            </ToggleButton>
            <ToggleButton value="multiple" aria-label="multiple dates">
              Multiple Dates
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        {mode === 'range' ? (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Date Range Selection
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={formData.fromDate}
                onChange={handleChange('fromDate')}
                InputLabelProps={{
                  shrink: true,
                }}
                required
                inputProps={{
                  max: formData.toDate,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={formData.toDate}
                onChange={handleChange('toDate')}
                InputLabelProps={{
                  shrink: true,
                }}
                required
                inputProps={{
                  min: formData.fromDate,
                }}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Multiple Dates
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Add Date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddDate}
                  disabled={!newDate}
                >
                  Add Date
                </Button>
              </Box>
              {selectedDates.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#1E1E1E', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected Dates ({selectedDates.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedDates.map((date) => (
                      <Chip
                        key={date}
                        label={new Date(date).toLocaleDateString()}
                        onDelete={() => handleRemoveDate(date)}
                        deleteIcon={<DeleteIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              )}
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Mark specific dates as NOT available
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              type="date"
              label="Not Available Date"
              value={newNotAvailableDate}
              onChange={(e) => setNewNotAvailableDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={
                mode === 'range'
                  ? {
                      min: formData.fromDate,
                      max: formData.toDate,
                    }
                  : {}
              }
            />
            <Button
              variant="outlined"
              onClick={handleAddNotAvailableDate}
              disabled={!newNotAvailableDate}
            >
              Add
            </Button>
          </Box>
          {notAvailableDates.length > 0 && (
            <Paper sx={{ p: 2, backgroundColor: '#1E1E1E', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Not Available Dates:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {notAvailableDates.map((date) => (
                  <Chip
                    key={date}
                    label={new Date(date).toLocaleDateString()}
                    onDelete={() => handleRemoveNotAvailableDate(date)}
                    deleteIcon={<DeleteIcon />}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Time & Capacity
          </Typography>
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
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={handleChange('status')}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Creating...' : 'Create Open Slots'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AvailabilityForm
