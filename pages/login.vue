<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Login</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Acesse sua conta</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormGroup label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="seu@email.com"
            icon="i-heroicons-envelope-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Senha" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed-20-solid"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
          class="mt-6"
        >
          Entrar
        </UButton>
      </UForm>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?
          <NuxtLink
            to="/register"
            class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Cadastre-se
          </NuxtLink>
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await authStore.login(event.data.email, event.data.password)
    toast.add({
      title: 'Sucesso',
      description: 'Login realizado com sucesso!',
      color: 'green'
    })
    await router.push('/')
  } catch (error: any) {
    const errorMessage = error.data?.statusMessage || error.message || 'Erro ao fazer login'
    toast.add({
      title: 'Erro',
      description: errorMessage,
      color: 'red'
    })
  }
}

onMounted(async () => {
  // Se já estiver logado, redirecionar
  await authStore.fetchUser()
  if (authStore.isAuthenticated) {
    await router.push('/')
  }
})
</script>

