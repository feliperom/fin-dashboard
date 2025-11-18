# Troubleshooting - Vercel

## Problema: Erro de validação do Prisma com Turso

### Sintomas
```
Invalid `prisma.user.findUnique()` invocation:
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

### Causa
O Prisma valida a URL do banco durante `prisma generate` e rejeita URLs `libsql://` porque o provider `sqlite` espera URLs `file:`.

### Solução
O projeto já está configurado para resolver isso automaticamente:
1. O script `scripts/vercel-build.js` detecta Turso e usa uma URL temporária durante `prisma generate`
2. O `server/utils/prisma.ts` usa o adapter `@prisma/adapter-libsql` em runtime quando detecta `libsql://`
3. O Prisma Client em runtime usa a URL real do Turso através do adapter

**Não é necessário fazer nada** - o build já está configurado corretamente.

### Verificação
Se ainda ocorrer o erro:
1. Verifique se `@prisma/adapter-libsql` está instalado: `npm list @prisma/adapter-libsql`
2. Verifique se o script `vercel-build` está sendo usado no `package.json`
3. Verifique os logs de build no Vercel para confirmar que o script está rodando

## Problema: API não funciona em produção

### Sintomas
- APIs retornam 404 ou erro de conexão
- Middleware não consegue verificar autenticação
- Requisições falham no ambiente de produção

### Soluções

#### 1. Verificar Configuração do Vercel

Certifique-se de que o `vercel.json` está correto:

```json
{
  "buildCommand": "npm run vercel-build",
  "framework": "nuxtjs"
}
```

#### 2. Verificar Variáveis de Ambiente

No painel do Vercel:
- Vá em **Settings** > **Environment Variables**
- Confirme que `DATABASE_URL` está configurada
- Confirme que está marcada para **Production**, **Preview** e **Development**

#### 3. Verificar Logs de Deploy

1. No painel do Vercel, vá em **Deployments**
2. Clique no deployment mais recente
3. Veja os logs de build e runtime
4. Procure por erros relacionados a:
   - `DATABASE_URL not found`
   - `Cannot connect to database`
   - `404` nas rotas de API

#### 4. Testar API Localmente

```bash
# Baixar variáveis de ambiente do Vercel
vercel env pull

# Testar build local
npm run vercel-build

# Testar servidor local
npm start
```

#### 5. Verificar Rotas de API

No Vercel, as rotas de API devem estar em `server/api/`. Verifique se:
- Todos os arquivos estão commitados
- As rotas estão acessíveis (não bloqueadas por `.gitignore`)
- O build está gerando as rotas corretamente

#### 6. Problema Específico: Middleware

Se o middleware não está funcionando, pode ser que `$fetch` não esteja resolvendo corretamente no servidor. 

**Solução**: O middleware já foi atualizado para usar `useRequestHeaders` quando no servidor, garantindo que os cookies sejam passados corretamente.

#### 7. Verificar CORS (se aplicável)

Se você estiver fazendo requisições de outro domínio, pode precisar configurar CORS no `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  }
})
```

#### 8. Verificar Base URL

Se as APIs não estão sendo resolvidas, verifique se há problemas com o `baseURL`. No Nuxt 3, URLs relativas (`/api/...`) devem funcionar automaticamente.

#### 9. Redeploy

Após fazer alterações:
1. Faça commit e push
2. O Vercel fará deploy automático
3. Ou force um novo deploy no painel do Vercel

#### 10. Verificar Funções Serverless

No Vercel, cada rota de API vira uma função serverless. Verifique:
- Se as funções estão sendo criadas corretamente
- Se há timeouts ou limites de memória
- Se há erros nos logs das funções

## Comandos Úteis

```bash
# Ver logs em tempo real
vercel logs

# Testar localmente com variáveis do Vercel
vercel dev

# Verificar variáveis de ambiente
vercel env ls

# Forçar novo deploy
vercel --prod
```

## Contato

Se o problema persistir:
1. Verifique os logs do Vercel
2. Verifique os logs do browser (Console e Network)
3. Consulte a [documentação do Vercel](https://vercel.com/docs)
4. Consulte a [documentação do Nuxt 3](https://nuxt.com/docs)

