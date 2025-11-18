// server/api/transactions/index.post.ts
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

    const body = await readBody(event)
    const validatedData = createTransactionSchema.parse(body)

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

    const transaction = await prisma.transaction.create({
      data: {
        label: validatedData.label,
        type: validatedData.type,
        context: validatedData.context,
        category: validatedData.category,
        amount: typeof validatedData.amount === 'string' ? parseFloat(validatedData.amount) : validatedData.amount,
        date: validatedData.date instanceof Date ? validatedData.date : new Date(validatedData.date),
        isRecurring: validatedData.isRecurring ?? false,
        status: validatedData.status ?? 'PENDING',
        userId: user.id,
        tags: {
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
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Erro ao criar transação'
    })
  }
})

