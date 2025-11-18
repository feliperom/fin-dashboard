// server/api/categories/[id].put.ts
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  context: z.enum(['BUSINESS', 'PERSONAL', 'BOTH'])
})

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID inválido'
      })
    }

    const body = await readBody(event)
    const validatedData = updateCategorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
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
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Categoria não encontrada'
      })
    }
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao atualizar categoria'
    })
  }
})

