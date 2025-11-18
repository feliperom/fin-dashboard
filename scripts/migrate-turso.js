// scripts/migrate-turso.js
// Script para aplicar migrações no Turso ou SQLite
import { execSync } from 'child_process'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error('⚠️  DATABASE_URL não encontrada')
    console.log('ℹ️  Pulando migrações. Configure DATABASE_URL no Vercel.')
    process.exit(0) // Não falhar o build se DATABASE_URL não estiver configurada
}

// Verificar se é Turso (libsql://)
if (databaseUrl.startsWith('libsql://')) {
    console.log('✅ Detectado Turso (libsql://)')
    console.log('ℹ️  Para Turso, as migrações devem ser aplicadas manualmente:')
    console.log('   1. Via Turso CLI: turso db shell <nome> < migration.sql')
    console.log('   2. Ou via Turso Studio')
    console.log('ℹ️  Pulando prisma migrate deploy (não suportado para Turso)')
    process.exit(0)
} else if (databaseUrl.startsWith('file:')) {
    // Para SQLite local, usar prisma migrate deploy normalmente
    console.log('✅ Detectado SQLite local (file:)')
    console.log('🔄 Executando prisma migrate deploy...')
    try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })
        console.log('✅ Migrações aplicadas com sucesso')
    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error.message)
        // Não falhar o build se as migrações já foram aplicadas
        process.exit(0)
    }
} else {
    // Para outros bancos (PostgreSQL, etc)
    console.log('✅ Detectado outro banco de dados')
    console.log('🔄 Executando prisma migrate deploy...')
    try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })
        console.log('✅ Migrações aplicadas com sucesso')
    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error.message)
        process.exit(1)
    }
}

