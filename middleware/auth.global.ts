// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)
  const isSharedRoute = to.path.startsWith('/shared/')

  // Permitir acesso a rotas públicas e compartilhadas
  if (isPublicRoute || isSharedRoute) {
    return
  }

  // Verificar autenticação via API
  try {
    const user = await $fetch('/api/auth/me')
    if (!user) {
      return navigateTo('/login')
    }
  } catch (error) {
    return navigateTo('/login')
  }
})

