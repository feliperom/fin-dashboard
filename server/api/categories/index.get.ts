// server/api/categories/index.get.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const context = query.context as 'BUSINESS' | 'PERSONAL' | undefined

  const where: any = {
    OR: [
      { context: 'BOTH' },
      ...(context ? [{ context }] : [])
    ]
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: {
      name: 'asc'
    }
  })

  return categories
})

