import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notificationApi } from '../services/mockApi'
import { setNotifications, addNotification as addNotificationAction } from '../store/slices/notificationSlice'

/**
 * Custom hook for managing notifications
 */
export const useNotifications = (userId) => {
  const dispatch = useDispatch()
  const { notifications, unreadCount } = useSelector((state) => state.notifications)

  useEffect(() => {
    if (userId) {
      loadNotifications()
    }
  }, [userId])

  const loadNotifications = async () => {
    try {
      const notifs = await notificationApi.getNotifications(userId)
      dispatch(setNotifications(notifs))
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const createNotification = async (notificationData) => {
    try {
      const newNotification = await notificationApi.createNotification({
        ...notificationData,
        userId,
      })
      dispatch(addNotificationAction(newNotification))
      return newNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  return {
    notifications,
    unreadCount,
    loadNotifications,
    createNotification,
  }
}

export default useNotifications

