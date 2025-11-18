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
    // Usar $fetch que funciona tanto no servidor quanto no cliente
    // No servidor, o Nuxt resolve automaticamente para a API interna
    const user = await $fetch('/api/auth/me', {
      // Garantir que funciona no servidor
      ...(import.meta.server && {
        headers: useRequestHeaders(['cookie'])
      })
    })

    if (!user) {
      return navigateTo('/login')
    }
  } catch (error) {
    // Em caso de erro (API não disponível, não autenticado, etc), redirecionar para login
    console.error('Erro ao verificar autenticação:', error)
    return navigateTo('/login')
  }
})

