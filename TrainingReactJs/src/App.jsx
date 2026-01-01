import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import TrainerDashboard from './pages/TrainerDashboard'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            user?.role === 'trainer' ? (
              <Navigate to="/trainer" />
            ) : user?.role === 'client' ? (
              <Navigate to="/client" />
            ) : user?.role === 'admin' ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="trainer/*" element={<TrainerDashboard />} />
        <Route path="client/*" element={<ClientDashboard />} />
        <Route path="admin/*" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

