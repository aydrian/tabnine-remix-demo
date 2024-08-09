import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { requireAuth } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  return json({ user })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuth(request)
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema })

  if (submission.status !== 'success') {
    return json(submission.reply())
  }

  const { title, description } = submission.value

  await prisma.todo.create({
    data: {
      title,
      description,
      userId: user.id,
    },
  })

  return redirect('/todos')
}

export default function NewTodo() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, { title, description }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
  })

  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create New Todo</h1>
      <Form method="post" {...getFormProps(form)}>
        <div className="space-y-4">
          <div>
            <Label htmlFor={title.id}>Title</Label>
            <Input
              {...getInputProps(title, { type: 'text' })}
              placeholder="Enter todo title"
            />
            {title.errors && (
              <p className="mt-1 text-sm text-red-500">{title.errors}</p>
            )}
          </div>
          <div>
            <Label htmlFor={description.id}>Description (optional)</Label>
            <Textarea
              {...getTextareaProps(description)}
              placeholder="Enter todo description"
            />
          </div>
          <div className="flex justify-between">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Todo'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/todos">Cancel</Link>
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
