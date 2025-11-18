// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  // Em runtime, sempre usar DATABASE_URL do ambiente (Vercel configura isso)
  // Durante build, pode ser temporária, mas em runtime será a URL real
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_ORIGINAL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está configurada')
  }

  // Se for Turso (libsql://), usar o adapter
  if (databaseUrl.startsWith('libsql://')) {
    const libsql = createClient({
      url: databaseUrl
    })
    const adapter = new PrismaLibSQL(libsql)

    return new PrismaClient({ adapter })
  }

  // Para SQLite local (file:), usar Prisma Client normal
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

