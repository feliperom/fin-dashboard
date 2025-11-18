// server/api/categories/seed.post.ts
import prisma from '~/server/utils/prisma'

const defaultCategories = [
  // Categorias PJ
  { name: 'Infraestrutura', context: 'BUSINESS' },
  { name: 'Impostos', context: 'BUSINESS' },
  { name: 'Serviços', context: 'BUSINESS' },
  { name: 'Marketing', context: 'BUSINESS' },
  { name: 'Desenvolvimento', context: 'BUSINESS' },
  { name: 'Consultoria', context: 'BUSINESS' },
  { name: 'Equipamentos', context: 'BUSINESS' },
  { name: 'Software', context: 'BUSINESS' },
  { name: 'Nota Fiscal', context: 'BUSINESS' },
  { name: 'DAS', context: 'BUSINESS' },
  // Categorias PF
  { name: 'Supermercado', context: 'PERSONAL' },
  { name: 'Lazer', context: 'PERSONAL' },
  { name: 'Transporte', context: 'PERSONAL' },
  { name: 'Saúde', context: 'PERSONAL' },
  { name: 'Educação', context: 'PERSONAL' },
  { name: 'Moradia', context: 'PERSONAL' },
  { name: 'Alimentação', context: 'PERSONAL' },
  { name: 'Vestuário', context: 'PERSONAL' },
  { name: 'Pro-labore', context: 'PERSONAL' },
  { name: 'Dividendos', context: 'PERSONAL' },
  // Categorias para ambos
  { name: 'Outros', context: 'BOTH' }
]

export default defineEventHandler(async (event) => {
  try {
    const categories = await Promise.all(
      defaultCategories.map(category =>
        prisma.category.upsert({
          where: { name: category.name },
          update: {},
          create: category
        })
      )
    )

    return { success: true, count: categories.length }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao criar categorias padrão'
    })
  }
})

