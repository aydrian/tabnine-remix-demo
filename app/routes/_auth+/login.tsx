import { type ActionFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticator } from '~/utils/auth.server'

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}

export default function Login() {
  return (
    <Form method="post">
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button>Log In</button>
    </Form>
  )
}
