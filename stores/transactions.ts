// stores/transactions.ts
import { defineStore } from 'pinia'

export type Transaction = {
  id: number
  label: string
  type: 'INCOME' | 'EXPENSE'
  context: 'BUSINESS' | 'PERSONAL'
  category: string
  amount: number
  date: string
  isRecurring: boolean
  status: 'PAID' | 'PENDING'
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export type TransactionFilters = {
  month?: number
  year?: number
  context?: 'BUSINESS' | 'PERSONAL'
  type?: 'INCOME' | 'EXPENSE'
  shareCode?: string
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    filters: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    } as TransactionFilters,
    loading: false
  }),

  getters: {
    recentTransactions: (state) => {
      return state.transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    },

    monthlyExpenses: (state) => {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      
      return state.transactions
        .filter(t => {
          const date = new Date(t.date)
          return t.type === 'EXPENSE' && 
                 date.getMonth() + 1 === currentMonth &&
                 date.getFullYear() === currentYear
        })
        .reduce((sum, t) => sum + Number(t.amount), 0)
    },

    balances: (state) => {
      const business = state.transactions
        .filter(t => t.context === 'BUSINESS')
        .reduce((sum, t) => {
          return sum + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount))
        }, 0)

      const personal = state.transactions
        .filter(t => t.context === 'PERSONAL')
        .reduce((sum, t) => {
          return sum + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount))
        }, 0)

      return {
        business,
        personal
      }
    },

    balanceByContext: (state) => {
      return (context: 'BUSINESS' | 'PERSONAL') => {
        return state.transactions
          .filter(t => t.context === context)
          .reduce((sum, t) => {
            return sum + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount))
          }, 0)
      }
    },

    chartData: (state) => {
      const sorted = [...state.transactions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      const data: { date: string; business: number; personal: number }[] = []
      let businessBalance = 0
      let personalBalance = 0

      sorted.forEach(transaction => {
        const amount = Number(transaction.amount)
        if (transaction.context === 'BUSINESS') {
          businessBalance += transaction.type === 'INCOME' ? amount : -amount
        } else {
          personalBalance += transaction.type === 'INCOME' ? amount : -amount
        }

        data.push({
          date: transaction.date,
          business: businessBalance,
          personal: personalBalance
        })
      })

      return data
    }
  },

  actions: {
    async fetchTransactions(filters?: TransactionFilters) {
      this.loading = true
      try {
        const queryParams = new URLSearchParams()
        
        if (filters?.month) {
          queryParams.append('month', filters.month.toString())
        }
        if (filters?.year) {
          queryParams.append('year', filters.year.toString())
        }
        if (filters?.context) {
          queryParams.append('context', filters.context)
        }
        if (filters?.type) {
          queryParams.append('type', filters.type)
        }
        if (filters?.shareCode) {
          queryParams.append('shareCode', filters.shareCode)
        }

        const query = queryParams.toString()
        const url = query ? `/api/transactions?${query}` : '/api/transactions'
        
        const response = await $fetch<Transaction[]>(url)
        this.transactions = response
        
        if (filters) {
          this.filters = { ...this.filters, ...filters }
        }
      } catch (error) {
        console.error('Erro ao buscar transações:', error)
      } finally {
        this.loading = false
      }
    },

    async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      try {
        const response = await $fetch<Transaction>('/api/transactions', {
          method: 'POST',
          body: transactionData
        })

        this.transactions.push(response)
        return response
      } catch (error) {
        console.error('Erro ao criar transação:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTransaction(id: number) {
      this.loading = true
      try {
        await $fetch(`/api/transactions/${id}`, {
          method: 'DELETE'
        })

        this.transactions = this.transactions.filter(t => t.id !== id)
      } catch (error) {
        console.error('Erro ao deletar transação:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTransaction(id: number) {
      this.loading = true
      try {
        const response = await $fetch<Transaction>(`/api/transactions/${id}`)
        return response
      } catch (error) {
        console.error('Erro ao buscar transação:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTransaction(id: number, transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      try {
        const response = await $fetch<Transaction>(`/api/transactions/${id}`, {
          method: 'PUT',
          body: transactionData
        })

        const index = this.transactions.findIndex(t => t.id === id)
        if (index !== -1) {
          this.transactions[index] = response
        }

        return response
      } catch (error) {
        console.error('Erro ao atualizar transação:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

