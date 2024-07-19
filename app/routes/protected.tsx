import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { requireAuth } from '~/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)
  return json({ user })
}

export default function Protected() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Hello, {user.name}!</h1>
      <form action="/logout" method="post">
        <Button type="submit" variant="destructive">
          Logout
        </Button>
      </form>
    </div>
  )
}
