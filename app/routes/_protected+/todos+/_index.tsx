import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAuth } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)

  return json({ user })
}

export default function Todos() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <div className="mx-auto mt-8 max-w-md space-y-6">
      <h1 className="text-center text-2xl font-bold">
        {user.name}'s Todo List
      </h1>
    </div>
  )
}
