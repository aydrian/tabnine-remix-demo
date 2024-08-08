import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData, NavLink } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { requireAuth } from '~/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)
  return json({ user })
}

export default function ProtectedLayout() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-10 bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Hello, {user.name}!</h1>

          <div className="flex space-x-4">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `text-white hover:text-gray-300 ${isActive ? 'text-blue-400' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/todos"
              className={({ isActive }) =>
                `text-white hover:text-gray-300 ${isActive ? 'text-blue-400' : ''}`
              }
            >
              My Todos
            </NavLink>
          </div>

          <form action="/logout" method="post">
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </form>
        </div>
      </nav>
      <main className="pt-20">
        <Outlet />
      </main>
    </>
  )
}
