import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Paper } from '@mui/material'
import Modal from '../../components/common/Modal'
import TrainingRequestForm from '../../components/client/TrainingRequestForm'
import { userApi, requestApi } from '../../services/mockApi'
import { addNotification } from '../../store/slices/notificationSlice'
import { resolveConflictByPriority, findConflicts } from '../../utils/scheduling'
import { trainingApi } from '../../services/mockApi'
import { setClients } from '../../store/slices/userSlice'

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
      const allTrainings = await trainingApi.getTrainings()
      const requestedSlot = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      }

      const conflicts = findConflicts(
        requestedSlot,
        allTrainings.filter((t) => t.status !== 'cancelled'),
        formData.trainerId
      )

      if (conflicts.length > 0) {
        const resolution = resolveConflictByPriority(
          { ...formData, clientId: user.id },
          conflicts,
          clients
        )

        if (resolution.winner === 'existing') {
          dispatch(addNotification({
            userId: 'admin',
            type: 'warning',
            message: `Training request conflicts with existing booking. Priority resolution needed.`,
          }))
        } else if (resolution.winner === 'new') {
          resolution.affectedTrainings.forEach((training) => {
            dispatch(addNotification({
              userId: training.clientId,
              type: 'warning',
              message: `Your training on ${training.date} has been rescheduled due to higher priority client.`,
            }))
          })
        }
      }

      await requestApi.createRequest({
        ...formData,
        clientId: user.id,
        clientName: user.name,
      })

      dispatch(addNotification({
        userId: user.id,
        type: 'success',
        message: 'Training request submitted successfully',
      }))

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

