'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type DashboardLayoutProps = {
  children: ReactNode
}

const navigation = [
  {
    name: 'Inicio',
    href: '/dashboard',
  },
  {
    name: 'Clientes',
    href: '/dashboard/clients',
  },
  {
    name: 'Productos',
    href: '/dashboard/products',
  },
  {
    name: 'Facturas',
    href: '/dashboard/invoices',
  },
]

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (!session) {
        setAuthenticated(false)
        setLoading(false)
        router.replace('/login')
        return
      }

      setAuthenticated(true)
      setLoading(false)
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return
        }

        if (!session) {
          setAuthenticated(false)
          router.replace('/login')
        } else {
          setAuthenticated(true)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase])

  async function handleLogout() {
    setLoggingOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('No se pudo cerrar la sesión.')
      setLoggingOut(false)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }

    return pathname.startsWith(href)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-gray-600">
            Verificando sesión...
          </p>
        </div>
      </main>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link
            href="/dashboard"
            className="shrink-0"
          >
            <p className="text-lg font-bold text-gray-900">
              Sistema de Facturación
            </p>

            <p className="text-xs text-gray-500">
              Panel administrativo
            </p>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut
              ? 'Cerrando...'
              : 'Cerrar sesión'}
          </button>
        </div>

        <nav className="flex overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
          {navigation.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </header>

      {children}
    </div>
  )
}