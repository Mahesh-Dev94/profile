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
} from '@mui/material'
import { Add as AddIcon, TrendingUp, Star, Receipt, History } from '@mui/icons-material'
import { trainingApi, requestApi, userApi } from '../services/mockApi'
import { setTrainings, setRequests } from '../store/slices/trainingSlice'
import { setClients } from '../store/slices/userSlice'
import ClientRequestTraining from './client/ClientRequestTraining'
import ClientRequests from './client/ClientRequests'
import ClientHistory from './client/ClientHistory'
import ClientInvoices from './client/ClientInvoices'

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { trainings, requests } = useSelector((state) => state.training)
  const { clients } = useSelector((state) => state.users)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
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
  }

  const currentClient = clients.find((c) => c.id === user.id)
  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const totalCost = trainings.length * 1000

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
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {currentClient?.priorityScore || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Priority Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Star sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {currentClient?.rating || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Client Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
            </Grid>

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
                      Pending Requests
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
                  onClick={() => navigate('/client/history')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Training History
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View all your completed and scheduled trainings
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/client/history')}>
                      View History
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
                  onClick={() => navigate('/client/invoices')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Invoices
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and download your training invoices
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/client/invoices')}>
                      View Invoices
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
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
