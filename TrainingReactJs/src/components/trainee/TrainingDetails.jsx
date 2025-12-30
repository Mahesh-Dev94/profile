import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
} from '@mui/material'
import Modal from '../common/Modal'

const TrainingDetails = ({ open, training, onClose, onMarkAttended, userId }) => {
  if (!training) return null

  const traineeStatus = training.traineeStatus?.[userId]
  const canMarkAttended = !traineeStatus && training.status === 'approved'
  const isUpcoming = new Date(training.date) >= new Date()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Training Details"
      maxWidth="md"
      actions={[
        {
          label: 'Close',
          onClick: onClose,
          variant: 'outlined',
        },
      ]}
    >
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {training.title || 'Training Session'}
            </Typography>
            <Chip
              label={training.status}
              color={
                training.status === 'completed' ? 'success' :
                training.status === 'cancelled' ? 'error' :
                training.status === 'approved' ? 'info' : 'warning'
              }
              sx={{ mb: 2 }}
            />
            {traineeStatus && (
              <Chip
                label={`Your Status: ${traineeStatus}`}
                color={traineeStatus === 'attended' ? 'success' : 'default'}
                sx={{ ml: 1, mb: 2 }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1">
              {new Date(training.date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Time
            </Typography>
            <Typography variant="body1">
              {training.startTime} - {training.endTime}
            </Typography>
          </Grid>
          {training.trainerName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Trainer
              </Typography>
              <Typography variant="body1">{training.trainerName}</Typography>
            </Grid>
          )}
          {training.clientName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body1">{training.clientName}</Typography>
            </Grid>
          )}
          {training.description && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{training.description}</Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {canMarkAttended && isUpcoming && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => onMarkAttended(training.id)}
            >
              Mark as Attended
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default TrainingDetails

