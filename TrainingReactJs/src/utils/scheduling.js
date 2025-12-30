/**
 * Scheduling utility functions for priority-based conflict resolution
 */

/**
 * Check if two time slots overlap
 * @param {Object} slot1 - { date, startTime, endTime }
 * @param {Object} slot2 - { date, startTime, endTime }
 * @returns {boolean}
 */
export const isTimeSlotOverlapping = (slot1, slot2) => {
  if (slot1.date !== slot2.date) return false

  const start1 = new Date(`${slot1.date}T${slot1.startTime}`)
  const end1 = new Date(`${slot1.date}T${slot1.endTime}`)
  const start2 = new Date(`${slot2.date}T${slot2.startTime}`)
  const end2 = new Date(`${slot2.date}T${slot2.endTime}`)

  return start1 < end2 && start2 < end1
}

/**
 * Find scheduling conflicts for a given time slot
 * @param {Object} requestedSlot - The slot being requested
 * @param {Array} existingTrainings - Array of existing training sessions
 * @param {string} trainerId - Optional trainer ID to check
 * @returns {Array} Array of conflicting training sessions
 */
export const findConflicts = (requestedSlot, existingTrainings, trainerId = null) => {
  return existingTrainings.filter((training) => {
    if (training.status === 'cancelled') return false
    if (trainerId && training.trainerId !== trainerId) return false

    return isTimeSlotOverlapping(requestedSlot, {
      date: training.date,
      startTime: training.startTime,
      endTime: training.endTime,
    })
  })
}

/**
 * Resolve conflict using priority-based scheduling
 * @param {Object} newRequest - New training request
 * @param {Array} conflictingTrainings - Conflicting training sessions
 * @param {Array} clients - Array of all clients with priority scores
 * @returns {Object} Resolution result with winner and affected trainings
 */
export const resolveConflictByPriority = (newRequest, conflictingTrainings, clients) => {
  const newClient = clients.find((c) => c.id === newRequest.clientId)
  const newClientPriority = newClient?.priorityScore || 0

  const conflictsWithPriority = conflictingTrainings.map((training) => {
    const client = clients.find((c) => c.id === training.clientId)
    return {
      training,
      priority: client?.priorityScore || 0,
      clientId: training.clientId,
    }
  })

  // Find the highest priority among conflicts
  const maxConflictPriority = Math.max(
    ...conflictsWithPriority.map((c) => c.priority),
    0
  )

  // If new request has higher priority, it wins
  if (newClientPriority > maxConflictPriority) {
    return {
      winner: 'new',
      newRequest,
      affectedTrainings: conflictsWithPriority.map((c) => c.training),
      reason: `Higher priority client (${newClientPriority} vs ${maxConflictPriority})`,
    }
  }

  // If there's a tie or existing has higher priority, existing wins
  const highestPriorityConflicts = conflictsWithPriority.filter(
    (c) => c.priority === maxConflictPriority
  )

  if (highestPriorityConflicts.length > 0 && maxConflictPriority >= newClientPriority) {
    return {
      winner: 'existing',
      newRequest,
      affectedTrainings: highestPriorityConflicts.map((c) => c.training),
      reason: `Existing client has equal or higher priority (${maxConflictPriority} vs ${newClientPriority})`,
    }
  }

  // Default: new request wins if no conflicts
  return {
    winner: 'new',
    newRequest,
    affectedTrainings: [],
    reason: 'No conflicts',
  }
}

/**
 * Check if trainer is available for a time slot
 * @param {Object} slot - { date, startTime, endTime }
 * @param {string} trainerId - Trainer ID
 * @param {Array} availability - Trainer's availability slots
 * @param {Array} existingTrainings - Existing training sessions
 * @returns {Object} Availability check result
 */
export const checkTrainerAvailability = (
  slot,
  trainerId,
  availability,
  existingTrainings
) => {
  // Check if slot is in trainer's availability
  const isAvailable = availability.some((avail) => {
    if (avail.trainerId !== trainerId) return false
    if (avail.date !== slot.date) return false

    const availStart = new Date(`${avail.date}T${avail.startTime}`)
    const availEnd = new Date(`${avail.date}T${avail.endTime}`)
    const slotStart = new Date(`${slot.date}T${slot.startTime}`)
    const slotEnd = new Date(`${slot.date}T${slot.endTime}`)

    return slotStart >= availStart && slotEnd <= availEnd
  })

  if (!isAvailable) {
    return {
      available: false,
      reason: 'Trainer not available for this time slot',
    }
  }

  // Check for conflicts with existing trainings
  const conflicts = findConflicts(slot, existingTrainings, trainerId)

  if (conflicts.length > 0) {
    return {
      available: false,
      reason: 'Time slot already booked',
      conflicts,
    }
  }

  return {
    available: true,
  }
}

/**
 * Generate alternative time slots for rescheduling
 * @param {Object} originalSlot - Original time slot
 * @param {Array} availability - Trainer's availability
 * @param {Array} existingTrainings - Existing training sessions
 * @param {number} count - Number of alternatives to generate
 * @returns {Array} Array of alternative time slots
 */
export const generateAlternativeSlots = (
  originalSlot,
  availability,
  existingTrainings,
  count = 3
) => {
  const alternatives = []
  const trainerId = originalSlot.trainerId

  // Get trainer's availability for the same date and nearby dates
  const relevantAvailability = availability.filter(
    (avail) => avail.trainerId === trainerId
  )

  for (const avail of relevantAvailability) {
    if (alternatives.length >= count) break

    const slot = {
      date: avail.date,
      startTime: avail.startTime,
      endTime: avail.endTime,
      trainerId,
    }

    const check = checkTrainerAvailability(slot, trainerId, availability, existingTrainings)
    if (check.available) {
      alternatives.push(slot)
    }
  }

  return alternatives
}

