<!-- pages/categories.vue -->
<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Categorias</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gerencie suas categorias de transações</p>
        </div>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-arrow-path-20-solid"
            color="gray"
            variant="outline"
            @click="handleRefresh"
            :loading="loading"
          >
            Atualizar
          </UButton>
          <UButton icon="i-heroicons-plus-20-solid" @click="handleNewCategory">
            Nova Categoria
          </UButton>
        </div>
      </div>

      <!-- Filtros -->
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Contexto">
            <USelect
              v-model="filterContext"
              :options="contextOptions"
              option-attribute="label"
              value-attribute="value"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>

          <UFormGroup label="Buscar">
            <UInput
              v-model="searchQuery"
              placeholder="Buscar por nome..."
              icon="i-heroicons-magnifying-glass-20-solid"
              @update:model-value="handleFilterChange"
            />
          </UFormGroup>
        </div>
      </UCard>

      <!-- Tabela de Categorias -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Categorias ({{ filteredCategories.length }})
            </h3>
          </div>
        </template>

        <UTable
          :rows="paginatedCategories"
          :columns="columns"
          :loading="loading"
        >
          <template #context-data="{ row }">
            <UBadge
              :color="getContextColor(row.context)"
              variant="subtle"
            >
              {{ getContextLabel(row.context) }}
            </UBadge>
          </template>

          <template #createdAt-data="{ row }">
            {{ formatDate(row.createdAt) }}
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
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredCategories.length) }} de {{ filteredCategories.length }}
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

    <CategoryModal
      v-model="isModalOpen"
      :category-id="editingCategoryId"
      @saved="handleCategorySaved"
    />
  </div>
</template>

<script setup lang="ts">
const categoriesStore = useCategoriesStore()
const { categories, loading } = storeToRefs(categoriesStore)

const isModalOpen = ref(false)
const editingCategoryId = ref<number | null>(null)
const searchQuery = ref('')
const filterContext = ref<'BUSINESS' | 'PERSONAL' | 'BOTH' | undefined>(undefined)
const currentPage = ref(1)
const itemsPerPage = 20

const contextOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Ambos (PJ e PF)', value: 'BOTH' },
  { label: 'Empresa (PJ)', value: 'BUSINESS' },
  { label: 'Pessoal (PF)', value: 'PERSONAL' }
]

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'context', label: 'Contexto' },
  { key: 'createdAt', label: 'Criado em' },
  { key: 'actions', label: '' }
]

const getContextColor = (context: string) => {
  switch (context) {
    case 'BUSINESS':
      return 'indigo'
    case 'PERSONAL':
      return 'cyan'
    case 'BOTH':
      return 'purple'
    default:
      return 'gray'
  }
}

const getContextLabel = (context: string) => {
  switch (context) {
    case 'BUSINESS':
      return 'PJ'
    case 'PERSONAL':
      return 'PF'
    case 'BOTH':
      return 'Ambos'
    default:
      return context
  }
}

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

const filteredCategories = computed(() => {
  let result = [...categories.value]

  // Filtro por busca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(cat =>
      cat.name.toLowerCase().includes(query)
    )
  }

  // Filtro por contexto
  if (filterContext.value) {
    result = result.filter(cat => cat.context === filterContext.value)
  }

  // Ordenar por nome
  return result.sort((a, b) => a.name.localeCompare(b.name))
})

const totalPages = computed(() => {
  return Math.ceil(filteredCategories.value.length / itemsPerPage)
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCategories.value.slice(start, end)
})

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleRefresh = async () => {
  await categoriesStore.fetchCategories()
}

const handleNewCategory = () => {
  editingCategoryId.value = null
  isModalOpen.value = true
}

const handleEdit = (id: number) => {
  editingCategoryId.value = id
  isModalOpen.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta categoria?')) {
    try {
      await categoriesStore.deleteCategory(id)
      await categoriesStore.fetchCategories()
    } catch (error: any) {
      alert(error.data?.statusMessage || 'Erro ao excluir categoria')
    }
  }
}

const handleCategorySaved = () => {
  editingCategoryId.value = null
  categoriesStore.fetchCategories()
}

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(filterContext, () => {
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

  await categoriesStore.fetchCategories()
})
</script>

