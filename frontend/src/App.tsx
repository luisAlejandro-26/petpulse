import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSuccess from './pages/RegisterSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPasswordSuccessMobile from './pages/ForgotPassword/ResetPasswordSuccessMobile'
import Pets from './pages/Pets'
import Profile from './pages/Profile'
import PetIA from './pages/PetIA'
import Calendar from './pages/Calendar'
import EventCategoryPicker from './pages/Calendar/EventCategoryPicker'
import BusinessBooking from './pages/Calendar/BusinessBooking'
import EventForm from './pages/Calendar/EventForm'

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
                <Home />
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
                <EventCategoryPicker />
              </RequireAuth>
            }
          />
          <Route
            path="/events/new"
            element={
              <RequireAuth>
                <EventForm />
              </RequireAuth>
            }
          />
          <Route
            path="/business-booking"
            element={
              <RequireAuth>
                <BusinessBooking />
              </RequireAuth>
            }
          />
          <Route
            path="/events/booking"
            element={
              <RequireAuth>
                <BusinessBooking />
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