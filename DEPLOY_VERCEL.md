# Guia de Deploy no Vercel

Este guia explica como fazer deploy da aplicação Dashboard Financeiro no Vercel.

## ⚠️ Importante: SQLite no Vercel

O Vercel é uma plataforma **serverless**, o que significa que o sistema de arquivos é **read-only**. SQLite não funciona diretamente no Vercel porque precisa escrever no disco.

### Opções de Banco de Dados:

1. **Turso** (Recomendado) - SQLite distribuído, compatível com Prisma
2. **Vercel Postgres** - PostgreSQL gerenciado pelo Vercel
3. **PlanetScale** - MySQL serverless
4. **Supabase** - PostgreSQL com tier gratuito

## Opção 1: Usar Turso (SQLite Distribuído) - RECOMENDADO

### Vantagens:
- Mantém SQLite (sem mudanças no código)
- Compatível com Prisma
- Tier gratuito generoso
- Fácil migração

### Passo a Passo:

#### 1. Criar Conta no Turso

1. Acesse [turso.tech](https://turso.tech)
2. Crie uma conta (gratuita)
3. Crie um novo banco de dados
4. Copie a connection string (formato: `libsql://...`)

#### 2. Atualizar Prisma Schema

O schema já está configurado para usar `DATABASE_URL`. Você só precisa:

1. Instalar o driver do Turso:
```bash
npm install @libsql/client
```

2. Atualizar `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Adicionar esta linha
}
```

#### 3. Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Importe seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Cole a connection string do Turso
   - `NODE_ENV`: `production`

#### 4. Deploy

O Vercel detectará automaticamente o Nuxt 3 e fará o deploy.

#### 5. Executar Migrações

Após o primeiro deploy, execute as migrações:

```bash
# Via Vercel CLI
vercel env pull
npx prisma migrate deploy

# Ou via Turso CLI
turso db shell <nome-do-banco> < arquivo-migration.sql
```

## Opção 2: Usar Vercel Postgres (PostgreSQL)

### Vantagens:
- Integração nativa com Vercel
- Tier gratuito disponível
- Mais robusto para produção

### Desvantagens:
- Requer migração do schema para PostgreSQL

### Passo a Passo:

#### 1. Atualizar Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. Criar Banco no Vercel

1. No painel do Vercel, vá em **Storage**
2. Clique em **Create Database** > **Postgres**
3. Escolha o plano **Hobby** (gratuito)
4. Copie a connection string

#### 3. Configurar Variáveis

No Vercel, adicione:
- `DATABASE_URL`: Connection string do Postgres (já configurada automaticamente)
- `POSTGRES_URL`: (opcional, para compatibilidade)

#### 4. Migrar Schema

```bash
# Gerar nova migração para PostgreSQL
npx prisma migrate dev --name migrate_to_postgres

# Aplicar em produção
npx prisma migrate deploy
```

## Opção 3: Usar Supabase (PostgreSQL)

### Vantagens:
- Tier gratuito generoso
- Interface de administração
- APIs adicionais

### Passo a Passo:

1. Crie conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a connection string (Settings > Database)
4. Configure no Vercel como `DATABASE_URL`
5. Atualize o schema do Prisma para PostgreSQL (mesmo processo da Opção 2)

## Configuração do Vercel

### Arquivo `vercel.json`

Já está criado com as configurações básicas. O Vercel detecta automaticamente Nuxt 3, mas o arquivo ajuda com configurações customizadas.

### Variáveis de Ambiente

No painel do Vercel (Settings > Environment Variables), configure:

- `DATABASE_URL`: Connection string do banco escolhido
- `NODE_ENV`: `production`

### Build Settings

O Vercel detecta automaticamente:
- **Framework**: Nuxt.js
- **Build Command**: `npm run build`
- **Output Directory**: `.output`
- **Install Command**: `npm install`

## Executar Migrações

### Opção 1: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Linkar projeto
vercel link

# Baixar variáveis de ambiente
vercel env pull

# Executar migrações
npx prisma migrate deploy
```

### Opção 2: Via Script de Build

Adicione ao `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && nuxt build"
  }
}
```

E configure no `vercel.json`:

```json
{
  "buildCommand": "npm run vercel-build"
}
```

## Troubleshooting

### Erro: "Database file not found"

- SQLite não funciona no Vercel (serverless)
- Use Turso, Vercel Postgres ou Supabase

### Erro: "Cannot connect to database"

- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que o banco está acessível (não bloqueado por firewall)
- Verifique os logs do Vercel para mais detalhes

### Erro: "Prisma Client not generated"

- Adicione `prisma generate` ao build command
- Ou use o script `vercel-build` sugerido acima

### Build falha

- Verifique os logs de build no Vercel
- Confirme que todas as dependências estão no `package.json`
- Verifique se o `postinstall` está executando `prisma generate`

### Cookies não funcionam

- Verifique se `NODE_ENV=production` está configurado
- O Vercel usa HTTPS automaticamente
- Verifique os logs do servidor para erros de cookie

## Recomendação Final

**Para facilitar a migração, recomendo usar Turso:**
- Mantém SQLite (sem mudanças grandes no código)
- Funciona perfeitamente com Prisma
- Tier gratuito generoso
- Fácil de configurar

## Próximos Passos

1. Escolha uma opção de banco de dados (recomendado: Turso)
2. Configure o banco e obtenha a connection string
3. Configure no Vercel
4. Faça o deploy
5. Execute as migrações
6. Teste a aplicação

## Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/docs)

