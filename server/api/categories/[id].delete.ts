// server/api/categories/[id].delete.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido'
    })
  }

  try {
    const category = await prisma.category.delete({
      where: { id }
    })

    return { success: true, category }
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Categoria não encontrada'
      })
    }
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao deletar categoria'
    })
  }
})

