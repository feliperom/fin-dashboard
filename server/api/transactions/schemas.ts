// server/api/transactions/schemas.ts
import { z } from 'zod'

export const createTransactionSchema = z.object({
  label: z.string().min(1, 'Label é obrigatório'),
  type: z.enum(['INCOME', 'EXPENSE']),
  context: z.enum(['BUSINESS', 'PERSONAL']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.union([
    z.number().positive('Valor deve ser positivo'),
    z.string().transform(val => parseFloat(val)).pipe(z.number().positive('Valor deve ser positivo'))
  ]),
  date: z.union([z.string(), z.date()]),
  isRecurring: z.boolean().default(false).optional(),
  status: z.enum(['PAID', 'PENDING']).default('PENDING').optional(),
  tags: z.array(z.string()).default([]).optional()
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

