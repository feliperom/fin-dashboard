<!-- components/CategoryModal.vue -->
<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ isEditMode ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="handleClose"
          />
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormGroup label="Nome" name="name" required>
          <UInput v-model="state.name" placeholder="Ex: Marketing, Lazer, Alimentação" />
        </UFormGroup>

        <UFormGroup label="Contexto" name="context" required>
          <USelect
            v-model="state.context"
            :options="contextOptions"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormGroup>

        <div class="flex justify-end gap-2 pt-4">
          <UButton color="gray" variant="ghost" @click="handleClose">
            Cancelar
          </UButton>
          <UButton type="submit" :loading="loading">
            Salvar
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  modelValue: boolean
  categoryId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const categoriesStore = useCategoriesStore()
const { loading } = storeToRefs(categoriesStore)
const toast = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const schema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  context: z.enum(['BUSINESS', 'PERSONAL', 'BOTH'])
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  context: 'BOTH'
})

const isEditMode = computed(() => !!props.categoryId)

const contextOptions = [
  { label: 'Ambos (PJ e PF)', value: 'BOTH' },
  { label: 'Empresa (PJ)', value: 'BUSINESS' },
  { label: 'Pessoal (PF)', value: 'PERSONAL' }
]

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (isEditMode.value && props.categoryId) {
      await categoriesStore.updateCategory(
        props.categoryId,
        event.data.name,
        event.data.context
      )
      toast.add({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso!',
        color: 'green'
      })
    } else {
      await categoriesStore.createCategory(event.data.name, event.data.context)
      toast.add({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso!',
        color: 'green'
      })
    }
    
    emit('saved')
    handleClose()
    await categoriesStore.fetchCategories()
  } catch (error: any) {
    console.error('Erro ao salvar categoria:', error)
    const errorMessage = error.data?.statusMessage || error.message || 'Erro ao salvar categoria'
    toast.add({
      title: 'Erro',
      description: errorMessage,
      color: 'red'
    })
  }
}

const handleClose = () => {
  Object.assign(state, {
    name: '',
    context: 'BOTH'
  })
  isOpen.value = false
}

watch(isOpen, async (open) => {
  if (open) {
    if (props.categoryId) {
      try {
        const category = categoriesStore.categories.find(cat => cat.id === props.categoryId)
        if (category) {
          Object.assign(state, {
            name: category.name,
            context: category.context
          })
        }
      } catch (error) {
        console.error('Erro ao carregar categoria:', error)
      }
    } else {
      // Reset form for new category
      Object.assign(state, {
        name: '',
        context: 'BOTH'
      })
    }
  }
})
</script>

