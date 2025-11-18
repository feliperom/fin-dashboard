<!-- pages/index.vue -->
<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gestão PJ e Pessoal</p>
        </div>
        <div class="flex items-center gap-3">
          <ColorModeToggle />
          <UButton
            icon="i-heroicons-share-20-solid"
            color="gray"
            variant="outline"
            @click="isShareModalOpen = true"
          >
            Compartilhar
          </UButton>
          <UButton icon="i-heroicons-plus-20-solid" @click="handleNewTransaction">
            Nova Transação
          </UButton>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Saldo PJ</p>
              <p class="text-2xl font-bold mt-1" :class="balances.business >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ formatCurrency(balances.business) }}
              </p>
            </div>
            <div class="p-3 bg-indigo-500/20 rounded-lg">
              <UIcon name="i-heroicons-building-office-2" class="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Saldo PF</p>
              <p class="text-2xl font-bold mt-1" :class="balances.personal >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ formatCurrency(balances.personal) }}
              </p>
            </div>
            <div class="p-3 bg-cyan-500/20 rounded-lg">
              <UIcon name="i-heroicons-user" class="w-8 h-8 text-cyan-500" />
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Despesa Mensal</p>
              <p class="text-2xl font-bold text-red-500 mt-1">
                {{ formatCurrency(monthlyExpenses) }}
              </p>
            </div>
            <div class="p-3 bg-red-500/20 rounded-lg">
              <UIcon name="i-heroicons-arrow-trending-down" class="w-8 h-8 text-red-500" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Tabs and Chart -->
      <UCard>
        <UTabs v-model="selectedTab" :items="tabs">
          <template #item="{ item }">
            <div class="p-4">
              <BalanceChart :tab="item.value" />
            </div>
          </template>
        </UTabs>
      </UCard>

      <!-- Recent Transactions Table -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transações Recentes</h3>
        </template>

        <UTable :rows="recentTransactions" :columns="columns" :loading="loading">
          <template #type-data="{ row }">
            <UBadge :color="row.type === 'INCOME' ? 'green' : 'red'" variant="subtle">
              {{ row.type === 'INCOME' ? 'Receita' : 'Despesa' }}
            </UBadge>
          </template>

          <template #context-data="{ row }">
            <UBadge :color="row.context === 'BUSINESS' ? 'indigo' : 'cyan'" variant="subtle">
              {{ row.context === 'BUSINESS' ? 'PJ' : 'PF' }}
            </UBadge>
          </template>

          <template #amount-data="{ row }">
            <span :class="row.type === 'INCOME' ? 'text-green-500' : 'text-red-500'" class="font-semibold">
              {{ row.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
            </span>
          </template>

          <template #date-data="{ row }">
            {{ formatDate(row.date) }}
          </template>

          <template #status-data="{ row }">
            <UBadge :color="row.status === 'PAID' ? 'green' : 'yellow'" variant="subtle">
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
      </UCard>
    </div>

    <TransactionModal 
      v-model="isModalOpen" 
      :transaction-id="editingTransactionId"
      @saved="handleTransactionSaved" 
    />

    <ShareModal v-model="isShareModalOpen" />
  </div>
</template>

<script setup lang="ts">
const transactionsStore = useTransactionsStore()
const { transactions, recentTransactions, monthlyExpenses, balances, chartData, loading } = storeToRefs(transactionsStore)

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

const isModalOpen = ref(false)
const isShareModalOpen = ref(false)
const selectedTab = ref(0)
const editingTransactionId = ref<number | null>(null)

const tabs = [
  { label: 'Visão Geral', value: 'overview' },
  { label: 'PJ', value: 'business' },
  { label: 'Pessoal', value: 'personal' }
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

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta transação?')) {
    await transactionsStore.deleteTransaction(id)
    await transactionsStore.fetchTransactions()
  }
}

const handleNewTransaction = () => {
  editingTransactionId.value = null
  isModalOpen.value = true
}

const handleEdit = (id: number) => {
  editingTransactionId.value = id
  isModalOpen.value = true
}

const handleTransactionSaved = () => {
  editingTransactionId.value = null
  transactionsStore.fetchTransactions()
}

const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()

onMounted(async () => {
  // Verificar autenticação
  await authStore.fetchUser()
  if (!authStore.isAuthenticated) {
    await router.push('/login')
    return
  }

  await transactionsStore.fetchTransactions()
  
  // Verificar se há categorias, se não houver, criar as padrão
  await categoriesStore.fetchCategories()
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.seedCategories()
  }
})
</script>
