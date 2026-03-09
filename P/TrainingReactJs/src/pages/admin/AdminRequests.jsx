import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import { CheckCircle, Cancel, Visibility, Schedule } from '@mui/icons-material'
import DataTable from '../../components/common/DataTable'
import { requestApi, userApi, notificationApi, trainingApi } from '../../services/mockApi'
import { setRequests, setTrainings } from '../../store/slices/trainingSlice'
import { setClients } from '../../store/slices/userSlice'
import useLoader from '../../hooks/useLoader'
import Loader from '../../components/common/Loader'

const AdminRequests = () => {
  const dispatch = useDispatch()
  const { requests } = useSelector((state) => state.training)
  const { clients } = useSelector((state) => state.users)
  const { loading, withLoader } = useLoader()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [action, setAction] = useState(null) // 'approve' or 'reject'
  const [rejectionComment, setRejectionComment] = useState('')
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const [trainers, setTrainers] = useState([])
  const [costNegotiationDialogOpen, setCostNegotiationDialogOpen] = useState(false)
  const [adminProposedCost, setAdminProposedCost] = useState(0)
  const [costNegotiationType, setCostNegotiationType] = useState('') // 'client' or 'trainer'
  const [trainerCostApprovalDialogOpen, setTrainerCostApprovalDialogOpen] = useState(false)
  const [adminRemarks, setAdminRemarks] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const [requestsData, clientsData, trainersData] = await Promise.all([
          requestApi.getRequests(),
          userApi.getUsers('client'),
          userApi.getUsers('trainer'),
        ])
        dispatch(setRequests(requestsData))
        dispatch(setClients(clientsData))
        setTrainers(trainersData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }, 'Loading requests...')
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.workflowStatus === 'admin_review')
  // Requests with trainer cost proposals
  const trainerCostProposals = requests.filter((r) => r.workflowStatus === 'cost_negotiation_admin' && r.costStatus === 'pending_admin_approval')
  
  // Sort by client priority (higher priority first)
  const sortedRequests = [...pendingRequests].sort((a, b) => {
    const clientA = clients.find((c) => c.id === a.clientId)
    const clientB = clients.find((c) => c.id === b.clientId)
    const priorityA = clientA?.priorityScore || 0
    const priorityB = clientB?.priorityScore || 0
    return priorityB - priorityA
  })

  const handleApprove = async (request) => {
    setSelectedRequest(request)
    setAction('approve')
    setSelectedTrainerId(request.trainerId || '')
    // Default to existing admin cost or client's cost
    setAdminProposedCost(request.adminProposedCost || request.proposedCost || 1000)
    setAdminRemarks(request.adminRemarks || '')
    setApprovalDialogOpen(true)
  }

  const handleReject = async (request) => {
    setSelectedRequest(request)
    setAction('reject')
    setRejectionComment('')
    setRejectionDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return

    await withLoader(async () => {
      try {
        // Check for conflicts with same trainer and time
        const allTrainings = await trainingApi.getTrainings()
        const conflicts = allTrainings.filter(
          (t) =>
            t.trainerId === selectedTrainerId &&
            t.date === selectedRequest.date &&
            t.status !== 'cancelled' &&
            ((t.startTime <= selectedRequest.startTime && t.endTime > selectedRequest.startTime) ||
              (t.startTime < selectedRequest.endTime && t.endTime >= selectedRequest.endTime))
        )

        if (conflicts.length > 0) {
          // Check priority
          const requestClient = clients.find((c) => c.id === selectedRequest.clientId)
          const conflictClients = conflicts.map((c) => clients.find((cl) => cl.id === c.clientId)).filter(Boolean)
          
          const highestPriorityConflict = conflictClients.reduce((max, client) => {
            return (client.priorityScore || 0) > (max?.priorityScore || 0) ? client : max
          }, null)

          if (highestPriorityConflict && (highestPriorityConflict.priorityScore || 0) > (requestClient?.priorityScore || 0)) {
            alert(`Cannot approve: Higher priority client (${highestPriorityConflict.name}) already has training at this time.`)
            setApprovalDialogOpen(false)
            return
          }

          // Reschedule lower priority trainings
          for (const conflict of conflicts) {
            const conflictClient = clients.find((c) => c.id === conflict.clientId)
            if ((conflictClient?.priorityScore || 0) < (requestClient?.priorityScore || 0)) {
              await trainingApi.updateTraining(conflict.id, { status: 'rescheduled' })
              await notificationApi.createNotification({
                userId: conflict.clientId,
                type: 'warning',
                message: `Your training "${conflict.title}" on ${conflict.date} has been rescheduled due to higher priority client.`,
              })
            }
          }
        }

        // Admin sets cost for trainer (can be different from client's proposed cost)
        // Admin keeps the difference as charges
        const clientCost = selectedRequest.proposedCost || 1000
        const trainerCost = adminProposedCost || clientCost

        // Approve request and forward to trainer
        // Always send to trainer_review when admin approves, even if cost negotiation is needed
        const updateData = {
          status: 'admin_approved',
          workflowStatus: 'trainer_review', // Always forward to trainer when admin approves
          trainerId: selectedTrainerId || selectedRequest.trainerId,
          adminProposedCost: trainerCost, // Cost trainer will see
          adminRemarks: adminRemarks || '', // Admin remarks visible to trainer
        }

        // If admin set a different cost (lower than client's), also forward to client for approval
        // But trainer can still see it
        if (trainerCost !== clientCost && trainerCost < clientCost) {
          updateData.costStatus = 'pending_client_approval'
          // Keep workflowStatus as trainer_review so trainer can see it
        }

        await requestApi.updateRequest(selectedRequest.id, updateData)

        // Notify trainer
        const trainerId = selectedTrainerId || selectedRequest.trainerId
        if (trainerId) {
          await notificationApi.createNotification({
            userId: trainerId,
            type: 'info',
            message: `New training request approved by admin: ${selectedRequest.title} on ${selectedRequest.date}`,
            requestId: selectedRequest.id,
          })
        }

        // Notify client
        // Reuse clientCost and trainerCost already declared above
        if (trainerCost < clientCost) {
          const adminCharges = clientCost - trainerCost
          await notificationApi.createNotification({
            userId: selectedRequest.clientId,
            type: 'info',
            message: `Admin has set trainer cost to ₹${trainerCost} (admin charges: ₹${adminCharges}) for your training request "${selectedRequest.title}". Please review and approve.`,
          })
        } else {
          await notificationApi.createNotification({
            userId: selectedRequest.clientId,
            type: 'success',
            message: `Your training request "${selectedRequest.title}" has been approved by admin and forwarded to trainer.`,
          })
        }

        setApprovalDialogOpen(false)
        setAdminProposedCost(0)
        setAdminRemarks('')
        loadData()
      } catch (error) {
        console.error('Failed to approve request:', error)
        alert('Failed to approve request')
      }
    }, 'Approving request...')
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectionComment.trim()) {
      alert('Please provide a rejection comment')
      return
    }

    await withLoader(async () => {
      try {
        await requestApi.updateRequest(selectedRequest.id, {
          status: 'rejected',
          rejectionComment: rejectionComment,
          workflowStatus: 'rejected',
        })

        await notificationApi.createNotification({
          userId: selectedRequest.clientId,
          type: 'error',
          message: `Your training request "${selectedRequest.title}" has been rejected. Reason: ${rejectionComment}`,
        })

        setRejectionDialogOpen(false)
        setRejectionComment('')
        loadData()
      } catch (error) {
        console.error('Failed to reject request:', error)
        alert('Failed to reject request')
      }
    }, 'Rejecting request...')
  }

  const handleTrainerCostApproval = async (request, approved) => {
    await withLoader(async () => {
      try {
        if (approved) {
          // Admin approved trainer's cost proposal
          await requestApi.updateRequest(request.id, {
            costStatus: 'approved_by_admin',
            workflowStatus: 'trainer_review',
            adminProposedCost: request.trainerProposedCost, // Update admin's proposed cost to trainer's proposal
            finalCost: request.trainerProposedCost, // Set final cost
          })

          await notificationApi.createNotification({
            userId: request.trainerId,
            type: 'success',
            message: `Admin approved your cost proposal ₹${request.trainerProposedCost} for training request "${request.title}".`,
          })

          await notificationApi.createNotification({
            userId: request.clientId,
            type: 'info',
            message: `Cost ₹${request.trainerProposedCost} approved for your training request "${request.title}".`,
          })
        } else {
          // Admin rejected trainer's cost proposal, keep original cost
          await requestApi.updateRequest(request.id, {
            costStatus: 'rejected_by_admin',
            workflowStatus: 'trainer_review',
          })

          await notificationApi.createNotification({
            userId: request.trainerId,
            type: 'warning',
            message: `Admin rejected your cost proposal for training request "${request.title}". Original cost will be used.`,
          })
        }

        loadData()
      } catch (error) {
        console.error('Failed to process trainer cost approval:', error)
        alert('Failed to process cost approval')
      }
    }, approved ? 'Approving cost...' : 'Rejecting cost...')
  }

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
    { id: 'clientName', label: 'Client', minWidth: 150 },
    {
      id: 'numberOfTrainees',
      label: 'Number of Trainees',
      minWidth: 130,
    },
    {
      id: 'priority',
      label: 'Client Priority',
      render: (val, row) => {
        const client = clients.find((c) => c.id === row.clientId)
        return client?.priorityScore || 'N/A'
      },
      minWidth: 120,
    },
    {
      id: 'clientProposedCost',
      label: 'Client Proposed Cost',
      render: (val, row) => {
        return `₹${row.proposedCost || 1000}`
      },
      minWidth: 150,
    },
    {
      id: 'adminProposedCost',
      label: 'Admin Proposed Cost',
      render: (val, row) => {
        return row.adminProposedCost ? `₹${row.adminProposedCost}` : 'Not Set'
      },
      minWidth: 150,
    },
    {
      id: 'trainerProposedCost',
      label: 'Trainer Proposed Cost',
      render: (val, row) => {
        return row.trainerProposedCost ? `₹${row.trainerProposedCost}` : 'N/A'
      },
      minWidth: 150,
    },
    {
      id: 'adminCharges',
      label: 'Admin Charges',
      render: (val, row) => {
        const clientCost = row.proposedCost || 1000
        // Use trainer's proposed cost if available, otherwise use admin's proposed cost
        const finalTrainerCost = row.trainerProposedCost || row.adminProposedCost
        if (finalTrainerCost && finalTrainerCost < clientCost) {
          const charges = clientCost - finalTrainerCost
          return `₹${charges}`
        }
        return 'N/A'
      },
      minWidth: 130,
    },
    {
      id: 'description',
      label: 'Description',
      render: (val) => {
        return val ? (val.length > 50 ? `${val.substring(0, 50)}...` : val) : 'N/A'
      },
      minWidth: 200,
    },
    {
      id: 'trainerRemarks',
      label: 'Trainer Remarks',
      render: (val, row) => {
        return row.trainerRemarks ? (row.trainerRemarks.length > 50 ? `${row.trainerRemarks.substring(0, 50)}...` : row.trainerRemarks) : 'N/A'
      },
      minWidth: 200,
    },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Chip
          label={val === 'admin_approved' ? 'Admin Approved' : val}
          color={val === 'admin_approved' ? 'success' : 'warning'}
          size="small"
        />
      ),
      minWidth: 120,
    },
  ]

  if (loading) {
    return <Loader fullScreen message="Loading requests..." />
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Training Requests - Admin Review
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Requests are sorted by client priority (highest first). Review and approve/reject requests before they go to trainers.
      </Alert>

      {/* Trainer Cost Proposals Section */}
      {trainerCostProposals.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Trainer Cost Proposals
          </Typography>
          <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
            <DataTable
              columns={requestColumns}
              data={trainerCostProposals}
              actions={[
                {
                  icon: <CheckCircle />,
                  tooltip: 'Approve Trainer Cost',
                  onClick: (row) => handleTrainerCostApproval(row, true),
                  color: 'success',
                },
                {
                  icon: <Cancel />,
                  tooltip: 'Reject Trainer Cost',
                  onClick: (row) => handleTrainerCostApproval(row, false),
                  color: 'error',
                },
              ]}
            />
          </Paper>
        </Box>
      )}

      {sortedRequests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
          <Typography color="text.secondary">No pending requests for review</Typography>
        </Paper>
      ) : (
        <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
          <DataTable
            columns={requestColumns}
            data={sortedRequests}
            actions={[
              {
                icon: <Visibility />,
                tooltip: 'View Details',
                onClick: (row) => {
                  setSelectedRequest(row)
                  // Show details modal
                },
              },
              {
                icon: <CheckCircle />,
                tooltip: 'Approve & Negotiate Cost',
                onClick: handleApprove,
                color: 'success',
              },
              {
                icon: <Cancel />,
                tooltip: 'Reject Request',
                onClick: handleReject,
                color: 'error',
              },
            ]}
          />
        </Paper>
      )}

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialogOpen} 
        onClose={() => setApprovalDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #64B5F6 0%, #CE93D8 100%)',
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            px: 2.5,
            borderBottom: 'none',
          }}
        >
          Approve Training Request
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 1.5, 
              mb: 2,
              '& > *': {
                fontSize: '0.8125rem',
              }
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Request Title
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest?.title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Client
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest?.clientName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest?.date}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest?.startTime} - {selectedRequest?.endTime}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Number of Trainees
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest?.numberOfTrainees || 0}
                </Typography>
              </Box>
            </Box>
            {selectedRequest?.description && (
              <Box sx={{ 
                mt: 1.5, 
                p: 1.5, 
                backgroundColor: 'rgba(100, 181, 246, 0.1)', 
                border: '1px solid', 
                borderColor: 'primary.main', 
                borderRadius: 1.5,
                borderLeftWidth: 3,
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.8125rem' }}>
                  {selectedRequest.description}
                </Typography>
              </Box>
            )}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 1.5, 
              mt: 2,
              p: 1.5,
              backgroundColor: 'rgba(100, 181, 246, 0.08)',
              borderRadius: 1.5,
              border: '1px solid rgba(100, 181, 246, 0.2)',
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Client Proposed Cost
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  ₹{selectedRequest?.proposedCost || 1000}
                </Typography>
              </Box>
              {selectedRequest?.trainerProposedCost && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Trainer Proposed Cost
                  </Typography>
                  <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    ₹{selectedRequest.trainerProposedCost}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Cost for Trainer (₹)"
              value={adminProposedCost || selectedRequest?.adminProposedCost || ''}
              onChange={(e) => setAdminProposedCost(Number(e.target.value))}
              inputProps={{ min: 0, step: 100 }}
              helperText={`Set the cost trainer will see. Admin charges: ₹${selectedRequest?.proposedCost || 1000} - (trainer cost) = ₹${((selectedRequest?.proposedCost || 1000) - (adminProposedCost || selectedRequest?.adminProposedCost || 0))}`}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                }
              }}
            />
            {adminProposedCost > 0 && adminProposedCost < (selectedRequest?.proposedCost || 1000) && (
              <Box sx={{ 
                mt: 1.5, 
                p: 1.5, 
                backgroundColor: 'success.dark', 
                borderRadius: 1.5,
                border: '1px solid rgba(76, 175, 80, 0.3)',
              }}>
                <Typography variant="body2" color="white" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                  Admin Charges: ₹{(selectedRequest?.proposedCost || 1000) - adminProposedCost}
                </Typography>
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Remarks (Visible to Trainer)"
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            helperText="Add remarks that will be visible to the trainer"
            sx={{ mt: 2 }}
            size="small"
          />
          <FormControl fullWidth sx={{ mt: 2 }} size="small">
            <InputLabel>Assign Trainer</InputLabel>
            <Select
              value={selectedTrainerId}
              label="Assign Trainer"
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
              size="small"
              sx={{
                borderRadius: 1.5,
              }}
            >
              {trainers.map((trainer) => (
                <MenuItem key={trainer.id} value={trainer.id}>
                  {trainer.name} ({trainer.specialization})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: 'background.paper' }}>
          <Button 
            onClick={() => setApprovalDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8125rem',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApproveConfirm} 
            variant="contained" 
            color="success" 
            disabled={!selectedTrainerId || adminProposedCost <= 0}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8125rem',
              px: 2.5,
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #43a047 0%, #4caf50 100%)',
              },
            }}
          >
            Approve & Forward
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Training Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Request: {selectedRequest?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Client: {selectedRequest?.clientName}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason (Required)"
            value={rejectionComment}
            onChange={(e) => setRejectionComment(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
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
    </Box>
  )
}

export default AdminRequests

