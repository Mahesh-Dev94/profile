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
  Button,
  TextField,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import { trainingApi, userApi, requestApi } from '../services/mockApi'
import { setTrainings, setRequests } from '../store/slices/trainingSlice'
import { setTrainers, setTrainees, setClients, updateClient } from '../store/slices/userSlice'
import { addNotification } from '../store/slices/notificationSlice'
import { findConflicts, resolveConflictByPriority } from '../utils/scheduling'

const AdminDashboard = () => {
  const { trainings, requests } = useSelector((state) => state.training)
  const { trainers, trainees, clients } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  const [conflicts, setConflicts] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [newPriority, setNewPriority] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    detectConflicts()
  }, [trainings, requests])

  const loadData = async () => {
    try {
      const [trainingsData, requestsData, trainersData, traineesData, clientsData] = await Promise.all([
        trainingApi.getTrainings(),
        requestApi.getRequests(),
        userApi.getUsers('trainer'),
        userApi.getUsers('trainee'),
        userApi.getUsers('client'),
      ])
      dispatch(setTrainings(trainingsData))
      dispatch(setRequests(requestsData))
      dispatch(setTrainers(trainersData))
      dispatch(setTrainees(traineesData))
      dispatch(setClients(clientsData))
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const detectConflicts = () => {
    const detectedConflicts = []
    const activeTrainings = trainings.filter((t) => t.status !== 'cancelled')

    // Check for overlapping trainings with same trainer
    for (let i = 0; i < activeTrainings.length; i++) {
      for (let j = i + 1; j < activeTrainings.length; j++) {
        const t1 = activeTrainings[i]
        const t2 = activeTrainings[j]

        if (t1.trainerId === t2.trainerId && t1.date === t2.date) {
          const start1 = new Date(`${t1.date}T${t1.startTime}`)
          const end1 = new Date(`${t1.date}T${t1.endTime}`)
          const start2 = new Date(`${t2.date}T${t2.startTime}`)
          const end2 = new Date(`${t2.date}T${t2.endTime}`)

          if (start1 < end2 && start2 < end1) {
            detectedConflicts.push({
              training1: t1,
              training2: t2,
              type: 'overlap',
            })
          }
        }
      }
    }

    // Check pending requests against existing trainings
    requests
      .filter((r) => r.status === 'pending')
      .forEach((request) => {
        const requestConflicts = findConflicts(
          {
            date: request.date,
            startTime: request.startTime,
            endTime: request.endTime,
          },
          activeTrainings,
          request.trainerId
        )

        if (requestConflicts.length > 0) {
          detectedConflicts.push({
            request,
            conflicts: requestConflicts,
            type: 'request_conflict',
          })
        }
      })

    setConflicts(detectedConflicts)
  }

  const handleResolveConflict = async (conflict) => {
    if (conflict.type === 'request_conflict') {
      const resolution = resolveConflictByPriority(
        conflict.request,
        conflict.conflicts,
        clients
      )

      if (resolution.winner === 'new') {
        // Approve new request, reschedule or cancel conflicts
        await requestApi.updateRequest(conflict.request.id, { status: 'approved' })
        resolution.affectedTrainings.forEach(async (training) => {
          await trainingApi.updateTraining(training.id, { status: 'rescheduled' })
          dispatch(addNotification({
            userId: training.clientId,
            type: 'warning',
            message: `Your training on ${training.date} has been rescheduled due to priority conflict.`,
          }))
        })
      } else {
        // Reject new request
        await requestApi.updateRequest(conflict.request.id, { status: 'rejected' })
        dispatch(addNotification({
          userId: conflict.request.clientId,
          type: 'info',
          message: 'Your training request was rejected due to scheduling conflict.',
        }))
      }
    }
    loadData()
  }

  const handleUpdatePriority = async () => {
    if (!selectedClient || !newPriority) return

    try {
      await userApi.updateUser(selectedClient.id, {
        priorityScore: parseInt(newPriority),
      })
      dispatch(updateClient({
        id: selectedClient.id,
        priorityScore: parseInt(newPriority),
      }))
      dispatch(addNotification({
        userId: 'admin',
        type: 'success',
        message: `Priority score updated for ${selectedClient.name}`,
      }))
      setPriorityModalOpen(false)
      setSelectedClient(null)
      setNewPriority('')
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const handleOpenPriorityModal = (client) => {
    setSelectedClient(client)
    setNewPriority(client.priorityScore?.toString() || '0')
    setPriorityModalOpen(true)
  }

  const userColumns = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
  ]

  const clientColumns = [
    { id: 'name', label: 'Client Name' },
    { id: 'email', label: 'Email' },
    {
      id: 'priorityScore',
      label: 'Priority Score',
      render: (val) => val || 'N/A',
    },
    {
      id: 'rating',
      label: 'Rating',
      render: (val) => val || 'N/A',
    },
  ]

  const trainingColumns = [
    { id: 'title', label: 'Title' },
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    { id: 'startTime', label: 'Start Time' },
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
    { id: 'clientName', label: 'Client' },
    { id: 'trainerName', label: 'Trainer' },
  ]

  const conflictColumns = [
    { id: 'type', label: 'Conflict Type' },
    { id: 'details', label: 'Details' },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Trainings
              </Typography>
              <Typography variant="h4">{trainings.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Scheduling Conflicts
              </Typography>
              <Typography variant="h4" color="error">
                {conflicts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Clients
              </Typography>
              <Typography variant="h4">{clients.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Trainers
              </Typography>
              <Typography variant="h4">{trainers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Scheduling Conflicts" />
          <Tab label="All Trainings" />
          <Tab label="Clients" />
          <Tab label="Trainers" />
          <Tab label="Trainees" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          {conflicts.length === 0 ? (
            <Typography>No conflicts detected</Typography>
          ) : (
            conflicts.map((conflict, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conflict {index + 1}: {conflict.type}
                  </Typography>
                  {conflict.type === 'request_conflict' && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Request: {conflict.request.title} on {conflict.request.date}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Conflicts with {conflict.conflicts.length} existing training(s)
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleResolveConflict(conflict)}
                        sx={{ mt: 2 }}
                      >
                        Resolve Conflict
                      </Button>
                    </Box>
                  )}
                  {conflict.type === 'overlap' && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Training 1: {conflict.training1.title} on {conflict.training1.date}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Training 2: {conflict.training2.title} on {conflict.training2.date}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <DataTable columns={trainingColumns} data={trainings} />
      )}

      {tabValue === 2 && (
        <DataTable
          columns={clientColumns}
          data={clients}
          actions={[
            {
              icon: <Edit />,
              tooltip: 'Update Priority Score',
              onClick: handleOpenPriorityModal,
            },
          ]}
        />
      )}

      {tabValue === 3 && (
        <DataTable columns={userColumns} data={trainers} />
      )}

      {tabValue === 4 && (
        <DataTable columns={userColumns} data={trainees} />
      )}

      <Modal
        open={priorityModalOpen}
        onClose={() => {
          setPriorityModalOpen(false)
          setSelectedClient(null)
          setNewPriority('')
        }}
        title={`Update Priority Score - ${selectedClient?.name}`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setPriorityModalOpen(false)
              setSelectedClient(null)
              setNewPriority('')
            },
            variant: 'outlined',
          },
          {
            label: 'Update',
            onClick: handleUpdatePriority,
            variant: 'contained',
          },
        ]}
      >
        <TextField
          fullWidth
          type="number"
          label="Priority Score"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          inputProps={{ min: 0, max: 100 }}
          helperText="Higher score = higher priority (0-100)"
        />
      </Modal>
    </Box>
  )
}

export default AdminDashboard

