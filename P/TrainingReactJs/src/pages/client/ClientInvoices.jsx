import { useSelector } from 'react-redux'
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material'
import { Download } from '@mui/icons-material'
import DataTable from '../../components/common/DataTable'

const ClientInvoices = () => {
  const { trainings } = useSelector((state) => state.training)

  const invoiceColumns = [
    { id: 'title', label: 'Training Title' },
    { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
    {
      id: 'amount',
      label: 'Amount',
      render: () => '₹1000',
    },
    {
      id: 'status',
      label: 'Status',
      render: (val) => (
        <Typography
          sx={{
            color: val === 'completed' ? '#4caf50' : '#ff9800',
            fontWeight: 600,
          }}
        >
          {val === 'completed' ? 'PAID' : 'PENDING'}
        </Typography>
      ),
    },
  ]

  const totalAmount = trainings.length * 1000
  const paidAmount = trainings.filter((t) => t.status === 'completed').length * 1000

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Invoices
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3, width: '100%', mx: 0 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4">₹{totalAmount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Paid Amount
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                ₹{paidAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                ₹{totalAmount - paidAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={invoiceColumns}
        data={trainings}
        actions={[
          {
            icon: <Download />,
            tooltip: 'Download Invoice',
            onClick: (row) => {
              // Download invoice logic
              alert(`Downloading invoice for ${row.title}`)
            },
          },
        ]}
      />
    </Box>
  )
}

export default ClientInvoices

