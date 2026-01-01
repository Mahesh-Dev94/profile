/**
 * API service layer using IndexedDB via dataService
 */

import { dataService } from './dataService'

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication API
export const authApi = {
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    await delay(500)
    
    try {
      // Ensure dataService is initialized
      await dataService.initialize()
      
      // Check all user types
      const [trainers, clients, admins] = await Promise.all([
        dataService.getTrainers(),
        dataService.getClients(),
        dataService.getAdmins(),
      ])
      
      console.log('Login attempt:', { email, trainersCount: trainers.length, clientsCount: clients.length, adminsCount: admins.length })
      console.log('Sample trainer emails:', trainers.map(t => t.email))
      
      const allUsers = [...trainers, ...clients, ...admins]
      const trimmedEmail = email.toLowerCase().trim()
      
      const user = allUsers.find((u) => {
        if (!u.email) return false
        const userEmail = u.email.toLowerCase().trim()
        const passwordMatch = u.password === password
        console.log('Checking user:', { userEmail, trimmedEmail, match: userEmail === trimmedEmail, passwordMatch })
        return userEmail === trimmedEmail && passwordMatch
      })
      
      if (!user) {
        console.error('User not found. Available emails:', allUsers.map(u => u.email))
        throw new Error('Invalid email or password. Please check your credentials.')
      }
      
      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token: `mock-token-${user.id}`,
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed. Please try again.')
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
    let filtered = await dataService.getTrainings()

    if (filters.userId && filters.role === 'trainer') {
      filtered = filtered.filter((t) => t.trainerId === filters.userId)
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
    return await dataService.addTraining(newTraining)
  },

  updateTraining: async (id, updates) => {
    await delay(300)
    return await dataService.updateTraining(id, updates)
  },

  deleteTraining: async (id) => {
    await delay(300)
    return await dataService.deleteTraining(id)
  },
}

// Availability API
export const availabilityApi = {
  getAvailability: async (trainerId) => {
    await delay(300)
    const allAvailability = await dataService.getAvailability()
    return trainerId
      ? allAvailability.filter((a) => a.trainerId === trainerId)
      : allAvailability
  },

  createAvailability: async (availabilityData) => {
    await delay(400)
    const newAvailability = {
      id: `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...availabilityData,
      createdAt: new Date().toISOString(),
    }
    return await dataService.addAvailability(newAvailability)
  },

  deleteAvailability: async (id) => {
    await delay(300)
    return await dataService.deleteAvailability(id)
  },
}

// Request API
export const requestApi = {
  getRequests: async (filters = {}) => {
    await delay(300)
    let filtered = await dataService.getRequests()

    if (filters.trainerId) {
      filtered = filtered.filter((r) => r.trainerId === filters.trainerId)
    }
    if (filters.clientId) {
      filtered = filtered.filter((r) => r.clientId === filters.clientId)
    }
    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status)
    }
    if (filters.workflowStatus) {
      filtered = filtered.filter((r) => r.workflowStatus === filters.workflowStatus)
    }
    return filtered
  },

  createRequest: async (requestData) => {
    await delay(400)
    const newRequest = {
      id: `request-${Date.now()}`,
      ...requestData,
      createdAt: new Date().toISOString(),
      status: requestData.status || 'pending',
    }
    return await dataService.addRequest(newRequest)
  },

  updateRequest: async (id, updates) => {
    await delay(300)
    return await dataService.updateRequest(id, updates)
  },
}

// User API
export const userApi = {
  getUsers: async (role) => {
    await delay(300)
    if (role === 'trainer') return await dataService.getTrainers()
    if (role === 'client') return await dataService.getClients()
    if (role === 'admin') return await dataService.getAdmins()
    
    const [trainers, clients, admins] = await Promise.all([
      dataService.getTrainers(),
      dataService.getClients(),
      dataService.getAdmins(),
    ])
    return [...trainers, ...clients, ...admins]
  },

  getUser: async (id) => {
    await delay(300)
    const allUsers = await userApi.getUsers()
    return allUsers.find((u) => u.id === id)
  },

  createUser: async (userData) => {
    await delay(400)
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    }
    if (newUser.role === 'trainer') return await dataService.addTrainer(newUser)
    if (newUser.role === 'client') return await dataService.addClient(newUser)
    if (newUser.role === 'admin') return await dataService.addAdmin(newUser)
    throw new Error('Invalid user role')
  },

  updateUser: async (id, updates) => {
    await delay(300)
    const user = await userApi.getUser(id)
    if (!user) throw new Error('User not found')

    if (user.role === 'trainer') return await dataService.updateTrainer(id, updates)
    if (user.role === 'client') return await dataService.updateClient(id, updates)
    if (user.role === 'admin') return await dataService.updateAdmin(id, updates)
    throw new Error('Invalid user role')
  },

  deleteUser: async (id) => {
    await delay(300)
    const user = await userApi.getUser(id)
    if (!user) throw new Error('User not found')

    if (user.role === 'trainer') return await dataService.deleteTrainer(id)
    if (user.role === 'client') return await dataService.deleteClient(id)
    if (user.role === 'admin') return await dataService.deleteAdmin(id)
    throw new Error('Invalid user role')
  },
}

// Notification API
export const notificationApi = {
  getNotifications: async (userId) => {
    await delay(300)
    return (await dataService.getNotifications()).filter((n) => n.userId === userId)
  },

  createNotification: async (notificationData) => {
    await delay(200)
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString(),
    }
    return await dataService.addNotification(newNotification)
  },

  markAsRead: async (id) => {
    await delay(200)
    return await dataService.updateNotification(id, { read: true })
  },

  markAllAsRead: async (userId) => {
    await delay(200)
    const notifications = await dataService.getNotifications()
    const userNotifications = notifications.filter((n) => n.userId === userId && !n.read)
    for (const notif of userNotifications) {
      await dataService.updateNotification(notif.id, { read: true })
    }
    return { success: true }
  },
}

// Helper function
export const getTraineeCounts = () => {
  return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
}

export const resetMockData = async () => {
  await dataService.clearAllData()
}
