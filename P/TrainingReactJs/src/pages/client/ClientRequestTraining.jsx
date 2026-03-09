import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Paper } from '@mui/material'
import Modal from '../../components/common/Modal'
import TrainingRequestForm from '../../components/client/TrainingRequestForm'
import { userApi, requestApi, notificationApi } from '../../services/mockApi'
import { addNotification } from '../../store/slices/notificationSlice'
import { trainingApi } from '../../services/mockApi'
import { setClients } from '../../store/slices/userSlice'
import { setRequests } from '../../store/slices/trainingSlice'

const ClientRequestTraining = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { clients } = useSelector((state) => state.users)
  const [trainers, setTrainers] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [trainersData, clientsData] = await Promise.all([
        userApi.getUsers('trainer'),
        userApi.getUsers('client'),
      ])
      setTrainers(trainersData)
      dispatch(setClients(clientsData))
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleRequestSubmit = async (formData) => {
    try {
      // Create request with status 'pending' - goes to Admin first
      const newRequest = await requestApi.createRequest({
        ...formData,
        clientId: user.id,
        clientName: user.name,
        status: 'pending', // Admin will review first
        workflowStatus: 'admin_review', // New field to track workflow
      })

      // Notify all admins about the new request
      const admins = await userApi.getUsers('admin')
      for (const admin of admins) {
        await notificationApi.createNotification({
          userId: admin.id,
          type: 'info',
          message: `New training request from ${user.name}: ${formData.title} on ${formData.date}`,
          requestId: newRequest.id,
        })
      }

      // Notify client
      dispatch(addNotification({
        userId: user.id,
        type: 'success',
        message: 'Training request submitted successfully. Awaiting admin approval.',
      }))

      // Reload requests to show the new one
      const updatedRequests = await requestApi.getRequests({ clientId: user.id })
      dispatch(setRequests(updatedRequests))

      navigate('/client/requests/pending')
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to submit request. Please try again.')
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Request Training Session
      </Typography>
      <Paper sx={{ p: 3, backgroundColor: '#1E1E1E' }}>
        <TrainingRequestForm
          onSubmit={handleRequestSubmit}
          onCancel={() => navigate('/client')}
          trainers={trainers}
        />
      </Paper>
    </Box>
  )
}

export default ClientRequestTraining
