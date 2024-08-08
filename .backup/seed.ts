import { type Category, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time('🌱 Database has been seeded')

  // Clear existing data
  await prisma.todo.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.category.deleteMany({})

  // Create categories
  const categories = [
    { name: 'Work' },
    { name: 'Personal' },
    { name: 'Health' },
    { name: 'Errands' },
    { name: 'Learning' },
  ]

  const createdCategories = await Promise.all(
    categories.map(category => prisma.category.create({ data: category })),
  )

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

    // Create todos for each user with random categories
    const todos = [
      {
        title: `${user.name}'s first todo`,
        description: 'This is the first todo',
        categories: getRandomCategories(createdCategories, 1, 2),
      },
      {
        title: `${user.name}'s second todo`,
        description: 'This is the second todo',
        categories: getRandomCategories(createdCategories, 1, 3),
      },
      {
        title: `${user.name}'s third todo`,
        description: 'This is the third todo',
        categories: getRandomCategories(createdCategories, 2, 3),
      },
    ]

    for (const todo of todos) {
      await prisma.todo.create({
        data: {
          title: todo.title,
          description: todo.description,
          userId: createdUser.id,
          categories: {
            connect: todo.categories.map(cat => ({ id: cat.id })),
          },
        },
      })
    }
  }

  console.timeEnd('🌱 Database has been seeded')
}

// Helper function to get random categories
function getRandomCategories(categories: Category[], min: number, max: number) {
  const numCategories = Math.floor(Math.random() * (max - min + 1)) + min
  return categories.sort(() => 0.5 - Math.random()).slice(0, numCategories)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
