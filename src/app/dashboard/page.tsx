import Link from 'next/link'
import { getDashboardSummary } from '@/actions/dashboard'

export default async function DashboardPage() {
  const summary = await getDashboardSummary()

  const cards = [
    {
      title: 'Clientes',
      value: summary.clients,
      description: 'Clientes registrados en tu cuenta.',
      href: '/dashboard/clients',
      linkText: 'Ver clientes',
    },
    {
      title: 'Productos',
      value: summary.products,
      description: 'Productos disponibles para facturar.',
      href: '/dashboard/products',
      linkText: 'Ver productos',
    },
    {
      title: 'Facturas',
      value: summary.invoices,
      description: 'Facturas creadas en el sistema.',
      href: '/dashboard/invoices',
      linkText: 'Ver facturas',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl p-6">
      <section className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          Panel principal
        </p>

        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Consulta el estado general de tu sistema de facturación.
        </p>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {card.title}
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {card.value}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              {card.description}
            </p>

            <Link
              href={card.href}
              className="mt-6 inline-block text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {card.linkText} →
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Acciones rápidas
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Accede rápidamente a las funciones principales del sistema.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/clients"
            className="rounded-xl border border-gray-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-gray-900">
              Gestionar clientes
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Registra, consulta, edita o elimina clientes.
            </p>
          </Link>

          <Link
            href="/dashboard/products"
            className="rounded-xl border border-gray-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-gray-900">
              Gestionar productos
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Administra los productos utilizados en tus facturas.
            </p>
          </Link>

          <Link
            href="/dashboard/invoices/new"
            className="rounded-xl border border-blue-200 bg-blue-50 p-5 transition hover:border-blue-400 hover:bg-blue-100"
          >
            <p className="font-semibold text-blue-900">
              Crear nueva factura
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Selecciona un cliente y agrega productos para facturar.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}