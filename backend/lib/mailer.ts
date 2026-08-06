import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) {
    return transporter
  }
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) {
    throw new Error('Faltan EMAIL_USER / EMAIL_PASS en backend/.env')
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

export async function sendPasswordResetCode(
  to: string,
  code: string
): Promise<void> {
  await getTransporter().sendMail({
    from: `PetPulse <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Código de recuperación - PetPulse',
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Tu código de recuperación es:</p>
      <h2>${code}</h2>
      <p>El código es válido por 15 minutos. Si no solicitaste este cambio, ignora este correo.</p>
    `,
  })
}
