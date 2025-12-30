import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import { Add as AddIcon, Visibility, Check, Close } from '@mui/icons-material'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import AvailabilityForm from '../components/trainer/AvailabilityForm'
import TrainingDetails from '../components/trainer/TrainingDetails'
import { trainingApi, availabilityApi, requestApi } from '../services/mockApi'
import { setTrainings, setAvailability, setRequests } from '../store/slices/trainingSlice'
import { addNotification } from '../store/slices/notificationSlice'

const TrainerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { trainings, availability, requests } = useSelector((state) => state.training)
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [trainingsData, availabilityData, requestsData] = await Promise.all([
        trainingApi.getTrainings({ userId: user.id, role: 'trainer' }),
        availabilityApi.getAvailability(user.id),
        requestApi.getRequests({ trainerId: user.id }),
      ])
      dispatch(setTrainings(trainingsData))
      dispatch(setAvailability(availabilityData))
      dispatch(setRequests(requestsData))
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleAvailabilitySubmit = async (formData) => {
    try {
      await availabilityApi.createAvailability({
        ...formData,
        trainerId: user.id,
      })
      dispatch(addNotification({
        userId: user.id,
        type: 'info',
        message: 'Availability slot created successfully',
      }))
      setAvailabilityModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to create availability:', error)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await requestApi.updateRequest(requestId, { status: 'approved' })
      dispatch(addNotification({
        userId: user.id,
        type: 'success',
        message: 'Training request accepted',
      }))
      loadData()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await requestApi.updateRequest(requestId, { status: 'rejected' })
      dispatch(addNotification({
        userId: user.id,
        type: 'warning',
        message: 'Training request rejected',
      }))
      loadData()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleViewDetails = (training) => {
    setSelectedTraining(training)
    setDetailsModalOpen(true)
  }

  const handleUpdateTrainingStatus = async (trainingId, status) => {
    try {
      await trainingApi.updateTraining(trainingId, { status })
      dispatch(addNotification({
        userId: user.id,
        type: 'info',
        message: `Training marked as ${status}`,
      }))
      setDetailsModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to update training:', error)
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
            val === 'approved' ? 'info' : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      id: 'trainees',
      label: 'Trainees',
      format: (val) => val?.length || 0,
    },
  ]

  const requestColumns = [
    { id: 'title', label: 'Title' },
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    { id: 'startTime', label: 'Start Time' },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Chip
          label={val}
          color={val === 'approved' ? 'success' : val === 'rejected' ? 'error' : 'warning'}
          size="small"
        />
      ),
    },
  ]

  const availabilityColumns = [
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    { id: 'startTime', label: 'Start Time' },
    { id: 'endTime', label: 'End Time' },
    { id: 'maxTrainees', label: 'Max Trainees' },
  ]

  const upcomingTrainings = trainings.filter((t) => 
    t.status === 'approved' && new Date(t.date) >= new Date()
  )
  const completedTrainings = trainings.filter((t) => t.status === 'completed')
  const cancelledTrainings = trainings.filter((t) => t.status === 'cancelled')
  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trainer Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAvailabilityModalOpen(true)}
        >
          Add Availability
        </Button>
      </Box>

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
                Pending Requests
              </Typography>
              <Typography variant="h4">{pendingRequests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Availability Slots
              </Typography>
              <Typography variant="h4">{availability.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upcoming Trainings" />
          <Tab label="Training Requests" />
          <Tab label="Training History" />
          <Tab label="Availability" />
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
          columns={requestColumns}
          data={pendingRequests}
          actions={[
            {
              icon: <Check />,
              tooltip: 'Accept Request',
              onClick: (row) => handleAcceptRequest(row.id),
              color: 'success',
            },
            {
              icon: <Close />,
              tooltip: 'Reject Request',
              onClick: (row) => handleRejectRequest(row.id),
              color: 'error',
            },
          ]}
        />
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Completed Trainings
          </Typography>
          <DataTable
            columns={trainingColumns}
            data={completedTrainings}
            actions={[
              {
                icon: <Typography>View</Typography>,
                tooltip: 'View Details',
                onClick: handleViewDetails,
              },
            ]}
          />
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Cancelled Trainings
          </Typography>
          <DataTable
            columns={trainingColumns}
            data={cancelledTrainings}
            actions={[
              {
                icon: <Typography>View</Typography>,
                tooltip: 'View Details',
                onClick: handleViewDetails,
              },
            ]}
          />
        </Box>
      )}

      {tabValue === 3 && (
        <DataTable columns={availabilityColumns} data={availability} />
      )}

      <Modal
        open={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        title="Add Availability"
      >
        <AvailabilityForm
          onSubmit={handleAvailabilitySubmit}
          onCancel={() => setAvailabilityModalOpen(false)}
        />
      </Modal>

      {selectedTraining && (
        <TrainingDetails
          open={detailsModalOpen}
          training={selectedTraining}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedTraining(null)
          }}
          onUpdateStatus={handleUpdateTrainingStatus}
        />
      )}
    </Box>
  )
}

export default TrainerDashboard

