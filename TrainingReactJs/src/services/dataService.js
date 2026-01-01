/**
 * Data Service - Handles initial load from JSON and subsequent operations via IndexedDB
 */

import { indexedDBService, STORES } from './indexedDB'
import initialData from '../data/initialData.json'

let isInitialized = false

export const dataService = {
  async initialize() {
    if (isInitialized) return

    try {
      await indexedDBService.init()

      // Check if data already exists
      const existingTrainers = await indexedDBService.getAll(STORES.TRAINERS)
      const existingClients = await indexedDBService.getAll(STORES.CLIENTS)
      const existingAdmins = await indexedDBService.getAll(STORES.ADMINS)
      const existingAvailability = await indexedDBService.getAll(STORES.AVAILABILITY)

      // Only load initial data if IndexedDB is empty
      if (existingTrainers.length === 0 && existingClients.length === 0 && existingAdmins.length === 0) {
        console.log('Loading initial data into IndexedDB...')
        try {
          // Load initial data from JSON
          if (initialData.clients && initialData.clients.length > 0) {
            await indexedDBService.bulkAdd(STORES.CLIENTS, initialData.clients)
          }
          if (initialData.trainers && initialData.trainers.length > 0) {
            await indexedDBService.bulkAdd(STORES.TRAINERS, initialData.trainers)
          }
          if (initialData.admins && initialData.admins.length > 0) {
            await indexedDBService.bulkAdd(STORES.ADMINS, initialData.admins)
          }
          if (initialData.availability && initialData.availability.length > 0) {
            await indexedDBService.bulkAdd(STORES.AVAILABILITY, initialData.availability)
          }
          
          // Load initial trainings and requests if they exist
          if (initialData.trainings && initialData.trainings.length > 0) {
            await indexedDBService.bulkAdd(STORES.TRAININGS, initialData.trainings)
          }
          if (initialData.requests && initialData.requests.length > 0) {
            await indexedDBService.bulkAdd(STORES.REQUESTS, initialData.requests)
          }
          console.log('Initial data loaded successfully')
        } catch (error) {
          console.error('Error loading initial data:', error)
          // If bulkAdd fails (e.g., duplicate keys), try adding individually
          if (initialData.clients) {
            for (const client of initialData.clients) {
              try {
                await indexedDBService.add(STORES.CLIENTS, client)
              } catch (e) {
                // Ignore duplicate key errors
                console.warn('Client already exists:', client.email)
              }
            }
          }
          if (initialData.trainers) {
            for (const trainer of initialData.trainers) {
              try {
                await indexedDBService.add(STORES.TRAINERS, trainer)
              } catch (e) {
                // Ignore duplicate key errors
                console.warn('Trainer already exists:', trainer.email)
              }
            }
          }
          if (initialData.admins) {
            for (const admin of initialData.admins) {
              try {
                await indexedDBService.add(STORES.ADMINS, admin)
              } catch (e) {
                // Ignore duplicate key errors
                console.warn('Admin already exists:', admin.email)
              }
            }
          }
        }
      } else {
        console.log('Data already exists in IndexedDB, skipping initial load')
        console.log('Existing counts:', {
          trainers: existingTrainers.length,
          clients: existingClients.length,
          admins: existingAdmins.length
        })
      }

      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize data service:', error)
      throw error
    }
  },

  // Trainers
  async getTrainers() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.TRAINERS)
  },

  async getTrainer(id) {
    await this.initialize()
    return await indexedDBService.get(STORES.TRAINERS, id)
  },

  async addTrainer(trainer) {
    await this.initialize()
    return await indexedDBService.add(STORES.TRAINERS, trainer)
  },

  async updateTrainer(id, updates) {
    await this.initialize()
    const trainer = await indexedDBService.get(STORES.TRAINERS, id)
    if (!trainer) throw new Error('Trainer not found')
    const updated = { ...trainer, ...updates }
    return await indexedDBService.update(STORES.TRAINERS, updated)
  },

  async deleteTrainer(id) {
    await this.initialize()
    return await indexedDBService.delete(STORES.TRAINERS, id)
  },

  // Clients
  async getClients() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.CLIENTS)
  },

  async getClient(id) {
    await this.initialize()
    return await indexedDBService.get(STORES.CLIENTS, id)
  },

  async addClient(client) {
    await this.initialize()
    return await indexedDBService.add(STORES.CLIENTS, client)
  },

  async updateClient(id, updates) {
    await this.initialize()
    const client = await indexedDBService.get(STORES.CLIENTS, id)
    if (!client) throw new Error('Client not found')
    const updated = { ...client, ...updates }
    return await indexedDBService.update(STORES.CLIENTS, updated)
  },

  async deleteClient(id) {
    await this.initialize()
    return await indexedDBService.delete(STORES.CLIENTS, id)
  },

  // Admins
  async getAdmins() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.ADMINS)
  },

  async addAdmin(admin) {
    await this.initialize()
    return await indexedDBService.add(STORES.ADMINS, admin)
  },

  // Trainings
  async getTrainings() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.TRAININGS)
  },

  async getTraining(id) {
    await this.initialize()
    return await indexedDBService.get(STORES.TRAININGS, id)
  },

  async addTraining(training) {
    await this.initialize()
    return await indexedDBService.add(STORES.TRAININGS, training)
  },

  async updateTraining(id, updates) {
    await this.initialize()
    const training = await indexedDBService.get(STORES.TRAININGS, id)
    if (!training) throw new Error('Training not found')
    const updated = { ...training, ...updates }
    return await indexedDBService.update(STORES.TRAININGS, updated)
  },

  async deleteTraining(id) {
    await this.initialize()
    return await indexedDBService.delete(STORES.TRAININGS, id)
  },

  // Availability
  async getAvailability() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.AVAILABILITY)
  },

  async getAvailabilityByTrainer(trainerId) {
    await this.initialize()
    const all = await indexedDBService.getAll(STORES.AVAILABILITY)
    return all.filter((a) => a.trainerId === trainerId)
  },

  async addAvailability(availability) {
    await this.initialize()
    return await indexedDBService.add(STORES.AVAILABILITY, availability)
  },

  async updateAvailability(id, updates) {
    await this.initialize()
    const availability = await indexedDBService.get(STORES.AVAILABILITY, id)
    if (!availability) throw new Error('Availability not found')
    const updated = { ...availability, ...updates }
    return await indexedDBService.update(STORES.AVAILABILITY, updated)
  },

  async deleteAvailability(id) {
    await this.initialize()
    return await indexedDBService.delete(STORES.AVAILABILITY, id)
  },

  // Requests
  async getRequests() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.REQUESTS)
  },

  async getRequest(id) {
    await this.initialize()
    return await indexedDBService.get(STORES.REQUESTS, id)
  },

  async addRequest(request) {
    await this.initialize()
    return await indexedDBService.add(STORES.REQUESTS, request)
  },

  async updateRequest(id, updates) {
    await this.initialize()
    const request = await indexedDBService.get(STORES.REQUESTS, id)
    if (!request) throw new Error('Request not found')
    const updated = { ...request, ...updates }
    return await indexedDBService.update(STORES.REQUESTS, updated)
  },

  async deleteRequest(id) {
    await this.initialize()
    return await indexedDBService.delete(STORES.REQUESTS, id)
  },

  // Notifications
  async getNotifications() {
    await this.initialize()
    return await indexedDBService.getAll(STORES.NOTIFICATIONS)
  },

  async getNotificationsByUser(userId) {
    await this.initialize()
    const all = await indexedDBService.getAll(STORES.NOTIFICATIONS)
    return all.filter((n) => n.userId === userId)
  },

  async addNotification(notification) {
    await this.initialize()
    return await indexedDBService.add(STORES.NOTIFICATIONS, notification)
  },

  async updateNotification(id, updates) {
    await this.initialize()
    const notification = await indexedDBService.get(STORES.NOTIFICATIONS, id)
    if (!notification) throw new Error('Notification not found')
    const updated = { ...notification, ...updates }
    return await indexedDBService.update(STORES.NOTIFICATIONS, updated)
  },

  async updateAllNotifications(userId, updates) {
    await this.initialize()
    const all = await indexedDBService.getAll(STORES.NOTIFICATIONS)
    const userNotifications = all.filter((n) => n.userId === userId)
    for (const notif of userNotifications) {
      const updated = { ...notif, ...updates }
      await indexedDBService.update(STORES.NOTIFICATIONS, updated)
    }
    return { success: true }
  },

  // Trainee counts
  getTraineeCounts() {
    return initialData.traineeCounts
  },
}

