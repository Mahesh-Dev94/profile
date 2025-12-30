import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import trainingReducer from './slices/trainingSlice'
import notificationReducer from './slices/notificationSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    training: trainingReducer,
    notifications: notificationReducer,
    users: userReducer,
  },
})

