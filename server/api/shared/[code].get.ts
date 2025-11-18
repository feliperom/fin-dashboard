// server/api/shared/[code].get.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Código de compartilhamento é obrigatório'
    })
  }

  const user = await prisma.user.findUnique({
    where: { shareCode: code },
    select: {
      id: true,
      name: true,
      email: true,
      shareCode: true,
      createdAt: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Código de compartilhamento inválido'
    })
  }

  return user
})

