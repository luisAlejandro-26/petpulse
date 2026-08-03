export const metadata = {
  title: 'PetPulse API',
  description: 'API de control veterinario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
