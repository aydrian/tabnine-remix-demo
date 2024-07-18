import { type ActionFunction, redirect } from '@remix-run/node'
import { authenticator } from '~/utils/auth.server'

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: '/login' })
}

export const loader = () => redirect('/')
