<!-- components/ShareModal.vue -->
<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Compartilhar Dashboard</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="handleClose"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Compartilhe seu código de compartilhamento para permitir que outras pessoas visualizem seu dashboard em modo leitura.
          </p>
        </div>

        <UFormGroup label="Código de Compartilhamento">
          <div class="flex gap-2">
            <UInput
              :model-value="shareCode"
              readonly
              class="flex-1 font-mono text-lg font-bold"
            />
            <UButton
              :icon="copied ? 'i-heroicons-check-20-solid' : 'i-heroicons-clipboard-20-solid'"
              :color="copied ? 'green' : 'gray'"
              @click="handleCopy"
            >
              {{ copied ? 'Copiado!' : 'Copiar' }}
            </UButton>
          </div>
        </UFormGroup>

        <UFormGroup label="Link de Compartilhamento">
          <div class="flex gap-2">
            <UInput
              :model-value="shareUrl"
              readonly
              class="flex-1 font-mono text-sm"
            />
            <UButton
              :icon="copiedUrl ? 'i-heroicons-check-20-solid' : 'i-heroicons-clipboard-20-solid'"
              :color="copiedUrl ? 'green' : 'gray'"
              @click="handleCopyUrl"
            >
              {{ copiedUrl ? 'Copiado!' : 'Copiar' }}
            </UButton>
          </div>
        </UFormGroup>

        <UAlert
          color="blue"
          variant="subtle"
          icon="i-heroicons-information-circle-20-solid"
          title="Modo Leitura"
          description="As pessoas que acessarem seu dashboard através deste código poderão apenas visualizar as informações, sem poder criar, editar ou excluir transações."
        />
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" variant="ghost" @click="handleClose">
            Fechar
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const authStore = useAuthStore()
const toast = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const shareCode = computed(() => authStore.userShareCode)

const shareUrl = computed(() => {
  if (!shareCode.value) return ''
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/shared/${shareCode.value}`
})

const copied = ref(false)
const copiedUrl = ref(false)

const handleCopy = async () => {
  if (!shareCode.value) return

  try {
    await navigator.clipboard.writeText(shareCode.value)
    copied.value = true
    toast.add({
      title: 'Sucesso',
      description: 'Código copiado para a área de transferência!',
      color: 'green'
    })
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: 'Erro',
      description: 'Erro ao copiar código',
      color: 'red'
    })
  }
}

const handleCopyUrl = async () => {
  if (!shareUrl.value) return

  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copiedUrl.value = true
    toast.add({
      title: 'Sucesso',
      description: 'Link copiado para a área de transferência!',
      color: 'green'
    })
    setTimeout(() => {
      copiedUrl.value = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: 'Erro',
      description: 'Erro ao copiar link',
      color: 'red'
    })
  }
}

const handleClose = () => {
  isOpen.value = false
}
</script>

