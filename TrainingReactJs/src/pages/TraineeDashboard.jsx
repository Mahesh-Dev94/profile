import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import { Visibility } from '@mui/icons-material'
import DataTable from '../components/common/DataTable'
import TrainingDetails from '../components/trainee/TrainingDetails'
import { trainingApi } from '../services/mockApi'
import { setTrainings } from '../store/slices/trainingSlice'

const TraineeDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { trainings } = useSelector((state) => state.training)
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  useEffect(() => {
    loadTrainings()
  }, [user])

  const loadTrainings = async () => {
    try {
      const trainingsData = await trainingApi.getTrainings({
        userId: user.id,
        role: 'trainee',
      })
      dispatch(setTrainings(trainingsData))
    } catch (error) {
      console.error('Failed to load trainings:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleViewDetails = (training) => {
    setSelectedTraining(training)
    setDetailsModalOpen(true)
  }

  const handleMarkAttended = async (trainingId) => {
    try {
      // Update trainee status for this training
      await trainingApi.updateTraining(trainingId, {
        traineeStatus: { [user.id]: 'attended' },
      })
      loadTrainings()
      setDetailsModalOpen(false)
    } catch (error) {
      console.error('Failed to mark as attended:', error)
    }
  }

  const trainingColumns = [
    { id: 'title', label: 'Title' },
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    { id: 'startTime', label: 'Start Time' },
    { id: 'endTime', label: 'End Time' },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Chip
          label={val}
          color={
            val === 'completed' ? 'success' :
            val === 'cancelled' ? 'error' :
            val === 'attended' ? 'info' : 'warning'
          }
          size="small"
        />
      ),
    },
  ]

  const upcomingTrainings = trainings.filter((t) => {
    const trainingDate = new Date(t.date)
    return (t.status === 'approved' || t.status === 'in-progress') &&
           trainingDate >= new Date()
  })
  const attendedTrainings = trainings.filter((t) => {
    const traineeStatus = t.traineeStatus?.[user.id]
    return traineeStatus === 'attended' || traineeStatus === 'completed'
  })
  const completedTrainings = trainings.filter((t) => t.status === 'completed')
  const missedTrainings = trainings.filter((t) => {
    const trainingDate = new Date(t.date)
    return t.status !== 'cancelled' &&
           trainingDate < new Date() &&
           !attendedTrainings.some((at) => at.id === t.id)
  })

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trainee Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Upcoming Trainings
              </Typography>
              <Typography variant="h4">{upcomingTrainings.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Attended
              </Typography>
              <Typography variant="h4">{attendedTrainings.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">{completedTrainings.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Missed
              </Typography>
              <Typography variant="h4">{missedTrainings.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upcoming" />
          <Tab label="Attended" />
          <Tab label="Completed" />
          <Tab label="Missed" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <DataTable
          columns={trainingColumns}
          data={upcomingTrainings}
          actions={[
            {
              icon: <Visibility />,
              tooltip: 'View Details',
              onClick: handleViewDetails,
            },
          ]}
        />
      )}

      {tabValue === 1 && (
        <DataTable
          columns={trainingColumns}
          data={attendedTrainings}
          actions={[
            {
              icon: <Visibility />,
              tooltip: 'View Details',
              onClick: handleViewDetails,
            },
          ]}
        />
      )}

      {tabValue === 2 && (
        <DataTable
          columns={trainingColumns}
          data={completedTrainings}
          actions={[
            {
              icon: <Visibility />,
              tooltip: 'View Details',
              onClick: handleViewDetails,
            },
          ]}
        />
      )}

      {tabValue === 3 && (
        <DataTable
          columns={trainingColumns}
          data={missedTrainings}
          actions={[
            {
              icon: <Visibility />,
              tooltip: 'View Details',
              onClick: handleViewDetails,
            },
          ]}
        />
      )}

      {selectedTraining && (
        <TrainingDetails
          open={detailsModalOpen}
          training={selectedTraining}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedTraining(null)
          }}
          onMarkAttended={handleMarkAttended}
          userId={user.id}
        />
      )}
    </Box>
  )
}

export default TraineeDashboard

