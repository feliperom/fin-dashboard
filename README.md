# Dashboard Financeiro para Desenvolvedor PJ

Dashboard financeiro completo para gerenciar transações separadas entre contexto Empresarial (PJ) e Pessoal (PF).

## Stack Tecnológica

- **Framework:** Nuxt 3
- **UI Library:** Nuxt UI (Tailwind CSS + Headless UI)
- **Gráficos:** Vue-Chartjs (Chart.js)
- **Banco de Dados:** SQLite
- **ORM:** Prisma
- **Gerenciamento de Estado:** Pinia
- **Validação:** Zod

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

3. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- **Gestão de Transações:** Criação, listagem e exclusão de transações
- **Separação PJ/PF:** Transações separadas por contexto (Empresarial ou Pessoal)
- **Dashboard Visual:** Gráficos de evolução de saldo e estatísticas
- **Dark Mode:** Interface com tema escuro obrigatório
- **Validação:** Formulários validados com Zod

## Estrutura do Projeto

- `pages/index.vue` - Página principal do dashboard
- `components/TransactionModal.vue` - Modal para cadastro de transações
- `components/BalanceChart.vue` - Componente de gráfico de linha
- `stores/transactions.ts` - Store Pinia para gerenciamento de estado
- `server/api/transactions/` - Rotas de API para CRUD de transações
- `prisma/schema.prisma` - Schema do banco de dados

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run db:migrate` - Executa migrações do Prisma
- `npm run db:studio` - Abre o Prisma Studio para visualizar dados

