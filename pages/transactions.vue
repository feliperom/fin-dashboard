<!-- pages/transactions.vue -->
<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Todas as Transações</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gerencie todas as suas transações</p>
        </div>
        <UButton icon="i-heroicons-plus-20-solid" @click="handleNewTransaction">
          Nova Transação
        </UButton>
      </div>

      <!-- Filtros -->
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UFormGroup label="Mês">
            <USelect
              v-model="filters.month"
              :options="monthOptions"
              option-attribute="label"
              value-attribute="value"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>

          <UFormGroup label="Ano">
            <UInput
              v-model.number="filters.year"
              type="number"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>

          <UFormGroup label="Contexto">
            <USelect
              v-model="filters.context"
              :options="contextOptions"
              option-attribute="label"
              value-attribute="value"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>

          <UFormGroup label="Tipo">
            <USelect
              v-model="filters.type"
              :options="typeOptions"
              option-attribute="label"
              value-attribute="value"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>
        </div>
      </UCard>

      <!-- Tabela de Transações -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Transações ({{ filteredTransactions.length }})
            </h3>
            <div class="flex items-center gap-2">
              <UInput
                v-model="searchQuery"
                placeholder="Buscar..."
                icon="i-heroicons-magnifying-glass-20-solid"
                class="w-64"
              />
            </div>
          </div>
        </template>

        <UTable
          :rows="paginatedTransactions"
          :columns="columns"
          :loading="loading"
        >
          <template #type-data="{ row }">
            <UBadge
              :color="row.type === 'INCOME' ? 'green' : 'red'"
              variant="subtle"
            >
              {{ row.type === 'INCOME' ? 'Receita' : 'Despesa' }}
            </UBadge>
          </template>

          <template #context-data="{ row }">
            <UBadge
              :color="row.context === 'BUSINESS' ? 'indigo' : 'cyan'"
              variant="subtle"
            >
              {{ row.context === 'BUSINESS' ? 'PJ' : 'PF' }}
            </UBadge>
          </template>

          <template #amount-data="{ row }">
            <span
              :class="row.type === 'INCOME' ? 'text-green-500' : 'text-red-500'"
              class="font-semibold"
            >
              {{ row.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
            </span>
          </template>

          <template #date-data="{ row }">
            {{ formatDate(row.date) }}
          </template>

          <template #status-data="{ row }">
            <UBadge
              :color="row.status === 'PAID' ? 'green' : 'yellow'"
              variant="subtle"
            >
              {{ row.status === 'PAID' ? 'Pago' : 'Pendente' }}
            </UBadge>
          </template>

          <template #tags-data="{ row }">
            <div v-if="row.tags && row.tags.length > 0" class="flex flex-wrap gap-1">
              <UBadge
                v-for="(tag, index) in row.tags"
                :key="index"
                color="blue"
                variant="subtle"
                size="xs"
              >
                {{ tag }}
              </UBadge>
            </div>
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex gap-2">
              <UButton
                color="blue"
                variant="ghost"
                icon="i-heroicons-pencil-20-solid"
                size="sm"
                @click="handleEdit(row.id)"
              />
              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash-20-solid"
                size="sm"
                @click="handleDelete(row.id)"
              />
            </div>
          </template>
        </UTable>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} de {{ filteredTransactions.length }}
          </div>
          <div class="flex gap-2">
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-chevron-left-20-solid"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Anterior
            </UButton>
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-chevron-right-20-solid"
              icon-right
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Próxima
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <TransactionModal
      v-model="isModalOpen"
      :transaction-id="editingTransactionId"
      @saved="handleTransactionSaved"
    />
  </div>
</template>

<script setup lang="ts">
const transactionsStore = useTransactionsStore()
const { transactions, loading } = storeToRefs(transactionsStore)

const isModalOpen = ref(false)
const editingTransactionId = ref<number | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

const filters = reactive({
  month: undefined as number | undefined,
  year: undefined as number | undefined,
  context: undefined as 'BUSINESS' | 'PERSONAL' | undefined,
  type: undefined as 'INCOME' | 'EXPENSE' | undefined
})

const monthOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 }
]

const contextOptions = [
  { label: 'Todos', value: undefined },
  { label: 'PJ', value: 'BUSINESS' },
  { label: 'PF', value: 'PERSONAL' }
]

const typeOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Receita', value: 'INCOME' },
  { label: 'Despesa', value: 'EXPENSE' }
]

const columns = [
  { key: 'label', label: 'Descrição' },
  { key: 'type', label: 'Tipo' },
  { key: 'context', label: 'Contexto' },
  { key: 'category', label: 'Categoria' },
  { key: 'amount', label: 'Valor' },
  { key: 'date', label: 'Data' },
  { key: 'status', label: 'Status' },
  { key: 'tags', label: 'Tags' },
  { key: 'actions', label: '' }
]

const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue)
}

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

const filteredTransactions = computed(() => {
  let result = [...transactions.value]

  // Filtro por busca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.label.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Filtro por mês e ano
  if (filters.month || filters.year) {
    result = result.filter(t => {
      const date = new Date(t.date)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      if (filters.month && month !== filters.month) return false
      if (filters.year && year !== filters.year) return false
      return true
    })
  }

  // Filtro por contexto
  if (filters.context) {
    result = result.filter(t => t.context === filters.context)
  }

  // Filtro por tipo
  if (filters.type) {
    result = result.filter(t => t.type === filters.type)
  }

  // Ordenar por data (mais recente primeiro)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

const handleFilterChange = async () => {
  currentPage.value = 1
  // Buscar todas as transações sem filtro de mês/ano se não especificado
  await transactionsStore.fetchTransactions({
    month: filters.month,
    year: filters.year,
    context: filters.context,
    type: filters.type
  })
}

const handleNewTransaction = () => {
  editingTransactionId.value = null
  isModalOpen.value = true
}

const handleEdit = (id: number) => {
  editingTransactionId.value = id
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta transação?')) {
    await transactionsStore.deleteTransaction(id)
    await transactionsStore.fetchTransactions()
  }
}

const handleTransactionSaved = () => {
  editingTransactionId.value = null
  transactionsStore.fetchTransactions()
}

watch(searchQuery, () => {
  currentPage.value = 1
})

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  // Verificar autenticação
  await authStore.fetchUser()
  if (!authStore.isAuthenticated) {
    await router.push('/login')
    return
  }

  await transactionsStore.fetchTransactions()
})
</script>

