import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const REDIRECT_MS = 3500

function RegisterSuccessDesktop() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { state: { registered: true } })
    }, REDIRECT_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div>
      <p>Version: Desktop (placeholder, pendiente de diseno)</p>
      <h1>Registro exitoso</h1>
      <p>Espere un momento, sera redirigido al inicio de sesion</p>
    </div>
  )
}

export default RegisterSuccessDesktop