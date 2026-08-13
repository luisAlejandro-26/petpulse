import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSuccessMobile from './pages/Register/RegisterSuccessMobile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPasswordSuccessMobile from './pages/ForgotPassword/ResetPasswordSuccessMobile'

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App