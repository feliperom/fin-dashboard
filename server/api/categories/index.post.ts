// server/api/categories/index.post.ts
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  context: z.enum(['BUSINESS', 'PERSONAL', 'BOTH'])
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createCategorySchema.parse(body)

    const category = await prisma.category.create({
      data: validatedData
    })

    return category
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Categoria já existe'
      })
    }
    
    if (error.issues) {
      // Zod validation error
      const firstError = error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: firstError.message || 'Erro de validação'
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao criar categoria'
    })
  }
})

