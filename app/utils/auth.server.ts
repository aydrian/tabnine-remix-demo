import { type User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { prisma } from '~/utils/db.server'
import { sessionStorage } from '~/utils/session.server'

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage)

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email')
    const password = form.get('password')

    const user = await prisma.user.findUnique({
      where: { email: email as string },
    })
    if (!user) {
      throw new AuthorizationError('User not found')
    }

    const isValid = await bcrypt.compare(password as string, user.password)
    if (!isValid) {
      throw new AuthorizationError('Invalid credentials')
    }

    return user
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass',
)

export const requireAuth = async (request: Request) => {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
}

export async function createUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
}
