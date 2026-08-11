import { useAuth } from '../../context/AuthContext'

function HomeTablet() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Version: Tablet</p>
      <p>Hola, {user?.name_user}</p>
      <p>Email: {user?.email}</p>
      <button onClick={() => void logout()}>Cerrar sesion</button>
    </div>
  )
}

export default HomeTablet
