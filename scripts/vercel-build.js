// scripts/vercel-build.js
// Script completo para build no Vercel
// Gerencia DATABASE_URL para Turso durante prisma generate

import { execSync } from 'child_process'

const databaseUrl = process.env.DATABASE_URL
const originalDatabaseUrl = process.env.DATABASE_URL_ORIGINAL || databaseUrl

console.log('🚀 Iniciando build para Vercel...\n')

if (!databaseUrl && !originalDatabaseUrl) {
    console.log('⚠️  DATABASE_URL não encontrada')
    console.log('ℹ️  Configure DATABASE_URL no Vercel.')
    process.exit(1)
}

const isTurso = (originalDatabaseUrl || databaseUrl || '').startsWith('libsql://')

if (isTurso) {
    console.log('✅ Detectado Turso (libsql://)')
    console.log('ℹ️  Usando URL temporária para prisma generate...\n')

    // Para prisma generate, usar URL temporária (Prisma valida a URL)
    const tempUrl = 'file:./.temp-prisma-generate.db'
    process.env.DATABASE_URL = tempUrl

    try {
        console.log('📦 Executando prisma generate...')
        execSync('npx prisma generate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: tempUrl } })
        console.log('✅ Prisma generate concluído\n')
    } catch (error) {
        console.error('❌ Erro no prisma generate:', error.message)
        process.exit(1)
    }

    // Restaurar URL original para o resto do build
    process.env.DATABASE_URL = originalDatabaseUrl
} else {
    console.log('✅ Usando banco de dados padrão')
    try {
        console.log('📦 Executando prisma generate...')
        execSync('npx prisma generate', { stdio: 'inherit' })
        console.log('✅ Prisma generate concluído\n')
    } catch (error) {
        console.error('❌ Erro no prisma generate:', error.message)
        process.exit(1)
    }
}

// Executar script de migração
try {
    console.log('🔄 Verificando migrações...')
    execSync('node scripts/migrate-turso.js', { stdio: 'inherit' })
    console.log('✅ Migrações verificadas\n')
} catch (error) {
    console.error('❌ Erro nas migrações:', error.message)
    // Não falhar o build se for apenas aviso
    if (error.status !== 0) {
        process.exit(1)
    }
}

// Executar build do Nuxt
try {
    console.log('🏗️  Executando build do Nuxt...')
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Build concluído com sucesso!')
} catch (error) {
    console.error('❌ Erro no build do Nuxt:', error.message)
    process.exit(1)
}

