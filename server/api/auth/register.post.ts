// server/api/auth/register.post.ts
import prisma from '~/server/utils/prisma'
import { hashPassword, generateShareCode, setSessionCookie } from '~/server/utils/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = registerSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email já cadastrado'
      })
    }

    // Gerar shareCode único
    const shareCode = await generateShareCode()

    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        shareCode
      },
      select: {
        id: true,
        email: true,
        name: true,
        shareCode: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Definir cookie de sessão
    setSessionCookie(event, user.id)

    return user
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
      statusMessage: error.message || 'Erro ao criar usuário'
    })
  }
})

