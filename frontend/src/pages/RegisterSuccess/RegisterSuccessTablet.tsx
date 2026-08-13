import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RegisterSuccessTablet.module.css'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

const REDIRECT_MS = 3500

function RegisterSuccessTablet() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / REDIRECT_MS) * 100, 100))
    }, 30)

    const timer = setTimeout(() => {
      navigate('/login', { state: { registered: true } })
    }, REDIRECT_MS)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [navigate])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="" className={styles.logoIcon} />
          <img src={tituloLogo} alt="PetPulse" className={styles.brandImg} />
          <p className={styles.tagline}>Salud y bienestar para tus mascotas.</p>
        </div>

        <div className={styles.card}>
          <h1 className={styles.cardHeading}>Registro exitoso</h1>

          <div className={styles.shieldWrap} role="status" aria-live="polite">
            <svg width="150" height="172" viewBox="0 0 120 138" fill="none" aria-hidden="true">
              <path
                d="M60 6 L110 24 V66 C110 100 90 122 60 133 C30 122 10 100 10 66 V24 Z"
                stroke="#7a9a7b"
                strokeWidth="7"
                fill="none"
                strokeLinejoin="round"
                strokeDasharray="400"
                strokeDashoffset="400"
                className={styles.drawShield}
              />
              <path
                d="M39 68 L54 83 L83 50"
                stroke="#7a9a7b"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="65"
                strokeDashoffset="65"
                className={styles.drawCheck}
              />
            </svg>
          </div>

          <p className={styles.caption}>Espere un momento, será redirigido al inicio</p>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <img src={fondoInicio} alt="" className={styles.illustration} />
    </div>
  )
}

export default RegisterSuccessTablet