import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  trainers: [],
  trainees: [],
  clients: [],
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setTrainers: (state, action) => {
      state.trainers = action.payload
    },
    setTrainees: (state, action) => {
      state.trainees = action.payload
    },
    setClients: (state, action) => {
      state.clients = action.payload
    },
    addTrainer: (state, action) => {
      state.trainers.push(action.payload)
    },
    addTrainee: (state, action) => {
      state.trainees.push(action.payload)
    },
    addClient: (state, action) => {
      state.clients.push(action.payload)
    },
    updateClient: (state, action) => {
      const index = state.clients.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.clients[index] = { ...state.clients[index], ...action.payload }
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
  setTrainers,
  setTrainees,
  setClients,
  addTrainer,
  addTrainee,
  addClient,
  updateClient,
  setLoading,
  setError,
} = userSlice.actions
export default userSlice.reducer

