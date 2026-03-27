import { PrismaClient } from '@prisma/client'

import { PrismaLibSql } from '@prisma/adapter-libsql'

const softDeleteModels = [
  'User',
  'Category',
  'Habit',
  'HabitCompletion',
  'MoodCheckin',
  'Task',
]

const camelCase = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

const prismaClientSingleton = () => {
  // Turbopack / Webpack sometimes causes process.env.DATABASE_URL to be "undefined"
  // Prisma 7 reads this env var internally and passes it to PrismaLibSql, throwing an error if it's invalid
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'undefined') {
    process.env.DATABASE_URL = 'file:./dev.db'
  }

  // Prisma 7 requires adapting the database driver when URL isn't in schema
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
  })
  const client = new PrismaClient({ adapter })

  return client.$extends({
    name: 'soft-delete',
    query: {
      $allModels: {
        async delete({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            return (client as any)[camelCase(model)].update({
              ...args,
              data: { deletedAt: new Date() },
            })
          }
          return query(args)
        },
        async deleteMany({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            return (client as any)[camelCase(model)].updateMany({
              ...args,
              data: { deletedAt: new Date() },
            })
          }
          return query(args)
        },
        async findUnique({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            return (client as any)[camelCase(model)].findFirst({
              ...args,
              where: { deletedAt: null, ...args.where },
            })
          }
          return query(args)
        },
        async findFirst({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async findMany({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async count({ model, args, query }) {
          if (softDeleteModels.includes(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
      },
    },
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = global as unknown as { prisma: PrismaClientSingleton }

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
