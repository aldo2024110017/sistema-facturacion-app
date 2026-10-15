import './globals.css'

export const metadata = {
  title: 'Sistema de Facturación',
  description: 'Aplicación de facturación con Next.js y Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}