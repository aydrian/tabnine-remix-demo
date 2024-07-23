import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time('🌱 Database has been seeded')

  // Clear existing data
  await prisma.todo.deleteMany({})
  await prisma.user.deleteMany({})

  // Create users
  const users = [
    { name: 'Alice', email: 'alice@example.com', password: 'password123' },
    { name: 'Bob', email: 'bob@example.com', password: 'password456' },
    { name: 'Charlie', email: 'charlie@example.com', password: 'password789' },
  ]

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    })

    // Create todos for each user
    const todos = [
      {
        title: `${user.name}'s first todo`,
        description: 'This is the first todo',
      },
      {
        title: `${user.name}'s second todo`,
        description: 'This is the second todo',
      },
      {
        title: `${user.name}'s third todo`,
        description: 'This is the third todo',
      },
    ]

    for (const todo of todos) {
      await prisma.todo.create({
        data: {
          ...todo,
          userId: createdUser.id,
        },
      })
    }
  }

  console.timeEnd('🌱 Database has been seeded')
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
