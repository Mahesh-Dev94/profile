import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper } from '@mui/material'
import DataTable from '../../components/common/DataTable'
import { userApi } from '../../services/mockApi'
import { setTrainers } from '../../store/slices/userSlice'
import useLoader from '../../hooks/useLoader'
import Loader from '../../components/common/Loader'

const AdminTrainers = () => {
  const dispatch = useDispatch()
  const { trainers } = useSelector((state) => state.users)
  const { loading, withLoader } = useLoader()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const trainersData = await userApi.getUsers('trainer')
        dispatch(setTrainers(trainersData))
      } catch (error) {
        console.error('Failed to load trainers:', error)
      }
    }, 'Loading trainers...')
  }

  const columns = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'specialization', label: 'Specialization', minWidth: 150 },
    { id: 'experience', label: 'Experience', minWidth: 100 },
    {
      id: 'rating',
      label: 'Rating',
      render: (val) => val || 'N/A',
      minWidth: 100,
    },
  ]

  if (loading) {
    return <Loader fullScreen message="Loading trainers..." />
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Manage Trainers
      </Typography>
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
        <DataTable columns={columns} data={trainers} />
      </Paper>
    </Box>
  )
}

export default AdminTrainers

