// server/api/auth/login.post.ts
import prisma from '~/server/utils/prisma'
import { verifyPassword, setSessionCookie } from '~/server/utils/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = loginSchema.parse(body)

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou senha inválidos'
      })
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(validatedData.password, user.password)

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou senha inválidos'
      })
    }

    // Definir cookie de sessão
    setSessionCookie(event, user.id)

    // Retornar usuário sem senha
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      shareCode: user.shareCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error: any) {
    if (error.issues) {
      // Zod validation error
      const firstError = error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: firstError.message || 'Erro de validação'
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao fazer login'
    })
  }
})

