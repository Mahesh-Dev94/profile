import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { Add as AddIcon, Visibility, Check, Close, Schedule, EventAvailable, Edit } from '@mui/icons-material'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import AvailabilityForm from '../components/trainer/AvailabilityForm'
import TrainingDetails from '../components/trainer/TrainingDetails'
import Loader from '../components/common/Loader'
import useLoader from '../hooks/useLoader'
import { trainingApi, availabilityApi, requestApi, notificationApi, userApi } from '../services/mockApi'
import { setTrainings, setAvailability, setRequests } from '../store/slices/trainingSlice'
import { addNotification } from '../store/slices/notificationSlice'

const TrainerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { trainings, availability, requests } = useSelector((state) => state.training)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, withLoader } = useLoader()
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionComment, setRejectionComment] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [offerReschedule, setOfferReschedule] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [costNegotiationDialogOpen, setCostNegotiationDialogOpen] = useState(false)
  const [trainerProposedCost, setTrainerProposedCost] = useState(0)
  const [trainerRemarks, setTrainerRemarks] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const [trainingsData, availabilityData, requestsData] = await Promise.all([
          trainingApi.getTrainings({ userId: user.id, role: 'trainer' }),
          availabilityApi.getAvailability(user.id),
          requestApi.getRequests({ trainerId: user.id }), // Get all requests assigned to this trainer
        ])
        dispatch(setTrainings(trainingsData))
        dispatch(setAvailability(availabilityData))
        dispatch(setRequests(requestsData))
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }, 'Loading dashboard...')
  }

  const handleAvailabilitySubmit = async (slotData) => {
    await withLoader(async () => {
      try {
        await availabilityApi.createAvailability({
          ...slotData,
          trainerId: user.id,
        })
        dispatch(addNotification({
          userId: user.id,
          type: 'info',
          message: 'Open slot created successfully',
        }))
        setAvailabilityModalOpen(false)
        loadData()
      } catch (error) {
        console.error('Failed to create availability:', error)
        alert('Failed to create availability slot')
      }
    }, 'Creating open slot...')
  }

  const handleNegotiateCost = async (request) => {
    setSelectedRequest(request)
    // Only use admin's proposed cost, not client's original cost
    setTrainerProposedCost(request.adminProposedCost || 1000)
    setCostNegotiationDialogOpen(true)
  }

  const handleForwardToAdmin = async () => {
    if (!selectedRequest || !trainerProposedCost || trainerProposedCost <= 0) {
      alert('Please enter a valid proposed cost')
      return
    }

    await withLoader(async () => {
      try {
        // Forward cost proposal to admin
        await requestApi.updateRequest(selectedRequest.id, {
          trainerProposedCost: trainerProposedCost,
          workflowStatus: 'cost_negotiation_admin',
          costStatus: 'pending_admin_approval',
          trainerRemarks: trainerRemarks || '', // Trainer remarks visible to admin
        })

        // Notify all admins
        const admins = await userApi.getUsers('admin')
        for (const admin of admins) {
          await notificationApi.createNotification({
            userId: admin.id,
            type: 'info',
            message: `Trainer ${user.name} has proposed cost ₹${trainerProposedCost} for training request "${selectedRequest.title}". Please review.`,
          })
        }

        dispatch(addNotification({
          userId: user.id,
          type: 'info',
          message: `Cost proposal (₹${trainerProposedCost}) forwarded to admin for approval.`,
        }))

        setCostNegotiationDialogOpen(false)
        setSelectedRequest(null)
        setTrainerProposedCost(0)
        setTrainerRemarks('')
        loadData()
      } catch (error) {
        console.error('Failed to forward to admin:', error)
        alert('Failed to forward to admin')
      }
    }, 'Forwarding to admin...')
  }

  const handleCostNegotiationConfirm = async () => {
    if (!selectedRequest || !trainerProposedCost || trainerProposedCost <= 0) {
      alert('Please enter a valid proposed cost')
      return
    }

    await withLoader(async () => {
      try {
        // Only use admin's proposed cost, not client's original cost
        const currentCost = selectedRequest.adminProposedCost || 1000
        if (trainerProposedCost === currentCost) {
          // Accept with current cost
          await handleAcceptRequestConfirm(selectedRequest, trainerProposedCost, trainerRemarks)
        } else {
          // Cost is different, user needs to click "Forward to Admin" button
          alert('Cost is different from admin\'s proposed cost. Please click "Forward to Admin" button to send your proposal.')
          return
        }

        setCostNegotiationDialogOpen(false)
        setSelectedRequest(null)
        setTrainerProposedCost(0)
        setTrainerRemarks('')
        loadData()
      } catch (error) {
        console.error('Failed to accept request:', error)
        alert('Failed to accept request')
      }
    }, 'Accepting request...')
  }

  const handleAcceptRequestConfirm = async (request, finalCost, remarks = '') => {
    // Update request status
    await requestApi.updateRequest(request.id, { 
      status: 'approved', 
      workflowStatus: 'approved_by_trainer',
      // Only use admin's proposed cost, not client's original cost
      finalCost: finalCost || request.adminProposedCost || 1000,
      trainerRemarks: remarks || '', // Trainer remarks visible to admin
    })

    // Create a new training entry
    await trainingApi.createTraining({
      title: request.title,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      trainerId: user.id,
      trainerName: user.name,
      clientId: request.clientId,
      clientName: request.clientName,
      status: 'approved',
      numberOfTrainees: request.numberOfTrainees,
      description: request.description,
      // Only use admin's proposed cost, not client's original cost
      proposedCost: finalCost || request.adminProposedCost || 1000,
      traineeEmails: request.emailId, // Store trainee emails
    })

    // Notify trainer
    dispatch(addNotification({
      userId: user.id,
      type: 'success',
      message: `Training request "${request.title}" accepted`,
    }))

    // Notify client
    await notificationApi.createNotification({
      userId: request.clientId,
      type: 'success',
      message: `Your training request "${request.title}" has been approved by the trainer.`,
    })
  }

  const handleAcceptRequest = async (request) => {
    // Check if cost negotiation is needed
    // Only use admin's proposed cost, not client's original cost
    const currentCost = request.adminProposedCost || 1000
    setSelectedRequest(request)
    setTrainerProposedCost(currentCost)
    setTrainerRemarks('')
    setCostNegotiationDialogOpen(true)
  }

  const handleRejectRequest = async (request) => {
    setSelectedRequest(request)
    setRejectionComment('')
    setTrainerRemarks('')
    setRescheduleDate('')
    setOfferReschedule(false)
    setRejectionModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectionComment.trim()) {
      alert('Please provide a rejection comment')
      return
    }

    await withLoader(async () => {
      try {
        const updateData = {
          status: 'rejected',
          rejectionComment: rejectionComment,
          workflowStatus: 'rejected',
          trainerRemarks: trainerRemarks || rejectionComment, // Trainer remarks visible to admin
        }

        if (offerReschedule && rescheduleDate) {
          updateData.rescheduleDate = rescheduleDate
          updateData.rescheduleOffered = true
        }

        await requestApi.updateRequest(selectedRequest.id, updateData)

        // Notify client
        await notificationApi.createNotification({
          userId: selectedRequest.clientId,
          type: 'error',
          message: `Your training request "${selectedRequest.title}" has been rejected. ${rejectionComment}${offerReschedule && rescheduleDate ? ` Reschedule offered for ${rescheduleDate}` : ''}`,
        })

        setRejectionModalOpen(false)
        setSelectedRequest(null)
        setRejectionComment('')
        setTrainerRemarks('')
        setRescheduleDate('')
        setOfferReschedule(false)
        loadData()
      } catch (error) {
        console.error('Failed to reject request:', error)
        alert('Failed to reject request')
      }
    }, 'Rejecting request...')
  }

  const handleViewDetails = (training) => {
    setSelectedTraining(training)
    setDetailsModalOpen(true)
  }

  const handleUpdateTrainingStatus = async (trainingId, status) => {
    await withLoader(async () => {
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
    }, 'Updating training...')
  }

  const totalTrainings = trainings.length
  const upcomingTrainings = trainings.filter((t) => {
    const trainingDate = new Date(t.date)
    return (t.status === 'approved' || t.status === 'in-progress') &&
           trainingDate >= new Date()
  })
  const openSlots = availability.filter((a) => a.status === 'open')
  // Show requests that admin has approved and assigned to this trainer
  // Include both 'trainer_review' and 'cost_negotiation_client' (when admin approved but client needs to approve cost)
  const pendingRequests = requests.filter((r) => 
    r.trainerId === user.id &&
    (r.workflowStatus === 'trainer_review' || 
     (r.workflowStatus === 'cost_negotiation_client' && r.status === 'admin_approved'))
  )
  const completedTrainings = trainings.filter((t) => t.status === 'completed')
  const cancelledTrainings = trainings.filter((t) => t.status === 'cancelled')

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
    { id: 'endTime', label: 'End Time', minWidth: 100 },
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
    {
      id: 'trainees',
      label: 'Trainees',
      format: (val) => val?.length || 0,
      minWidth: 80,
    },
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

  const requestColumns = [
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
      id: 'numberOfTrainees',
      label: 'Number of Trainees',
      minWidth: 130,
    },
    {
      id: 'proposedCost',
      label: 'Proposed Cost',
      render: (val, row) => {
        // Only show admin's proposed cost, not client's original cost
        const currentCost = row.adminProposedCost || row.trainerProposedCost || 1000
        return `₹${currentCost}`
      },
      minWidth: 120,
    },
    {
      id: 'adminRemarks',
      label: 'Admin Remarks',
      render: (val, row) => {
        return row.adminRemarks ? (row.adminRemarks.length > 50 ? `${row.adminRemarks.substring(0, 50)}...` : row.adminRemarks) : 'N/A'
      },
      minWidth: 200,
    },
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
      minWidth: 100,
    },
  ]

  if (loading && totalTrainings === 0) {
    return <Loader fullScreen message="Loading dashboard..." />
  }

  return (
    <>
      <Routes>
        <Route
          index
          element={
            <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Trainer Dashboard
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAvailabilityModalOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #64B5F6 30%, #CE93D8 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #42A5F5 30%, #BA68C8 90%)',
                  },
                }}
              >
                Create Open Slot
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4, width: '100%', mx: 0 }}>
              <Grid item xs={12} sm={6} md={4}>
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
                      {totalTrainings}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Trainings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Schedule sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {upcomingTrainings.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Upcoming Trainings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
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
                      {openSlots.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Open Slots
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Training Requests
              </Typography>
              {pendingRequests.length > 0 ? (
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                  <DataTable
                    columns={requestColumns}
                    data={pendingRequests}
                    actions={[
                      {
                        icon: <Check />,
                        tooltip: 'Accept Request',
                        onClick: (row) => handleAcceptRequest(row),
                        color: 'success',
                      },
                      {
                        icon: <Close />,
                        tooltip: 'Reject Request',
                        onClick: handleRejectRequest,
                        color: 'error',
                      },
                    ]}
                  />
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No pending requests</Typography>
                </Paper>
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Upcoming Trainings
              </Typography>
              {upcomingTrainings.length > 0 ? (
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
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
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No upcoming trainings</Typography>
                </Paper>
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Open Slots
              </Typography>
              {openSlots.length > 0 ? (
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                  <DataTable columns={availabilityColumns} data={openSlots} />
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No open slots available</Typography>
                </Paper>
              )}
            </Box>

            <Modal
              open={availabilityModalOpen}
              onClose={() => setAvailabilityModalOpen(false)}
              title="Create Open Slot"
              maxWidth="md"
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
        }
        />
        <Route
          path="availability"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Manage Availability
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAvailabilityModalOpen(true)}
              sx={{ mb: 3 }}
            >
              Create Open Slot
            </Button>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
              <DataTable
                columns={availabilityColumns}
                data={availability}
                actions={[
                  {
                    icon: <Edit />,
                    tooltip: 'Modify Slot',
                    onClick: (row) => {
                      setEditingSlot(row)
                      setAvailabilityModalOpen(true)
                    },
                  },
                ]}
              />
            </Paper>
            <Modal
              open={availabilityModalOpen}
              onClose={() => setAvailabilityModalOpen(false)}
              title="Create Open Slot"
              maxWidth="md"
            >
              <AvailabilityForm
                onSubmit={handleAvailabilitySubmit}
                onCancel={() => setAvailabilityModalOpen(false)}
              />
            </Modal>
          </Box>
        }
        />
        <Route
          path="schedule"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              View Schedule
            </Typography>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
              <DataTable columns={trainingColumns} data={trainings} />
            </Paper>
          </Box>
        }
        />
        <Route
          path="requests"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Training Requests
            </Typography>
            {pendingRequests.length > 0 ? (
              <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                <DataTable
                  columns={requestColumns}
                  data={pendingRequests}
                  actions={[
                    {
                      icon: <Check />,
                      tooltip: 'Accept Request',
                      onClick: (row) => handleAcceptRequest(row),
                      color: 'success',
                    },
                    {
                      icon: <Close />,
                      tooltip: 'Reject Request',
                      onClick: handleRejectRequest,
                      color: 'error',
                    },
                  ]}
                />
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                <Typography color="text.secondary">No training requests forwarded by admin</Typography>
              </Paper>
            )}
          </Box>
        }
        />
        <Route
          path="trainings/upcoming"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Upcoming Trainings
            </Typography>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
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
            </Paper>
          </Box>
        }
        />
        <Route
          path="trainings/completed"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Completed Trainings
            </Typography>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
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
            </Paper>
          </Box>
        }
        />
        <Route
          path="trainings/cancelled"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Cancelled Trainings
            </Typography>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
              <DataTable
                columns={trainingColumns}
                data={cancelledTrainings}
                actions={[
                  {
                    icon: <Visibility />,
                    tooltip: 'View Details',
                    onClick: handleViewDetails,
                  },
                ]}
              />
            </Paper>
          </Box>
        }
        />
        <Route
          path="history"
          element={
            <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Training History
            </Typography>
            <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
              <DataTable columns={trainingColumns} data={trainings} />
            </Paper>
          </Box>
        }
        />
      </Routes>

      {/* Cost Negotiation Dialog */}
      <Dialog open={costNegotiationDialogOpen} onClose={() => setCostNegotiationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Accept Request & Negotiate Cost</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Request: {selectedRequest?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Number of Trainees: {selectedRequest?.numberOfTrainees || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Proposed Cost: ₹{selectedRequest?.adminProposedCost || 1000}
            </Typography>
            {selectedRequest?.adminRemarks && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.dark', borderRadius: 1 }}>
                <Typography variant="body2" color="white" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Admin Remarks:
                </Typography>
                <Typography variant="body2" color="white">
                  {selectedRequest.adminRemarks}
                </Typography>
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            type="number"
            label="Your Proposed Cost (₹)"
            value={trainerProposedCost}
            onChange={(e) => setTrainerProposedCost(Number(e.target.value))}
            inputProps={{ min: 0, step: 100 }}
            helperText="You can propose a different cost based on number of trainees. If same as current, request will be accepted directly."
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Trainer Remarks (Visible to Admin)"
            value={trainerRemarks}
            onChange={(e) => setTrainerRemarks(e.target.value)}
            helperText="Add remarks that will be visible to admin"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCostNegotiationDialogOpen(false)
            setSelectedRequest(null)
            setTrainerProposedCost(0)
            setTrainerRemarks('')
          }}>Cancel</Button>
          {trainerProposedCost !== (selectedRequest?.adminProposedCost || 1000) && trainerProposedCost > 0 && (
            <Button onClick={handleForwardToAdmin} variant="contained" color="primary" disabled={!trainerProposedCost || trainerProposedCost <= 0}>
              Forward to Admin
            </Button>
          )}
          <Button onClick={handleCostNegotiationConfirm} variant="contained" color="success" disabled={!trainerProposedCost || trainerProposedCost <= 0}>
            {trainerProposedCost === (selectedRequest?.adminProposedCost || 1000) ? 'Accept Request' : 'Accept with Current Cost'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionModalOpen} onClose={() => setRejectionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Training Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Request: {selectedRequest?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Client: {selectedRequest?.clientName}
            </Typography>
            {selectedRequest?.adminRemarks && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.dark', borderRadius: 1 }}>
                <Typography variant="body2" color="white" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Admin Remarks:
                </Typography>
                <Typography variant="body2" color="white">
                  {selectedRequest.adminRemarks}
                </Typography>
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Comment (Required)"
            value={rejectionComment}
            onChange={(e) => setRejectionComment(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            required
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Trainer Remarks (Visible to Admin)"
            value={trainerRemarks}
            onChange={(e) => setTrainerRemarks(e.target.value)}
            helperText="Add remarks that will be visible to admin"
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={offerReschedule}
                onChange={(e) => setOfferReschedule(e.target.checked)}
              />
            }
            label="Offer Reschedule"
            sx={{ mt: 2 }}
          />
          {offerReschedule && (
            <TextField
              margin="dense"
              id="rescheduleDate"
              label="Proposed Reschedule Date"
              type="date"
              fullWidth
              variant="outlined"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectionModalOpen(false)
            setSelectedRequest(null)
            setRejectionComment('')
            setTrainerRemarks('')
            setRescheduleDate('')
            setOfferReschedule(false)
          }}>Cancel</Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={!rejectionComment.trim()}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TrainerDashboard
