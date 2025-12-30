import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import Modal from '../common/Modal'

const TrainingDetails = ({ open, training, onClose, onUpdateStatus }) => {
  if (!training) return null

  const canMarkCompleted = training.status === 'approved' || training.status === 'in-progress'
  const canMarkCancelled = training.status !== 'completed' && training.status !== 'cancelled'

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
          {training.clientName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body1">{training.clientName}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Number of Trainees
            </Typography>
            <Typography variant="body1">
              {training.trainees?.length || 0}
            </Typography>
          </Grid>
          {training.description && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{training.description}</Typography>
            </Grid>
          )}
        </Grid>

        {training.trainees && training.trainees.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Trainees
            </Typography>
            <List>
              {training.trainees.map((trainee, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={trainee.name || `Trainee ${index + 1}`}
                    secondary={trainee.email}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {canMarkCompleted && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onUpdateStatus(training.id, 'completed')}
            >
              Mark as Completed
            </Button>
          )}
          {canMarkCancelled && (
            <Button
              variant="contained"
              color="error"
              onClick={() => onUpdateStatus(training.id, 'cancelled')}
            >
              Mark as Cancelled
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  )
}

export default TrainingDetails

