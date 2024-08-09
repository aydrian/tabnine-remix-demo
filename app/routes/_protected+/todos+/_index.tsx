import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import TodoItem from '~/components/todo-item'
import { Button } from '~/components/ui/button'
import { requireAuth } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)

  const todos = []

  return json({ user, todos })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const id = parseInt(formData.get('id') as string)
  const completed = formData.get('completed') === 'true'

  return null
}

export default function Todos() {
  const { user, todos } = useLoaderData<typeof loader>()
  return (
    <div className="mx-auto mt-8 max-w-md space-y-6">
      <h1 className="text-center text-2xl font-bold">
        {user.name}'s Todo List
      </h1>
      <ul className="space-y-2">
        {todos.length > 0 ? (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={{
                ...todo,
                createdAt: new Date(todo.createdAt),
                updatedAt: new Date(todo.updatedAt),
              }}
            />
          ))
        ) : (
          <li className="text-center text-sm text-gray-500">No todos found.</li>
        )}
      </ul>
      <Button asChild className="w-full">
        <Link to="/todos/new">Add Item</Link>
      </Button>
    </div>
  )
}
