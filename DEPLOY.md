# Guia de Deploy no Railway

Este guia explica como fazer deploy da aplicação Dashboard Financeiro no Railway.

## Pré-requisitos

1. Conta no [Railway](https://railway.app) (gratuita com $5 crédito/mês)
2. Repositório no GitHub
3. Código commitado e pushado para o GitHub

## Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todas as alterações estão commitadas e pushadas:

```bash
git add .
git commit -m "Preparar para deploy no Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize o Railway a acessar seu GitHub (se necessário)
5. Selecione o repositório `feliperom/fin-dashboard`
6. Selecione a branch `main`

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

- **DATABASE_URL**: Configure como:
  ```
  file:./data/prod.db
  ```
  (O diretório `data` será criado no volume persistente)

**Nota**: O Railway não cria automaticamente o DATABASE_URL. Você precisa adicioná-lo manualmente.

- **NODE_ENV**: `production` (já configurado automaticamente pelo Railway, mas você pode adicionar explicitamente)

### 4. Configurar Volume Persistente (Importante!)

O SQLite precisa de um volume persistente para armazenar o banco de dados:

1. No painel do Railway, vá em **Settings**
2. Clique em **Add Volume**
3. Configure:
   - **Mount Path**: `/app/data` (ou o caminho que você configurou no DATABASE_URL)
   - **Size**: 1GB (suficiente para começar)

### 5. Executar Migrações do Banco de Dados

Após o primeiro deploy, você precisa executar as migrações:

**Opção 1 - Via Terminal do Railway:**
1. No painel do Railway, clique em **Settings** > **Service**
2. Clique em **Open Terminal**
3. Execute: `npm run db:migrate:deploy`

**Opção 2 - Via CLI do Railway:**
```bash
railway run npm run db:migrate:deploy
```

**Opção 3 - Adicionar ao Build (Automático):**
Você pode adicionar um script que executa as migrações automaticamente após o build. Edite o `railway.json` ou adicione ao `package.json`:

```json
"railway:setup": "prisma migrate deploy && npm run build"
```

**Importante**: Execute as migrações apenas uma vez após o primeiro deploy. Migrações subsequentes serão aplicadas automaticamente se você adicionar o script ao build.

### 6. Verificar Deploy

1. Após o deploy, o Railway fornecerá uma URL (ex: `fin-dashboard-production.up.railway.app`)
2. Acesse a URL e verifique se a aplicação está funcionando
3. Teste o registro de usuário e login

### 7. Configurar Domínio Customizado (Opcional)

1. No painel do Railway, vá em **Settings** > **Networking**
2. Clique em **Generate Domain** para obter um domínio Railway
3. Ou adicione seu próprio domínio em **Custom Domain**

## Troubleshooting

### Erro: "Database file not found"

- Verifique se o volume persistente está montado corretamente
- Confirme que o `DATABASE_URL` aponta para o caminho do volume
- Execute as migrações: `npx prisma migrate deploy`

### Erro: "Cannot connect to database"

- Verifique se o volume persistente está configurado
- Confirme as permissões do diretório do banco
- Verifique os logs do Railway para mais detalhes

### Build falha

- Verifique os logs de build no Railway
- Confirme que todas as dependências estão no `package.json`
- Verifique se o `postinstall` script está executando `prisma generate`

### Cookies não funcionam

- Verifique se `NODE_ENV=production` está configurado
- Confirme que o Railway está usando HTTPS (deve ser automático)
- Verifique os logs do servidor para erros de cookie

## Comandos Úteis

```bash
# Ver logs em tempo real
railway logs

# Executar migrações
railway run npx prisma migrate deploy

# Abrir Prisma Studio (desenvolvimento)
railway run npx prisma studio

# Ver variáveis de ambiente
railway variables
```

## Monitoramento

- **Logs**: Acesse **Deployments** > **Logs** para ver logs em tempo real
- **Métricas**: Railway fornece métricas básicas de CPU e memória
- **Uptime**: Railway monitora automaticamente a saúde do serviço

## Custos

- **Tier Gratuito**: $5 crédito/mês
- **Uso típico**: ~$2-3/mês para uma aplicação pequena/média
- **Volume**: 1GB de armazenamento é suficiente para começar

## Próximos Passos

1. Configure backups do banco de dados (opcional)
2. Configure monitoramento adicional (opcional)
3. Configure CI/CD para deploy automático (já configurado via GitHub)

## Suporte

- [Documentação Railway](https://docs.railway.app)
- [Discord Railway](https://discord.gg/railway)
- [Status Railway](https://status.railway.app)

