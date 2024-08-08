import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { z } from 'zod'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { authenticator, createUser } from '~/utils/auth.server'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
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

  const { name, email, password } = submission.value

  try {
    // Create the user
    await createUser({ name, email, password })

    // Log the user in
    return await authenticator.authenticate('user-pass', request, {
      successRedirect: '/home',
      failureRedirect: '/signup',
      context: { formData },
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return json(submission.reply({ formErrors: [errorMessage] }))
  }
}

export default function SignUp() {
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
        <Label htmlFor={fields.name.id}>Name</Label>
        <Input {...getInputProps(fields.name, { type: 'text' })} />
        {fields.name.errors && (
          <Alert variant="destructive">
            <AlertDescription>{fields.name.errors}</AlertDescription>
          </Alert>
        )}
      </div>
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
      <div className="space-y-2">
        <Label htmlFor={fields.confirmPassword.id}>Confirm Password</Label>
        <Input
          {...getInputProps(fields.confirmPassword, { type: 'password' })}
        />
        {fields.confirmPassword.errors && (
          <Alert variant="destructive">
            <AlertDescription>{fields.confirmPassword.errors}</AlertDescription>
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
        {navigation.state === 'submitting' ? 'Signing up...' : 'Sign Up'}
      </Button>
      <div className="mt-2 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link className="text-red-700" to="/login">
          Log in
        </Link>
      </div>
    </Form>
  )
}
