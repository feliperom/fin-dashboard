// stores/categories.ts
import { defineStore } from 'pinia'

export type Category = {
  id: number
  name: string
  context: 'BUSINESS' | 'PERSONAL' | 'BOTH'
  createdAt: string
  updatedAt: string
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    loading: false
  }),

  getters: {
    categoriesByContext: (state) => {
      return (context: 'BUSINESS' | 'PERSONAL') => {
        return state.categories.filter(
          cat => cat.context === context || cat.context === 'BOTH'
        )
      }
    },

    categoryNames: (state) => {
      return state.categories.map(cat => cat.name)
    }
  },

  actions: {
    async fetchCategories(context?: 'BUSINESS' | 'PERSONAL') {
      this.loading = true
      try {
        const query = context ? `?context=${context}` : ''
        const response = await $fetch<Category[]>(`/api/categories${query}`)
        this.categories = response
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      } finally {
        this.loading = false
      }
    },

    async createCategory(name: string, context: 'BUSINESS' | 'PERSONAL' | 'BOTH' = 'BOTH') {
      this.loading = true
      try {
        const response = await $fetch<Category>('/api/categories', {
          method: 'POST',
          body: { name, context }
        })

        this.categories.push(response)
        return response
      } catch (error) {
        console.error('Erro ao criar categoria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: number, name: string, context: 'BUSINESS' | 'PERSONAL' | 'BOTH') {
      this.loading = true
      try {
        const response = await $fetch<Category>(`/api/categories/${id}`, {
          method: 'PUT',
          body: { name, context }
        })

        const index = this.categories.findIndex(cat => cat.id === id)
        if (index !== -1) {
          this.categories[index] = response
        }
        return response
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: number) {
      this.loading = true
      try {
        await $fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        })

        this.categories = this.categories.filter(cat => cat.id !== id)
      } catch (error) {
        console.error('Erro ao deletar categoria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async seedCategories() {
      try {
        await $fetch('/api/categories/seed', {
          method: 'POST'
        })
        await this.fetchCategories()
      } catch (error) {
        console.error('Erro ao criar categorias padrão:', error)
      }
    }
  }
})

