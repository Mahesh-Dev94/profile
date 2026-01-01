/**
 * IndexedDB Service for persistent data storage
 */

const DB_NAME = 'TrainingPlatformDB'
const DB_VERSION = 1

const STORES = {
  TRAINERS: 'trainers',
  CLIENTS: 'clients',
  ADMINS: 'admins',
  TRAININGS: 'trainings',
  AVAILABILITY: 'availability',
  REQUESTS: 'requests',
  NOTIFICATIONS: 'notifications',
}

class IndexedDBService {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.TRAINERS)) {
          db.createObjectStore(STORES.TRAINERS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
          db.createObjectStore(STORES.CLIENTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.ADMINS)) {
          db.createObjectStore(STORES.ADMINS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.TRAININGS)) {
          db.createObjectStore(STORES.TRAININGS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.AVAILABILITY)) {
          db.createObjectStore(STORES.AVAILABILITY, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.REQUESTS)) {
          db.createObjectStore(STORES.REQUESTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
          db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' })
        }
      }
    })
  }

  async getAll(storeName) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName, id) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add(storeName, item) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(item)

      request.onsuccess = () => resolve(item)
      request.onerror = () => reject(request.error)
    })
  }

  async update(storeName, item) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => resolve(item)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName, id) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve({ success: true })
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve({ success: true })
      request.onerror = () => reject(request.error)
    })
  }

  async bulkAdd(storeName, items) {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const promises = items.map((item) => {
        return new Promise((res, rej) => {
          const request = store.add(item)
          request.onsuccess = () => res(item)
          request.onerror = () => rej(request.error)
        })
      })

      Promise.all(promises)
        .then(() => resolve(items))
        .catch((error) => reject(error))
    })
  }
}

export const indexedDBService = new IndexedDBService()
export { STORES }

