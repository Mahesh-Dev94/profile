import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper } from '@mui/material'
import { Edit } from '@mui/icons-material'
import DataTable from '../../components/common/DataTable'
import { userApi } from '../../services/mockApi'
import { setClients, updateClient } from '../../store/slices/userSlice'
import useLoader from '../../hooks/useLoader'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import { TextField } from '@mui/material'

const AdminClients = () => {
  const dispatch = useDispatch()
  const { clients } = useSelector((state) => state.users)
  const { loading, withLoader } = useLoader()
  const [selectedClient, setSelectedClient] = useState(null)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [newPriority, setNewPriority] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await withLoader(async () => {
      try {
        const clientsData = await userApi.getUsers('client')
        dispatch(setClients(clientsData))
      } catch (error) {
        console.error('Failed to load clients:', error)
      }
    }, 'Loading clients...')
  }

  const handleOpenPriorityModal = (client) => {
    setSelectedClient(client)
    setNewPriority(client.priorityScore?.toString() || '0')
    setPriorityModalOpen(true)
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
        setPriorityModalOpen(false)
        setSelectedClient(null)
        setNewPriority('')
        loadData()
      } catch (error) {
        console.error('Failed to update priority:', error)
      }
    }, 'Updating priority...')
  }

  const columns = [
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

  if (loading) {
    return <Loader fullScreen message="Loading clients..." />
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Manage Clients
      </Typography>
      <Paper sx={{ backgroundColor: '#1E1E1E', p: 2 }}>
        <DataTable
          columns={columns}
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
  )
}

export default AdminClients

