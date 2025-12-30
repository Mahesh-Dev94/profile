import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility,
  Pending,
  CheckCircle,
  Cancel,
  Schedule,
  ArrowBack,
} from '@mui/icons-material'
import DataTable from '../../components/common/DataTable'
import TrainingDetails from '../../components/client/TrainingDetails'
import { useState } from 'react'

const ClientRequests = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { requests } = useSelector((state) => state.training)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const approvedRequests = requests.filter((r) => r.status === 'approved')
  const rejectedRequests = requests.filter((r) => r.status === 'rejected')
  const rescheduledRequests = requests.filter((r) => r.status === 'rescheduled')

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: '#2196f3',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        icon: <Pending />,
        label: 'Pending',
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
  ]

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  }

  const StatusOverview = ({ status, count, requests, onClick }) => {
    const config = getStatusConfig(status)
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

  const RequestList = ({ requests, status }) => {
    const config = getStatusConfig(status)

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
            ]}
          />
        </Box>
      </Paper>
    )
  }

  return (
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

            <RequestList requests={pendingRequests} status="pending" />

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
                Pending Requests
              </Typography>
            </Box>
            <RequestList requests={pendingRequests} status="pending" />
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
  )
}

export default ClientRequests
