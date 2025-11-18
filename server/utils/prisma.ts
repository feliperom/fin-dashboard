// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  // Em runtime, sempre usar DATABASE_URL do ambiente (Vercel configura isso)
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_ORIGINAL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está configurada')
  }

  // Se for Turso (libsql://), usar o adapter
  if (databaseUrl.startsWith('libsql://')) {
    // O adapter do Turso recebe url e authToken diretamente
    // A URL do Turso pode incluir o token ou pode estar separado
    const authToken = process.env.TURSO_AUTH_TOKEN || undefined

    const adapter = new PrismaLibSQL({
      url: databaseUrl,
      authToken
    })

    // Passar uma URL temporária válida através de datasources
    // O adapter será usado para todas as operações reais
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({
      adapter,
      datasources: {
        db: {
          url: 'file:./.temp-prisma-runtime.db'
        }
      }
    } as any)
  }

  // Para SQLite local (file:), usar Prisma Client normal
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

