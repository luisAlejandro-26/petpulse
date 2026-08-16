import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSuccessMobile from './pages/Register/RegisterSuccessMobile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPasswordSuccessMobile from './pages/ForgotPassword/ResetPasswordSuccessMobile'
import PetForm from './pages/Pets/PetForm'
import CalendarMobile from "./pages/Calendar/CalendarMobile";
import EventCategoryPicker from "./pages/Calendar/EventCategoryPicker";
import BusinessBooking from "./pages/Calendar/BusinessBooking";
import EventForm from "./pages/Calendar/EventForm";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccessMobile />} />
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
                <PetForm />
              </RequireAuth>
            }
          />
          <Route
            path="/pets/:id/edit"
            element={
              <RequireAuth>
                <PetForm />
              </RequireAuth>
            }
          />
          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <CalendarMobile />
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
            path="/events/category"
            element={
              <RequireAuth>
                <EventCategoryPicker />
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
          <Route
            path="/events/new"
            element={
              <RequireAuth>
                <EventForm />
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