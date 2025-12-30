import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import Modal from '../common/Modal'

const TrainingDetails = ({ open, training, onClose }) => {
  if (!training) return null

  const cost = 1000 // ₹1000 per session

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
          {training.trainerName && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Trainer
              </Typography>
              <Typography variant="body1">{training.trainerName}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Cost
            </Typography>
            <Typography variant="body1">₹{cost}</Typography>
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
              Trainees ({training.trainees.length})
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
      </Box>
    </Modal>
  )
}

export default TrainingDetails

