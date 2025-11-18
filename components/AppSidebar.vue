<!-- components/AppSidebar.vue -->
<template>
  <aside class="w-64 bg-gray-800 dark:bg-gray-900 border-r border-gray-700 min-h-screen flex flex-col">
    <div class="p-6 flex flex-col flex-1">
      <h2 class="text-xl font-bold text-white mb-6">Dashboard Financeiro</h2>
      
      <nav class="space-y-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
        >
          <UIcon name="i-heroicons-home-20-solid" class="w-5 h-5" />
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/transactions"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/transactions') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
        >
          <UIcon name="i-heroicons-list-bullet-20-solid" class="w-5 h-5" />
          <span>Transações</span>
        </NuxtLink>

        <NuxtLink
          to="/categories"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive('/categories') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
        >
          <UIcon name="i-heroicons-tag-20-solid" class="w-5 h-5" />
          <span>Categorias</span>
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div class="mt-auto pt-6 border-t border-gray-700">
        <div v-if="authStore.user" class="space-y-3">
          <div class="px-4">
            <p class="text-sm font-medium text-white">{{ authStore.userName }}</p>
            <p class="text-xs text-gray-400 truncate">{{ authStore.user.email }}</p>
          </div>
          <UButton
            block
            color="red"
            variant="ghost"
            icon="i-heroicons-arrow-right-on-rectangle-20-solid"
            @click="handleLogout"
            :loading="authStore.loading"
          >
            Sair
          </UButton>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    toast.add({
      title: 'Sucesso',
      description: 'Logout realizado com sucesso!',
      color: 'green'
    })
    await router.push('/login')
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: 'Erro ao fazer logout',
      color: 'red'
    })
  }
}

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

