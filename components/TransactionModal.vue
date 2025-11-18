<!-- components/TransactionModal.vue -->
<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ isEditMode ? 'Editar Transação' : 'Nova Transação' }}</h3>
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
        <UFormGroup label="Descrição" name="label" required>
          <UInput v-model="state.label" placeholder="Ex: Nota Fiscal #123" />
        </UFormGroup>

        <UFormGroup label="Tipo" name="type" required>
          <USelect
            v-model="state.type"
            :options="typeOptions"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormGroup>

        <UFormGroup label="Contexto" name="context" required>
          <USelect
            v-model="state.context"
            :options="contextOptions"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormGroup>

        <UFormGroup label="Categoria" name="category" required>
          <div class="flex gap-2">
            <USelect
              v-model="state.category"
              :options="categoryOptions"
              option-attribute="name"
              value-attribute="name"
              placeholder="Selecione uma categoria"
              searchable
              class="flex-1"
            />
            <UButton
              icon="i-heroicons-plus-20-solid"
              color="gray"
              variant="outline"
              @click="showAddCategory = true"
            >
              Nova
            </UButton>
          </div>
        </UFormGroup>

        <UModal v-model="showAddCategory">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Nova Categoria</h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  @click="showAddCategory = false"
                />
              </div>
            </template>

            <div class="space-y-4">
              <UFormGroup label="Nome da Categoria" required>
                <UInput v-model="newCategoryName" placeholder="Ex: Marketing, Lazer" />
              </UFormGroup>

              <div class="flex justify-end gap-2 pt-4">
                <UButton color="gray" variant="ghost" @click="showAddCategory = false">
                  Cancelar
                </UButton>
                <UButton @click="handleAddCategory" :loading="categoriesStore.loading">
                  Adicionar
                </UButton>
              </div>
            </div>
          </UCard>
        </UModal>

        <UFormGroup label="Valor" name="amount" required>
          <UInput
            v-model.number="state.amount"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </UFormGroup>

        <UFormGroup label="Data" name="date" required>
          <UInput v-model="state.date" type="datetime-local" />
        </UFormGroup>

        <UFormGroup label="Status" name="status" required>
          <USelect
            v-model="state.status"
            :options="statusOptions"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormGroup>

        <UFormGroup label="Recorrente" name="isRecurring">
          <UToggle v-model="state.isRecurring" />
        </UFormGroup>

        <UFormGroup label="Tags" name="tags">
          <div class="space-y-2">
            <UInput
              v-model="tagInput"
              placeholder="Digite uma tag e pressione Enter"
              @keydown.enter.prevent="handleAddTag"
            />
            <div v-if="state.tags && state.tags.length > 0" class="flex flex-wrap gap-2">
              <UBadge
                v-for="(tag, index) in state.tags"
                :key="index"
                color="blue"
                variant="subtle"
                class="cursor-pointer"
                @click="handleRemoveTag(index)"
              >
                {{ tag }}
                <UIcon name="i-heroicons-x-mark-20-solid" class="w-3 h-3 ml-1" />
              </UBadge>
            </div>
          </div>
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
  transactionId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const { loading } = storeToRefs(transactionsStore)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const schema = z.object({
  label: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['INCOME', 'EXPENSE']),
  context: z.enum(['BUSINESS', 'PERSONAL']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  isRecurring: z.boolean().default(false),
  status: z.enum(['PAID', 'PENDING']).default('PENDING'),
  tags: z.array(z.string()).default([]).optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  label: '',
  type: 'EXPENSE',
  context: 'BUSINESS',
  category: '',
  amount: 0,
  date: new Date().toISOString().slice(0, 16),
  isRecurring: false,
  status: 'PENDING',
  tags: []
})

const showAddCategory = ref(false)
const newCategoryName = ref('')
const tagInput = ref('')
const isEditMode = computed(() => !!props.transactionId)

const categoryOptions = computed(() => {
  return categoriesStore.categoriesByContext(state.context as 'BUSINESS' | 'PERSONAL')
})

watch(() => state.context, async (newContext) => {
  await categoriesStore.fetchCategories(newContext)
  if (categoryOptions.value.length > 0 && !categoryOptions.value.find(c => c.name === state.category)) {
    state.category = ''
  }
})

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) return

  try {
    await categoriesStore.createCategory(newCategoryName.value.trim(), state.context)
    state.category = newCategoryName.value.trim()
    newCategoryName.value = ''
    showAddCategory.value = false
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
  }
}

const typeOptions = [
  { label: 'Receita', value: 'INCOME' },
  { label: 'Despesa', value: 'EXPENSE' }
]

const contextOptions = [
  { label: 'Empresa (PJ)', value: 'BUSINESS' },
  { label: 'Pessoal (PF)', value: 'PERSONAL' }
]

const statusOptions = [
  { label: 'Pago', value: 'PAID' },
  { label: 'Pendente', value: 'PENDING' }
]

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    const transactionData = {
      label: event.data.label,
      type: event.data.type,
      context: event.data.context,
      category: event.data.category,
      amount: event.data.amount,
      date: new Date(event.data.date).toISOString(),
      isRecurring: event.data.isRecurring,
      status: event.data.status,
      tags: event.data.tags || []
    }
    
    if (isEditMode.value && props.transactionId) {
      await transactionsStore.updateTransaction(props.transactionId, transactionData)
    } else {
      await transactionsStore.createTransaction(transactionData)
    }
    
    emit('saved')
    handleClose()
    
    await transactionsStore.fetchTransactions()
  } catch (error) {
    console.error('Erro ao salvar transação:', error)
  }
}

const handleAddTag = () => {
  if (tagInput.value.trim() && !state.tags?.includes(tagInput.value.trim())) {
    if (!state.tags) {
      state.tags = []
    }
    state.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

const handleRemoveTag = (index: number) => {
  if (state.tags) {
    state.tags.splice(index, 1)
  }
}

const handleClose = () => {
  Object.assign(state, {
    label: '',
    type: 'EXPENSE',
    context: 'BUSINESS',
    category: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 16),
    isRecurring: false,
    status: 'PENDING',
    tags: []
  })
  newCategoryName.value = ''
  tagInput.value = ''
  showAddCategory.value = false
  isOpen.value = false
}

watch(isOpen, async (open) => {
  if (open) {
    await categoriesStore.fetchCategories(state.context)
    
    if (props.transactionId) {
      try {
        const transaction = await transactionsStore.fetchTransaction(props.transactionId)
        Object.assign(state, {
          label: transaction.label,
          type: transaction.type,
          context: transaction.context,
          category: transaction.category,
          amount: transaction.amount,
          date: new Date(transaction.date).toISOString().slice(0, 16),
          isRecurring: transaction.isRecurring,
          status: transaction.status,
          tags: transaction.tags || []
        })
      } catch (error) {
        console.error('Erro ao carregar transação:', error)
      }
    }
  }
})
</script>

