const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
});

// Tratamento de erros de conexão
prisma.$on('query', (e) => {
    console.log('Query:', e.query);
    console.log('Params:', e.params);
    console.log('Duration:', `${e.duration}ms`);
});

prisma.$on('error', (e) => {
    console.error('Erro do Prisma:', e);
});

// Função para testar a conexão
async function testConnection() {
    try {
        await prisma.$connect();
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        return false;
    }
}

// Testa a conexão ao iniciar
testConnection();

module.exports = prisma; 