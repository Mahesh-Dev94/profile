/**
 * Mock API service layer using JSON storage
 * In production, this would be replaced with actual API calls
 */

import { jsonStorage } from './jsonStorage'

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication API
export const authApi = {
  login: async (email, password) => {
    await delay(500)
    
    // Check all user types
    const [trainers, trainees, clients, admins] = await Promise.all([
      jsonStorage.getTrainers(),
      jsonStorage.getTrainees(),
      jsonStorage.getClients(),
      jsonStorage.getAdmins(),
    ])
    
    const allUsers = [...trainers, ...trainees, ...clients, ...admins]
    const user = allUsers.find(
      (u) => u.email === email && u.password === password
    )
    
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    const { password: _, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      token: `mock-token-${user.id}`,
    }
  },

  logout: async () => {
    await delay(200)
    return { success: true }
  },
}

// Training API
export const trainingApi = {
  getTrainings: async (filters = {}) => {
    await delay(300)
    let filtered = await jsonStorage.getTrainings()

    if (filters.userId && filters.role === 'trainer') {
      filtered = filtered.filter((t) => t.trainerId === filters.userId)
    }
    if (filters.userId && filters.role === 'trainee') {
      filtered = filtered.filter((t) =>
        t.trainees?.includes(filters.userId)
      )
    }
    if (filters.userId && filters.role === 'client') {
      filtered = filtered.filter((t) => t.clientId === filters.userId)
    }
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status)
    }

    return filtered
  },

  createTraining: async (trainingData) => {
    await delay(400)
    const newTraining = {
      id: `training-${Date.now()}`,
      ...trainingData,
      createdAt: new Date().toISOString(),
      status: trainingData.status || 'pending',
    }
    return await jsonStorage.addTraining(newTraining)
  },

  updateTraining: async (id, updates) => {
    await delay(300)
    return await jsonStorage.updateTraining(id, updates)
  },

  deleteTraining: async (id) => {
    await delay(300)
    return await jsonStorage.deleteTraining(id)
  },
}

// Availability API
export const availabilityApi = {
  getAvailability: async (trainerId) => {
    await delay(300)
    const allAvailability = await jsonStorage.getAvailability()
    return trainerId 
      ? allAvailability.filter((a) => a.trainerId === trainerId)
      : allAvailability
  },

  createAvailability: async (availabilityData) => {
    await delay(400)
    const newAvailability = {
      id: `avail-${Date.now()}`,
      ...availabilityData,
      createdAt: new Date().toISOString(),
    }
    return await jsonStorage.addAvailability(newAvailability)
  },

  deleteAvailability: async (id) => {
    await delay(300)
    return await jsonStorage.deleteAvailability(id)
  },
}

// Request API
export const requestApi = {
  getRequests: async (filters = {}) => {
    await delay(300)
    let filtered = await jsonStorage.getRequests()

    if (filters.trainerId) {
      filtered = filtered.filter((r) => r.trainerId === filters.trainerId)
    }
    if (filters.clientId) {
      filtered = filtered.filter((r) => r.clientId === filters.clientId)
    }
    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status)
    }

    return filtered
  },

  createRequest: async (requestData) => {
    await delay(400)
    const newRequest = {
      id: `request-${Date.now()}`,
      ...requestData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    return await jsonStorage.addRequest(newRequest)
  },

  updateRequest: async (id, updates) => {
    await delay(300)
    return await jsonStorage.updateRequest(id, updates)
  },
}

// User API
export const userApi = {
  getUsers: async (role) => {
    await delay(300)
    if (role === 'trainer') {
      return await jsonStorage.getTrainers()
    }
    if (role === 'trainee') {
      return await jsonStorage.getTrainees()
    }
    if (role === 'client') {
      return await jsonStorage.getClients()
    }
    if (role === 'admin') {
      return await jsonStorage.getAdmins()
    }
    // Return all users
    const [trainers, trainees, clients, admins] = await Promise.all([
      jsonStorage.getTrainers(),
      jsonStorage.getTrainees(),
      jsonStorage.getClients(),
      jsonStorage.getAdmins(),
    ])
    return [...trainers, ...trainees, ...clients, ...admins]
  },

  getUser: async (id) => {
    await delay(300)
    const [trainers, trainees, clients, admins] = await Promise.all([
      jsonStorage.getTrainers(),
      jsonStorage.getTrainees(),
      jsonStorage.getClients(),
      jsonStorage.getAdmins(),
    ])
    const allUsers = [...trainers, ...trainees, ...clients, ...admins]
    return allUsers.find((u) => u.id === id)
  },

  createUser: async (userData) => {
    await delay(400)
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    }
    
    if (userData.role === 'trainer') {
      return await jsonStorage.addTrainer(newUser)
    }
    if (userData.role === 'trainee') {
      return await jsonStorage.addTrainee(newUser)
    }
    if (userData.role === 'client') {
      return await jsonStorage.addClient(newUser)
    }
    return newUser
  },

  updateUser: async (id, updates) => {
    await delay(300)
    // Try to find and update in each storage
    try {
      return await jsonStorage.updateTrainer(id, updates)
    } catch {
      try {
        return await jsonStorage.updateTrainee(id, updates)
      } catch {
        try {
          return await jsonStorage.updateClient(id, updates)
        } catch {
          throw new Error('User not found')
        }
      }
    }
  },

  deleteUser: async (id) => {
    await delay(300)
    // Try to delete from each storage
    try {
      return await jsonStorage.deleteTrainer(id)
    } catch {
      try {
        return await jsonStorage.deleteTrainee(id)
      } catch {
        try {
          return await jsonStorage.deleteClient(id)
        } catch {
          throw new Error('User not found')
        }
      }
    }
  },
}

// Notification API
let notificationIdCounter = 1

export const notificationApi = {
  getNotifications: async (userId) => {
    await delay(300)
    const allNotifications = await jsonStorage.getNotifications()
    return allNotifications.filter((n) => n.userId === userId)
  },

  createNotification: async (notificationData) => {
    await delay(200)
    const newNotification = {
      id: notificationIdCounter++,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString(),
    }
    return await jsonStorage.addNotification(newNotification)
  },

  markAsRead: async (id) => {
    await delay(200)
    return await jsonStorage.updateNotification(id, { read: true })
  },

  markAllAsRead: async (userId) => {
    await delay(200)
    return await jsonStorage.updateAllNotifications(userId, { read: true })
  },
}
