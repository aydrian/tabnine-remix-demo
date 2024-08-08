import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { AuthorizationError } from 'remix-auth'
import { z } from 'zod'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { authenticator } from '~/utils/auth.server'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/home',
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema })

  if (submission.status !== 'success') {
    return json(submission.reply())
  }

  try {
    return await authenticator.authenticate('user-pass', request, {
      successRedirect: '/home',
      throwOnError: true,
      context: { formData },
    })
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return json(submission.reply({ formErrors: [error.message] }))
    }
    throw error
  }
}

export default function Login() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },

    // Validate the form on blur event triggered
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <Form
      method="post"
      className="mx-auto mt-8 max-w-md space-y-6"
      {...getFormProps(form)}
    >
      <div className="space-y-2">
        <Label htmlFor={fields.email.id}>Email</Label>
        <Input {...getInputProps(fields.email, { type: 'email' })} />
        {fields.email.errors && (
          <Alert variant="destructive">
            <AlertDescription>{fields.email.errors}</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={fields.password.id}>Password</Label>
        <Input {...getInputProps(fields.password, { type: 'password' })} />
        {fields.password.errors && (
          <Alert variant="destructive">
            <AlertDescription>{fields.password.errors}</AlertDescription>
          </Alert>
        )}
      </div>
      {form.errors && (
        <Alert variant="destructive">
          <AlertDescription>{form.errors}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={navigation.state === 'submitting'}
      >
        {navigation.state === 'submitting' ? 'Logging in...' : 'Log In'}
      </Button>
      <div className="mt-2 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link className="text-red-700 underline" to="/signup">
          Sign up
        </Link>
      </div>
    </Form>
  )
}
