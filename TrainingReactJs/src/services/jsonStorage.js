/**
 * JSON File Storage Service
 * Handles reading and writing to JSON files
 */

import trainersData from '../data/trainers.json'
import traineesData from '../data/trainees.json'
import clientsData from '../data/clients.json'
import adminsData from '../data/admins.json'

// In-memory storage (in production, this would be replaced with actual file system operations)
let storage = {
  trainers: [...trainersData],
  trainees: [...traineesData],
  clients: [...clientsData],
  admins: [...adminsData],
  trainings: [],
  availability: [],
  requests: [],
  notifications: [],
}

// Simulate file read
const readFile = (key) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...storage[key]])
    }, 100)
  })
}

// Simulate file write
const writeFile = (key, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      storage[key] = [...data]
      resolve(true)
    }, 100)
  })
}

export const jsonStorage = {
  // Users
  getTrainers: () => readFile('trainers'),
  getTrainees: () => readFile('trainees'),
  getClients: () => readFile('clients'),
  getAdmins: () => readFile('admins'),
  
  addTrainer: async (trainer) => {
    const trainers = await readFile('trainers')
    trainers.push(trainer)
    await writeFile('trainers', trainers)
    return trainer
  },
  
  updateTrainer: async (id, updates) => {
    const trainers = await readFile('trainers')
    const index = trainers.findIndex((t) => t.id === id)
    if (index !== -1) {
      trainers[index] = { ...trainers[index], ...updates }
      await writeFile('trainers', trainers)
      return trainers[index]
    }
    throw new Error('Trainer not found')
  },
  
  deleteTrainer: async (id) => {
    const trainers = await readFile('trainers')
    const filtered = trainers.filter((t) => t.id !== id)
    await writeFile('trainers', filtered)
    return { success: true }
  },
  
  addTrainee: async (trainee) => {
    const trainees = await readFile('trainees')
    trainees.push(trainee)
    await writeFile('trainees', trainees)
    return trainee
  },
  
  updateTrainee: async (id, updates) => {
    const trainees = await readFile('trainees')
    const index = trainees.findIndex((t) => t.id === id)
    if (index !== -1) {
      trainees[index] = { ...trainees[index], ...updates }
      await writeFile('trainees', trainees)
      return trainees[index]
    }
    throw new Error('Trainee not found')
  },
  
  deleteTrainee: async (id) => {
    const trainees = await readFile('trainees')
    const filtered = trainees.filter((t) => t.id !== id)
    await writeFile('trainees', filtered)
    return { success: true }
  },
  
  addClient: async (client) => {
    const clients = await readFile('clients')
    clients.push(client)
    await writeFile('clients', clients)
    return client
  },
  
  updateClient: async (id, updates) => {
    const clients = await readFile('clients')
    const index = clients.findIndex((c) => c.id === id)
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates }
      await writeFile('clients', clients)
      return clients[index]
    }
    throw new Error('Client not found')
  },
  
  deleteClient: async (id) => {
    const clients = await readFile('clients')
    const filtered = clients.filter((c) => c.id !== id)
    await writeFile('clients', filtered)
    return { success: true }
  },
  
  // Trainings
  getTrainings: () => readFile('trainings'),
  addTraining: async (training) => {
    const trainings = await readFile('trainings')
    trainings.push(training)
    await writeFile('trainings', trainings)
    return training
  },
  updateTraining: async (id, updates) => {
    const trainings = await readFile('trainings')
    const index = trainings.findIndex((t) => t.id === id)
    if (index !== -1) {
      trainings[index] = { ...trainings[index], ...updates }
      await writeFile('trainings', trainings)
      return trainings[index]
    }
    throw new Error('Training not found')
  },
  deleteTraining: async (id) => {
    const trainings = await readFile('trainings')
    const filtered = trainings.filter((t) => t.id !== id)
    await writeFile('trainings', filtered)
    return { success: true }
  },
  
  // Availability
  getAvailability: () => readFile('availability'),
  addAvailability: async (availability) => {
    const availabilities = await readFile('availability')
    availabilities.push(availability)
    await writeFile('availability', availabilities)
    return availability
  },
  deleteAvailability: async (id) => {
    const availabilities = await readFile('availability')
    const filtered = availabilities.filter((a) => a.id !== id)
    await writeFile('availability', filtered)
    return { success: true }
  },
  
  // Requests
  getRequests: () => readFile('requests'),
  addRequest: async (request) => {
    const requests = await readFile('requests')
    requests.push(request)
    await writeFile('requests', requests)
    return request
  },
  updateRequest: async (id, updates) => {
    const requests = await readFile('requests')
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      await writeFile('requests', requests)
      return requests[index]
    }
    throw new Error('Request not found')
  },
  
  // Notifications
  getNotifications: () => readFile('notifications'),
  addNotification: async (notification) => {
    const notifications = await readFile('notifications')
    notifications.push(notification)
    await writeFile('notifications', notifications)
    return notification
  },
  updateNotification: async (id, updates) => {
    const notifications = await readFile('notifications')
    const index = notifications.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications[index] = { ...notifications[index], ...updates }
      await writeFile('notifications', notifications)
      return notifications[index]
    }
    throw new Error('Notification not found')
  },
  updateAllNotifications: async (userId, updates) => {
    const notifications = await readFile('notifications')
    notifications.forEach((n) => {
      if (n.userId === userId) {
        Object.assign(n, updates)
      }
    })
    await writeFile('notifications', notifications)
    return { success: true }
  },
}

