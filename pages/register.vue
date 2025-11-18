<!-- pages/register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cadastro</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Crie sua conta</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormGroup label="Nome" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Seu nome completo"
            icon="i-heroicons-user-20-solid"
          />
        </UFormGroup>

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
            placeholder="Mínimo 6 caracteres"
            icon="i-heroicons-lock-closed-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Confirmar Senha" name="confirmPassword" required>
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Digite a senha novamente"
            icon="i-heroicons-lock-closed-20-solid"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
          class="mt-6"
        >
          Cadastrar
        </UButton>
      </UForm>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?
          <NuxtLink
            to="/login"
            class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Faça login
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
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await authStore.register(event.data.name, event.data.email, event.data.password)
    toast.add({
      title: 'Sucesso',
      description: 'Conta criada com sucesso!',
      color: 'green'
    })
    await router.push('/')
  } catch (error: any) {
    const errorMessage = error.data?.statusMessage || error.message || 'Erro ao criar conta'
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

