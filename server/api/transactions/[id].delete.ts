// server/api/transactions/[id].delete.ts
import prisma from '~/server/utils/prisma'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autenticado'
    })
  }

  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido'
    })
  }

  // Buscar transação para validar propriedade
  const transaction = await prisma.transaction.findUnique({
    where: { id }
  })

  if (!transaction) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Transação não encontrada'
    })
  }

  // Validar que a transação pertence ao usuário
  if (transaction.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Você não tem permissão para excluir esta transação'
    })
  }

  await prisma.transaction.delete({
    where: { id }
  })

  return { success: true, transaction }
})

