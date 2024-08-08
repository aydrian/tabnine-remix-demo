import { type Todo, type Category } from '@prisma/client'
import { Form, useSubmit } from '@remix-run/react'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'

interface TodoItemProps {
  todo: Todo & { categories: Omit<Category, 'createdAt' | 'updatedAt'>[] }
}

export default function TodoItem({ todo }: TodoItemProps) {
  const submit = useSubmit()

  const handleCheckboxChange = (checked: boolean) => {
    const formData = new FormData()
    formData.append('id', todo.id.toString())
    formData.append('completed', checked.toString())
    submit(formData, { method: 'post' })
  }

  const createdDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li className="py-2">
      <Form method="post" className="flex w-full items-start space-x-3">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.completed}
          onCheckedChange={handleCheckboxChange}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`todo-${todo.id}`}
              className={`${
                todo.completed ? 'text-gray-500 line-through' : 'text-gray-700'
              }`}
            >
              {todo.title}
            </Label>
            <span className="text-xs text-gray-500">{createdDate}</span>
          </div>
          {todo.description && (
            <p className="mt-1 text-sm text-gray-500">{todo.description}</p>
          )}
          {todo.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {todo.categories.map(category => (
                <Badge key={category.name} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Form>
    </li>
  )
}
