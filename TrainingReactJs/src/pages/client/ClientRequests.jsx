import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility,
  Pending,
  CheckCircle,
  Cancel,
  Schedule,
  ArrowBack,
  Edit,
} from '@mui/icons-material'
import DataTable from '../../components/common/DataTable'
import TrainingDetails from '../../components/client/TrainingDetails'
import { useState, useEffect } from 'react'
import { requestApi, notificationApi } from '../../services/mockApi'
import { setRequests } from '../../store/slices/trainingSlice'
import useLoader from '../../hooks/useLoader'
import Loader from '../../components/common/Loader'

const ClientRequests = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { requests } = useSelector((state) => state.training)
  const { loading, withLoader } = useLoader()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleStartTime, setRescheduleStartTime] = useState('09:00')
  const [rescheduleEndTime, setRescheduleEndTime] = useState('17:00')
  const [costApprovalDialogOpen, setCostApprovalDialogOpen] = useState(false)
  const [selectedCostRequest, setSelectedCostRequest] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [user])

  const loadRequests = async () => {
    await withLoader(async () => {
      try {
        const requestsData = await requestApi.getRequests({ clientId: user.id })
        dispatch(setRequests(requestsData))
      } catch (error) {
        console.error('Failed to load requests:', error)
      }
    }, 'Loading requests...')
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.workflowStatus === 'admin_review')
  const approvedRequests = requests.filter((r) => r.status === 'approved')
  const rejectedRequests = requests.filter((r) => r.status === 'rejected')
  const rescheduledRequests = requests.filter((r) => r.status === 'rescheduled')
  // Requests waiting for cost approval
  const costApprovalRequests = requests.filter((r) => r.workflowStatus === 'cost_negotiation_client' && r.costStatus === 'pending_client_approval')

  const getStatusConfig = (status, customLabel) => {
    const configs = {
      pending: {
        color: '#2196f3',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        icon: <Pending />,
        label: customLabel || 'Pending',
        gradient: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
      },
      approved: {
        color: '#4caf50',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        icon: <CheckCircle />,
        label: 'Approved',
        gradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
      },
      rejected: {
        color: '#f44336',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        icon: <Cancel />,
        label: 'Rejected',
        gradient: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
      },
      rescheduled: {
        color: '#ff9800',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        icon: <Schedule />,
        label: 'Rescheduled',
        gradient: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
      },
    }
    return configs[status] || configs.pending
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
    {
      id: 'status',
      label: 'Status',
      render: (val) => {
        const config = getStatusConfig(val)
        return (
          <Chip
            icon={config.icon}
            label={config.label}
            sx={{
              backgroundColor: config.bgColor,
              color: config.color,
              fontWeight: 600,
              border: `1px solid ${config.color}`,
            }}
          />
        )
      },
      minWidth: 120,
    },
    {
      id: 'trainees',
      label: 'Trainees',
      format: (val) => `${val?.length || 0} trainees`,
      align: 'center',
      minWidth: 100,
    },
    {
      id: 'emailId',
      label: 'Email IDs',
      render: (val, row) => {
        if (!val) return 'N/A'
        const emails = val.split(',').map(e => e.trim()).filter(Boolean)
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {emails.slice(0, 2).map((email, idx) => (
              <Chip key={idx} label={email} size="small" sx={{ fontSize: '0.7rem' }} />
            ))}
            {emails.length > 2 && (
              <Chip label={`+${emails.length - 2} more`} size="small" sx={{ fontSize: '0.7rem' }} />
            )}
          </Box>
        )
      },
      minWidth: 200,
    },
  ]

  const handleReschedule = (request) => {
    setSelectedRequest(request)
    setRescheduleDate(request.date)
    setRescheduleStartTime(request.startTime)
    setRescheduleEndTime(request.endTime)
    setRescheduleModalOpen(true)
  }

  const handleRescheduleConfirm = async () => {
    if (!selectedRequest || !rescheduleDate) {
      alert('Please select a new date')
      return
    }

    await withLoader(async () => {
      try {
        await requestApi.updateRequest(selectedRequest.id, {
          date: rescheduleDate,
          startTime: rescheduleStartTime,
          endTime: rescheduleEndTime,
          status: 'rescheduled',
          rescheduleRequested: true,
        })

        await notificationApi.createNotification({
          userId: selectedRequest.clientId,
          type: 'info',
          message: `Your training request "${selectedRequest.title}" has been rescheduled to ${rescheduleDate}`,
        })

        setRescheduleModalOpen(false)
        setSelectedRequest(null)
        loadRequests()
      } catch (error) {
        console.error('Failed to reschedule request:', error)
        alert('Failed to reschedule request')
      }
    }, 'Rescheduling request...')
  }

  const handleCostApproval = (request) => {
    setSelectedCostRequest(request)
    setCostApprovalDialogOpen(true)
  }

  const handleCostApprovalConfirm = async (approved) => {
    if (!selectedCostRequest) return

    await withLoader(async () => {
      try {
        if (approved) {
          // Client approved the cost, forward to trainer
          await requestApi.updateRequest(selectedCostRequest.id, {
            costStatus: 'approved_by_client',
            workflowStatus: 'trainer_review',
            proposedCost: selectedCostRequest.adminProposedCost, // Update to admin's proposed cost
          })

          await notificationApi.createNotification({
            userId: 'admin-1',
            type: 'success',
            message: `Client approved cost ₹${selectedCostRequest.adminProposedCost} for training request "${selectedCostRequest.title}". Forwarding to trainer.`,
          })

          await notificationApi.createNotification({
            userId: user.id,
            type: 'success',
            message: `You approved the cost ₹${selectedCostRequest.adminProposedCost} for training request "${selectedCostRequest.title}".`,
          })
        } else {
          // Client rejected the cost
          await requestApi.updateRequest(selectedCostRequest.id, {
            costStatus: 'rejected_by_client',
            workflowStatus: 'admin_review', // Send back to admin
          })

          await notificationApi.createNotification({
            userId: 'admin-1',
            type: 'warning',
            message: `Client rejected cost ₹${selectedCostRequest.adminProposedCost} for training request "${selectedCostRequest.title}". Please review.`,
          })

          await notificationApi.createNotification({
            userId: user.id,
            type: 'info',
            message: `You rejected the proposed cost for training request "${selectedCostRequest.title}". Request sent back to admin.`,
          })
        }

        setCostApprovalDialogOpen(false)
        setSelectedCostRequest(null)
        loadRequests()
      } catch (error) {
        console.error('Failed to process cost approval:', error)
        alert('Failed to process cost approval')
      }
    }, approved ? 'Approving cost...' : 'Rejecting cost...')
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  }

  const StatusOverview = ({ status, count, requests, onClick, label }) => {
    const config = getStatusConfig(status, label)
    const isActive = location.pathname.includes(`/${status}`)

    return (
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          background: isActive ? config.gradient : 'transparent',
          border: `2px solid ${isActive ? config.color : 'rgba(255, 255, 255, 0.12)'}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 16px ${config.color}40`,
            borderColor: config.color,
          },
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : config.bgColor,
                borderRadius: '12px',
                p: 1.5,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {config.icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: isActive ? 'white' : config.color,
                  mb: 0.5,
                }}
              >
                {count}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isActive ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {config.label} Requests
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const RequestList = ({ requests, status, label }) => {
    const config = getStatusConfig(status, label)

    if (requests.length === 0) {
      return (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: '#1E1E1E',
            border: `2px dashed ${config.color}40`,
          }}
        >
          <Box
            sx={{
              color: config.color,
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {config.icon}
          </Box>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No {config.label.toLowerCase()} requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {status === 'pending'
              ? 'All your requests have been processed'
              : `You don't have any ${config.label.toLowerCase()} requests at the moment`}
          </Typography>
        </Paper>
      )
    }

    return (
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            background: config.gradient,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {config.icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                {config.label} Requests
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {requests.length} request{requests.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
            <DataTable
              columns={requestColumns}
              data={requests}
              actions={[
                {
                  icon: <Visibility />,
                  tooltip: 'View Details',
                  onClick: handleViewDetails,
                },
                ...(status === 'pending' || status === 'admin_approved' ? [{
                  icon: <Edit />,
                  tooltip: 'Reschedule Request',
                  onClick: handleReschedule,
                  color: 'primary',
                }] : []),
                ...(requests.some(r => r.workflowStatus === 'cost_negotiation_client' && r.costStatus === 'pending_client_approval') ? [{
                  icon: <CheckCircle />,
                  tooltip: 'Review Cost Proposal',
                  onClick: (row) => {
                    if (row.workflowStatus === 'cost_negotiation_client' && row.costStatus === 'pending_client_approval') {
                      handleCostApproval(row)
                    }
                  },
                  color: 'warning',
                }] : []),
              ]}
            />
        </Box>
      </Paper>
    )
  }

  if (loading) {
    return <Loader fullScreen message="Loading requests..." />
  }

  return (
    <>
      <Routes>
        <Route
        index
        element={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <IconButton onClick={() => navigate('/client')} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Training Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and track your training requests
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/client/request')}
                sx={{
                  background: 'linear-gradient(45deg, #64B5F6 30%, #CE93D8 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #42A5F5 30%, #BA68C8 90%)',
                  },
                }}
              >
                New Request
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatusOverview
                  status="pending"
                  count={pendingRequests.length}
                  requests={pendingRequests}
                  onClick={() => navigate('/client/requests/pending')}
                  label="Active Request"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusOverview
                  status="approved"
                  count={approvedRequests.length}
                  requests={approvedRequests}
                  onClick={() => navigate('/client/requests/approved')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusOverview
                  status="rejected"
                  count={rejectedRequests.length}
                  requests={rejectedRequests}
                  onClick={() => navigate('/client/requests/rejected')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusOverview
                  status="rescheduled"
                  count={rescheduledRequests.length}
                  requests={rescheduledRequests}
                  onClick={() => navigate('/client/requests/rescheduled')}
                />
              </Grid>
            </Grid>

            {/* Cost Approval Requests Section */}
            {costApprovalRequests.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                  Cost Approval Required ({costApprovalRequests.length})
                </Typography>
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                  <DataTable
                    columns={requestColumns}
                    data={costApprovalRequests}
                    actions={[
                      {
                        icon: <CheckCircle />,
                        tooltip: 'Approve Cost',
                        onClick: handleCostApproval,
                        color: 'success',
                      },
                    ]}
                  />
                </Paper>
              </Box>
            )}

            <RequestList requests={pendingRequests} status="pending" label="Active Request" />

            {selectedRequest && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedRequest}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedRequest(null)
                }}
              />
            )}
          </Box>
        }
        />
        <Route
          path="pending"
        element={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <IconButton onClick={() => navigate('/client/requests')} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 600, flexGrow: 1 }}>
                Active Requests
              </Typography>
            </Box>
            <RequestList requests={pendingRequests} status="pending" label="Active Request" />
            {selectedRequest && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedRequest}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedRequest(null)
                }}
              />
            )}
          </Box>
        }
        />
        <Route
          path="approved"
        element={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <IconButton onClick={() => navigate('/client/requests')} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 600, flexGrow: 1 }}>
                Approved Requests
              </Typography>
            </Box>
            <RequestList requests={approvedRequests} status="approved" />
            {selectedRequest && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedRequest}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedRequest(null)
                }}
              />
            )}
          </Box>
        }
        />
        <Route
          path="rejected"
        element={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <IconButton onClick={() => navigate('/client/requests')} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 600, flexGrow: 1 }}>
                Rejected Requests
              </Typography>
            </Box>
            <RequestList requests={rejectedRequests} status="rejected" />
            {selectedRequest && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedRequest}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedRequest(null)
                }}
              />
            )}
          </Box>
        }
        />
        <Route
          path="rescheduled"
        element={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <IconButton onClick={() => navigate('/client/requests')} sx={{ color: 'text.primary' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 600, flexGrow: 1 }}>
                Rescheduled Requests
              </Typography>
            </Box>
            <RequestList requests={rescheduledRequests} status="rescheduled" />
            {selectedRequest && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedRequest}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedRequest(null)
                }}
              />
            )}
          </Box>
        }
        />
      </Routes>

    {/* Reschedule Modal */}
    <Dialog open={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Training Request</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Request: {selectedRequest?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Date: {selectedRequest?.date} | Time: {selectedRequest?.startTime} - {selectedRequest?.endTime}
          </Typography>
        </Box>
        <TextField
          fullWidth
          type="date"
          label="New Date"
          value={rescheduleDate}
          onChange={(e) => setRescheduleDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          sx={{ mt: 2 }}
        />
        <TextField
          select
          fullWidth
          label="New Start Time"
          value={rescheduleStartTime}
          onChange={(e) => setRescheduleStartTime(e.target.value)}
          sx={{ mt: 2 }}
        >
          {Array.from({ length: 48 }, (_, i) => {
            const hour = Math.floor(i / 2)
            const minute = (i % 2) * 30
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            return <MenuItem key={time} value={time}>{time}</MenuItem>
          })}
        </TextField>
        <TextField
          select
          fullWidth
          label="New End Time"
          value={rescheduleEndTime}
          onChange={(e) => setRescheduleEndTime(e.target.value)}
          sx={{ mt: 2 }}
        >
          {Array.from({ length: 48 }, (_, i) => {
            const hour = Math.floor(i / 2)
            const minute = (i % 2) * 30
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            return <MenuItem key={time} value={time}>{time}</MenuItem>
          })}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRescheduleModalOpen(false)}>Cancel</Button>
        <Button onClick={handleRescheduleConfirm} variant="contained" disabled={!rescheduleDate}>
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>

    {/* Cost Approval Dialog */}
    <Dialog open={costApprovalDialogOpen} onClose={() => setCostApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Review Cost Proposal</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Training: {selectedCostRequest?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Number of Trainees: {selectedCostRequest?.numberOfTrainees || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your Proposed Cost: ₹{selectedCostRequest?.proposedCost || 1000}
          </Typography>
          <Typography variant="body1" color="primary" sx={{ mt: 2, fontWeight: 600 }}>
            Admin Proposed Cost: ₹{selectedCostRequest?.adminProposedCost || 1000}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Admin has proposed a higher cost based on the number of trainees. Please review and approve or reject.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCostApprovalDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => handleCostApprovalConfirm(false)} variant="outlined" color="error">
          Reject Cost
        </Button>
        <Button onClick={() => handleCostApprovalConfirm(true)} variant="contained" color="success">
          Approve Cost
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default ClientRequests
