import { useSelector } from 'react-redux'
import { Box, Typography } from '@mui/material'
import DataTable from '../../components/common/DataTable'

const ClientHistory = () => {
  const { trainings } = useSelector((state) => state.training)

  const trainingColumns = [
    { id: 'title', label: 'Title' },
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    { id: 'startTime', label: 'Start Time' },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Typography
          sx={{
            color:
              val === 'completed' ? '#4caf50' :
              val === 'cancelled' ? '#f44336' :
              val === 'approved' ? '#2196f3' : '#ff9800',
            fontWeight: 600,
          }}
        >
          {val.toUpperCase()}
        </Typography>
      ),
    },
    {
      id: 'trainees',
      label: 'Trainees',
      format: (val) => val?.length || 0,
    },
  ]

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Training History
      </Typography>
      <DataTable columns={trainingColumns} data={trainings} />
    </Box>
  )
}

export default ClientHistory

