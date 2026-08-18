import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSuccess from './pages/RegisterSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPasswordSuccessMobile from './pages/ForgotPassword/ResetPasswordSuccessMobile'
import Pets from './pages/Pets'
import PetProfile from './pages/PetProfile'
import Profile from './pages/Profile'
import PetIA from './pages/PetIA'
import Calendar from './pages/Calendar'
import EventCategoryPickerSelector from './pages/Calendar/EventCategoryPickerSelector'
import BusinessBookingSelector from './pages/Calendar/BusinessBookingSelector'
import EventFormSelector from './pages/Calendar/EventFormSelector'

// El home despues de iniciar sesion: si el usuario es admin, ve el
// Panel de administracion (Admin/index.tsx); si no, la app normal (Home).
function Dashboard() {
  const { user } = useAuth()
  if (user?.role_account === 'ADMIN') return <Admin />
  return <Home />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password-success" element={<ResetPasswordSuccessMobile />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />
          <Route
            path="/pets/new"
            element={
              <RequireAuth>
                <Pets />
              </RequireAuth>
            }
          />
          <Route
            path="/pets/:id/edit"
            element={
              <RequireAuth>
                <Pets />
              </RequireAuth>
            }
          />
          <Route
            path="/pets/:id"
            element={
              <RequireAuth>
                <PetProfile />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/pet-ia"
            element={
              <RequireAuth>
                <PetIA />
              </RequireAuth>
            }
          />
          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <Calendar />
              </RequireAuth>
            }
          />
          <Route
            path="/events/category"
            element={
              <RequireAuth>
                <EventCategoryPickerSelector />
              </RequireAuth>
            }
          />
          <Route
            path="/business-booking"
            element={
              <RequireAuth>
                <BusinessBookingSelector />
              </RequireAuth>
            }
          />
          <Route
            path="/events/booking"
            element={
              <RequireAuth>
                <BusinessBookingSelector />
              </RequireAuth>
            }
          />
          <Route
            path="/events/new"
            element={
              <RequireAuth>
                <EventFormSelector />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App