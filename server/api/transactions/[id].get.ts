// server/api/transactions/[id].get.ts
import prisma from '~/server/utils/prisma'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido'
    })
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!transaction) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Transação não encontrada'
    })
  }

  // Se houver usuário autenticado, validar que a transação pertence a ele
  const user = await getSessionUser(event)
  if (user && transaction.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Você não tem permissão para visualizar esta transação'
    })
  }

  return {
    ...transaction,
    amount: Number(transaction.amount),
    tags: transaction.tags.map(tt => tt.tag.name)
  }
})

