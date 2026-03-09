import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { Edit, ExpandMore, Person, Schedule, EventAvailable } from '@mui/icons-material'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'
import useLoader from '../hooks/useLoader'
import { trainingApi, userApi, requestApi, availabilityApi } from '../services/mockApi'
import { setTrainings, setRequests } from '../store/slices/trainingSlice'
import { setTrainers, setClients, updateClient } from '../store/slices/userSlice'
import { addNotification } from '../store/slices/notificationSlice'
import { findConflicts, resolveConflictByPriority } from '../utils/scheduling'
import AdminRequests from './admin/AdminRequests'
import AdminTrainers from './admin/AdminTrainers'
import AdminClients from './admin/AdminClients'
import AdminCreateUser from './admin/AdminCreateUser'

const AdminDashboard = () => {
  const { trainings, requests } = useSelector((state) => state.training)
  const { trainers, clients } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const { loading, withLoader } = useLoader()
  const [conflicts, setConflicts] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [newPriority, setNewPriority] = useState('')
  const [allAvailability, setAllAvailability] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    detectConflicts()
  }, [trainings, requests])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const [trainingsData, requestsData, trainersData, clientsData, availabilityData] = await Promise.all([
          trainingApi.getTrainings(),
          requestApi.getRequests(),
          userApi.getUsers('trainer'),
          userApi.getUsers('client'),
          availabilityApi.getAvailability(),
        ])
        dispatch(setTrainings(trainingsData))
        dispatch(setRequests(requestsData))
        dispatch(setTrainers(trainersData))
        dispatch(setClients(clientsData))
        setAllAvailability(availabilityData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }, 'Loading admin dashboard...')
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
    await withLoader(async () => {
      if (conflict.type === 'request_conflict') {
        const resolution = resolveConflictByPriority(
          conflict.request,
          conflict.conflicts,
          clients
        )

        if (resolution.winner === 'new') {
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
          await requestApi.updateRequest(conflict.request.id, { status: 'rejected' })
          dispatch(addNotification({
            userId: conflict.request.clientId,
            type: 'info',
            message: 'Your training request was rejected due to scheduling conflict.',
          }))
        }
      }
      loadData()
    }, 'Resolving conflict...')
  }

  const handleUpdatePriority = async () => {
    if (!selectedClient || !newPriority) return

    await withLoader(async () => {
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
        loadData()
      } catch (error) {
        console.error('Failed to update priority:', error)
      }
    }, 'Updating priority...')
  }

  const handleOpenPriorityModal = (client) => {
    setSelectedClient(client)
    setNewPriority(client.priorityScore?.toString() || '0')
    setPriorityModalOpen(true)
  }

  const userColumns = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
  ]

  const clientColumns = [
    { id: 'name', label: 'Client Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'priorityScore',
      label: 'Priority Score',
      render: (val) => val || 'N/A',
      minWidth: 120,
    },
    {
      id: 'rating',
      label: 'Rating',
      render: (val) => val || 'N/A',
      minWidth: 100,
    },
  ]

  const trainingColumns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    {
      id: 'date',
      label: 'Date',
      format: (val) => new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      minWidth: 120,
    },
    { id: 'startTime', label: 'Start Time', minWidth: 100 },
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
      minWidth: 100,
    },
    { id: 'clientName', label: 'Client', minWidth: 150 },
    { id: 'trainerName', label: 'Trainer', minWidth: 150 },
  ]

  const availabilityColumns = [
    {
      id: 'date',
      label: 'Date',
      format: (val) => new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      minWidth: 120,
    },
    { id: 'startTime', label: 'Start Time', minWidth: 100 },
    { id: 'endTime', label: 'End Time', minWidth: 100 },
    { id: 'maxTrainees', label: 'Max Trainees', minWidth: 100 },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Chip
          label={val}
          color={val === 'open' ? 'success' : 'default'}
          size="small"
        />
      ),
      minWidth: 100,
    },
  ]

  const getTrainerAvailability = (trainerId) => {
    return allAvailability.filter((a) => a.trainerId === trainerId)
  }

  if (loading && trainers.length === 0) {
    return <Loader fullScreen message="Loading admin dashboard..." />
  }

  return (
    <Routes>
      <Route
        index
        element={
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
              Admin Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Schedule sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {trainings.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Trainings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Schedule sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {conflicts.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Scheduling Conflicts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Person sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {trainers.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Trainers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <EventAvailable sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {allAvailability.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Open Slots
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* All Trainers with Availability */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                All Trainers & Availability
              </Typography>
              {trainers.map((trainer) => {
                const trainerAvailability = getTrainerAvailability(trainer.id)
                return (
                  <Accordion key={trainer.id} sx={{ mb: 2, backgroundColor: '#1E1E1E' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Person sx={{ color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {trainer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trainer.email} • {trainer.specialization} • {trainerAvailability.length} open slots
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Specialization: {trainer.specialization} | Experience: {trainer.experience} | Rating: {trainer.rating}
                        </Typography>
                      </Box>
                      {trainerAvailability.length > 0 ? (
                        <DataTable columns={availabilityColumns} data={trainerAvailability} />
                      ) : (
                        <Typography color="text.secondary">No open slots available</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>

            {/* Scheduling Conflicts */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Scheduling Conflicts
              </Typography>
              {conflicts.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No conflicts detected</Typography>
                </Paper>
              ) : (
                conflicts.map((conflict, index) => (
                  <Card key={index} sx={{ mb: 2, backgroundColor: '#1E1E1E' }}>
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

            {/* All Trainings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                All Trainings
              </Typography>
              <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                <DataTable columns={trainingColumns} data={trainings} />
              </Paper>
            </Box>

            {/* Clients */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Clients
              </Typography>
              <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
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
              </Paper>
            </Box>

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
        }
      />
      <Route path="requests" element={<AdminRequests />} />
      <Route path="trainers" element={<AdminTrainers />} />
      <Route path="clients" element={<AdminClients />} />
      <Route path="users/create" element={<AdminCreateUser />} />
    </Routes>
  )
}

export default AdminDashboard
