# Configuração Rápida: Turso + Vercel

Este guia mostra como configurar o Turso (SQLite distribuído) para usar com Vercel.

## Por que Turso?

- ✅ Mantém SQLite (sem mudanças no código)
- ✅ Compatível com Prisma
- ✅ Tier gratuito generoso (500 databases, 1GB storage)
- ✅ Fácil de configurar
- ✅ Funciona perfeitamente com Vercel (serverless)

## Passo a Passo

### 1. Criar Conta no Turso

1. Acesse [turso.tech](https://turso.tech)
2. Clique em "Sign Up" e crie uma conta (pode usar GitHub)
3. Após login, você verá o dashboard

### 2. Criar Banco de Dados

1. No dashboard, clique em "Create Database"
2. Escolha um nome (ex: `fin-dashboard`)
3. Escolha uma região próxima (ex: `São Paulo` ou `US East`)
4. Clique em "Create"
5. Após criar, você verá a connection string (formato: `libsql://...`)

### 3. Instalar Turso CLI (Opcional, mas recomendado)

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Ou via Homebrew
brew install tursodatabase/tap/turso

# Verificar instalação
turso --version
```

### 4. Configurar Prisma para Turso

O schema já está configurado para usar `DATABASE_URL`. Você só precisa:

1. Instalar o driver do Turso:
```bash
npm install @libsql/client
```

2. O Prisma já está configurado corretamente no `schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Nota**: O Turso usa SQLite, então não precisa mudar o provider!

### 5. Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New" > "Project"
3. Importe seu repositório GitHub (`feliperom/fin-dashboard`)
4. Configure as variáveis de ambiente:
   - Vá em **Settings** > **Environment Variables**
   - Adicione:
     - **Key**: `DATABASE_URL`
     - **Value**: Cole a connection string do Turso (formato: `libsql://...`)
     - Marque para **Production**, **Preview** e **Development**
   - Adicione também:
     - **Key**: `NODE_ENV`
     - **Value**: `production`
     - Marque para **Production**

### 6. Deploy

1. Clique em "Deploy"
2. O Vercel fará o build automaticamente
3. O script `vercel-build` executará:
   - `prisma generate` - Gera o Prisma Client
   - `prisma migrate deploy` - Aplica as migrações
   - `nuxt build` - Build da aplicação

### 7. Aplicar Migrações no Turso

**IMPORTANTE**: As migrações do Prisma não são aplicadas automaticamente no Turso durante o build. Você precisa aplicá-las manualmente:

#### Opção 1: Via Turso CLI (Recomendado)

```bash
# Instalar Turso CLI (se ainda não tiver)
curl -sSfL https://get.tur.so/install.sh | bash

# Fazer login
turso auth login

# Listar seus bancos
turso db list

# Aplicar migrações
# Para cada arquivo de migração em prisma/migrations/:
turso db shell fin-dashboard-feliperom < prisma/migrations/20251118204751_add_user_auth/migration.sql

# Ou aplicar todas de uma vez:
for migration in prisma/migrations/*/migration.sql; do
  turso db shell fin-dashboard-feliperom < "$migration"
done
```

#### Opção 2: Via Turso Studio

1. Acesse [turso.tech](https://turso.tech) e faça login
2. Selecione seu banco de dados
3. Vá em "SQL Editor"
4. Cole o conteúdo de cada arquivo de migração e execute

#### Opção 3: Script Automatizado

Crie um script `scripts/apply-turso-migrations.sh`:

```bash
#!/bin/bash
DB_NAME="fin-dashboard-feliperom"
for migration in prisma/migrations/*/migration.sql; do
  echo "Aplicando: $migration"
  turso db shell $DB_NAME < "$migration"
done
```

### 8. Verificar Deploy

1. Após o deploy, você receberá uma URL (ex: `fin-dashboard.vercel.app`)
2. Acesse a URL e teste:
   - Registro de usuário
   - Login
   - Criação de transações

## Executar Migrações Manualmente (se necessário)

Se as migrações não rodarem automaticamente no build:

### Via Turso CLI:

```bash
# Fazer login
turso auth login

# Listar databases
turso db list

# Executar SQL diretamente
turso db shell <nome-do-banco>

# Ou aplicar migração
turso db shell <nome-do-banco> < prisma/migrations/.../migration.sql
```

### Via Vercel CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Linkar projeto
vercel link

# Baixar variáveis de ambiente
vercel env pull

# Executar migrações localmente (com DATABASE_URL do Turso)
npx prisma migrate deploy
```

## Troubleshooting

### Erro: "Invalid database URL"

- Verifique se a connection string do Turso está correta
- Formato esperado: `libsql://...`
- Certifique-se de que copiou a string completa

### Erro: "Database not found"

- Verifique se o banco foi criado no Turso
- Confirme que está usando a connection string correta
- Verifique se o banco está na região correta

### Erro: "Migration failed"

- Execute as migrações manualmente via Turso CLI
- Ou via Vercel CLI após configurar as variáveis

### Build falha no Vercel

- Verifique os logs de build no Vercel
- Confirme que `DATABASE_URL` está configurada
- Verifique se `@libsql/client` está instalado

## Próximos Passos

1. ✅ Criar conta no Turso
2. ✅ Criar banco de dados
3. ✅ Copiar connection string
4. ✅ Configurar no Vercel
5. ✅ Fazer deploy
6. ✅ Testar aplicação

## Links Úteis

- [Turso Dashboard](https://turso.tech)
- [Turso Documentation](https://docs.turso.tech)
- [Turso CLI](https://docs.turso.tech/cli)
- [Vercel Documentation](https://vercel.com/docs)

## Dica

Para desenvolvimento local, você pode usar o Turso local:

```bash
# Criar banco local
turso db create --local fin-dashboard-local

# Obter connection string local
turso db show fin-dashboard-local --url

# Usar no .env local
DATABASE_URL="libsql://fin-dashboard-local.turso.io/..."
```

