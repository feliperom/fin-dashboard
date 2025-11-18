// server/api/transactions/[id].put.ts
import prisma from '~/server/utils/prisma'
import { createTransactionSchema } from './schemas'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
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

    const body = await readBody(event)
    const validatedData = createTransactionSchema.parse(body)

    // Buscar transação existente para manter as tags
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } }
    })

    if (!existingTransaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transação não encontrada'
      })
    }

    // Validar que a transação pertence ao usuário
    if (existingTransaction.userId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Você não tem permissão para editar esta transação'
      })
    }

    // Processar tags
    const tagNames = validatedData.tags || []
    const tagIds: number[] = []

    for (const tagName of tagNames) {
      if (tagName.trim()) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName.trim() },
          update: {},
          create: { name: tagName.trim() }
        })
        tagIds.push(tag.id)
      }
    }

    // Atualizar transação
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        label: validatedData.label,
        type: validatedData.type,
        context: validatedData.context,
        category: validatedData.category,
        amount: typeof validatedData.amount === 'string' ? parseFloat(validatedData.amount) : validatedData.amount,
        date: validatedData.date instanceof Date ? validatedData.date : new Date(validatedData.date),
        isRecurring: validatedData.isRecurring ?? false,
        status: validatedData.status ?? 'PENDING',
        tags: {
          deleteMany: {},
          create: tagIds.map(tagId => ({ tagId }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return {
      ...transaction,
      amount: Number(transaction.amount),
      tags: transaction.tags.map(tt => tt.tag.name)
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao atualizar transação'
    })
  }
})

