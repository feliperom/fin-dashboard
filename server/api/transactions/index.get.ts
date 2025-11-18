// server/api/transactions/index.get.ts
import prisma from '~/server/utils/prisma'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const month = query.month ? parseInt(query.month as string) : undefined
  const year = query.year ? parseInt(query.year as string) : undefined
  const context = query.context as 'BUSINESS' | 'PERSONAL' | undefined
  const type = query.type as 'INCOME' | 'EXPENSE' | undefined
  const shareCode = query.shareCode as string | undefined

  const where: any = {}

  // Determinar userId: da sessão ou do shareCode
  let userId: number | undefined

  if (shareCode) {
    // Buscar usuário pelo shareCode
    const user = await prisma.user.findUnique({
      where: { shareCode },
      select: { id: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Código de compartilhamento inválido'
      })
    }

    userId = user.id
  } else {
    // Buscar usuário da sessão
    const user = await getSessionUser(event)
    if (user) {
      userId = user.id
    }
  }

  // Se não houver userId, retornar erro (exceto se for rota pública de compartilhamento)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autenticado'
    })
  }

  where.userId = userId

  // Aplicar filtro de data apenas se mês ou ano forem fornecidos
  if (month || year) {
    const filterMonth = month || new Date().getMonth() + 1
    const filterYear = year || new Date().getFullYear()
    where.date = {
      gte: new Date(filterYear, filterMonth - 1, 1),
      lt: new Date(filterYear, filterMonth, 1)
    }
  }

  if (context) {
    where.context = context
  }

  if (type) {
    where.type = type
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return transactions.map(t => ({
    ...t,
    amount: Number(t.amount),
    tags: t.tags.map(tt => tt.tag.name)
  }))
})

