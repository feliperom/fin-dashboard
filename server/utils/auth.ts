// server/utils/auth.ts
import bcrypt from 'bcrypt'
import prisma from './prisma'

const SALT_ROUNDS = 10
const SESSION_COOKIE_NAME = 'fin-dashboard-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const generateShareCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  let isUnique = false

  while (!isUnique) {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const existing = await prisma.user.findUnique({
      where: { shareCode: code }
    })

    if (!existing) {
      isUnique = true
    }
  }

  return code
}

export const getSessionUser = async (event: any) => {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  
  if (!sessionId) {
    return null
  }

  try {
    const userId = parseInt(sessionId)
    if (isNaN(userId)) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        shareCode: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user
  } catch (error) {
    return null
  }
}

export const setSessionCookie = (event: any, userId: number) => {
  setCookie(event, SESSION_COOKIE_NAME, userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  })
}

export const clearSessionCookie = (event: any) => {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
}

