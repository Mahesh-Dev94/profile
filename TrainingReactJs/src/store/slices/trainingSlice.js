import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  trainings: [],
  availability: [],
  requests: [],
  loading: false,
  error: null,
}

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    setTrainings: (state, action) => {
      state.trainings = action.payload
    },
    addTraining: (state, action) => {
      state.trainings.push(action.payload)
    },
    updateTraining: (state, action) => {
      const index = state.trainings.findIndex(
        (t) => t.id === action.payload.id
      )
      if (index !== -1) {
        state.trainings[index] = { ...state.trainings[index], ...action.payload }
      }
    },
    setAvailability: (state, action) => {
      state.availability = action.payload
    },
    addAvailability: (state, action) => {
      state.availability.push(action.payload)
    },
    setRequests: (state, action) => {
      state.requests = action.payload
    },
    addRequest: (state, action) => {
      state.requests.push(action.payload)
    },
    updateRequest: (state, action) => {
      const index = state.requests.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.requests[index] = { ...state.requests[index], ...action.payload }
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setTrainings,
  addTraining,
  updateTraining,
  setAvailability,
  addAvailability,
  setRequests,
  addRequest,
  updateRequest,
  setLoading,
  setError,
} = trainingSlice.actions
export default trainingSlice.reducer

