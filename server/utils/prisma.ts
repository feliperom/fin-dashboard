// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // DATABASE_URL já vem do schema.prisma via env("DATABASE_URL")
  // O Prisma Client usa automaticamente a variável de ambiente
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

