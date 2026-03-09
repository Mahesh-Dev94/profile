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
  CardActions,
  Paper,
  Chip,
} from '@mui/material'
import { Add as AddIcon, History, Schedule, CheckCircle, Receipt } from '@mui/icons-material'
import { trainingApi, requestApi, userApi } from '../services/mockApi'
import { setTrainings, setRequests } from '../store/slices/trainingSlice'
import { setClients } from '../store/slices/userSlice'
import ClientRequestTraining from './client/ClientRequestTraining'
import ClientRequests from './client/ClientRequests'
import ClientHistory from './client/ClientHistory'
import ClientInvoices from './client/ClientInvoices'
import DataTable from '../components/common/DataTable'
import TrainingDetails from '../components/client/TrainingDetails'
import Loader from '../components/common/Loader'
import useLoader from '../hooks/useLoader'

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { trainings, requests } = useSelector((state) => state.training)
  const { clients } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, withLoader } = useLoader()
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const [trainingsData, requestsData, clientsData] = await Promise.all([
          trainingApi.getTrainings({ userId: user.id, role: 'client' }),
          requestApi.getRequests({ clientId: user.id }),
          userApi.getUsers('client'),
        ])
        dispatch(setTrainings(trainingsData))
        dispatch(setRequests(requestsData))
        dispatch(setClients(clientsData))
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }, 'Loading dashboard...')
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const totalCost = trainings.length * 1000
  const completedTrainings = trainings.filter((t) => t.status === 'completed')
  const upcomingTrainings = trainings.filter((t) => {
    const trainingDate = new Date(t.date)
    return (t.status === 'approved' || t.status === 'in-progress') &&
           trainingDate >= new Date()
  })

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
            val === 'approved' ? 'info' : 'warning'
          }
          size="small"
        />
      ),
      minWidth: 100,
    },
  ]

  const handleViewDetails = (training) => {
    setSelectedTraining(training)
    setDetailsOpen(true)
  }

  if (loading) {
    return <Loader fullScreen message="Loading dashboard..." />
  }

  return (
    <Routes>
      <Route
        index
        element={
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Client Dashboard
              </Typography>
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
                Request Training
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
                    <History sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {trainings.length}
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
                    <Receipt sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      ₹{totalCost}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Cost
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
                    <Schedule sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {pendingRequests.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Requests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Completed Trainings */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Completed Trainings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${completedTrainings.length} Completed`}
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    size="small"
                    onClick={() => navigate('/client/history')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              {completedTrainings.length > 0 ? (
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                  <DataTable
                    columns={trainingColumns}
                    data={completedTrainings.slice(0, 5)}
                    actions={[
                      {
                        icon: <CheckCircle />,
                        tooltip: 'View Details',
                        onClick: handleViewDetails,
                      },
                    ]}
                  />
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No completed trainings yet</Typography>
                </Paper>
              )}
            </Box>

            {/* Upcoming Trainings */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Upcoming Trainings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${upcomingTrainings.length} Upcoming`}
                    color="info"
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    size="small"
                    onClick={() => navigate('/client/history')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              {upcomingTrainings.length > 0 ? (
                <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
                  <DataTable
                    columns={[
                      ...trainingColumns,
                      {
                        id: 'clientName',
                        label: 'Company',
                        minWidth: 150,
                      },
                      {
                        id: 'slot',
                        label: 'Slot',
                        render: (val, row) => `${row.startTime} - ${row.endTime}`,
                        minWidth: 120,
                      },
                    ]}
                    data={upcomingTrainings.slice(0, 5)}
                    actions={[
                      {
                        icon: <Schedule />,
                        tooltip: 'View Details',
                        onClick: handleViewDetails,
                      },
                    ]}
                  />
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#1E1E1E' }}>
                  <Typography color="text.secondary">No upcoming trainings scheduled</Typography>
                </Paper>
              )}
            </Box>

            <Grid container spacing={3} sx={{ width: '100%', mx: 0 }}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(100, 181, 246, 0.3)',
                    },
                  }}
                  onClick={() => navigate('/client/request')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Request New Training
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new training request for your team
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>
                      Create Request
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(100, 181, 246, 0.3)',
                    },
                  }}
                  onClick={() => navigate('/client/requests/pending')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Active Requests
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {pendingRequests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requests awaiting approval
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/client/requests/pending')}>
                      View All
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>

            {selectedTraining && (
              <TrainingDetails
                open={detailsOpen}
                training={selectedTraining}
                onClose={() => {
                  setDetailsOpen(false)
                  setSelectedTraining(null)
                }}
              />
            )}
          </Box>
        }
      />
      <Route path="request" element={<ClientRequestTraining />} />
      <Route path="requests/*" element={<ClientRequests />} />
      <Route path="history" element={<ClientHistory />} />
      <Route path="invoices" element={<ClientInvoices />} />
    </Routes>
  )
}

export default ClientDashboard
