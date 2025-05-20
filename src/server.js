const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const prisma = require('./database/prisma');
require('dotenv').config();

const app = express();

// Configuração do CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://cidadeemfoco.vercel.app', 'exp://192.168.1.7:19000'] 
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware para parsing do body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Teste de conexão com o banco de dados
app.get('/test-db', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ message: 'Conexão com o banco de dados estabelecida com sucesso!' });
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        res.status(500).json({ 
            error: 'Erro ao conectar com o banco de dados',
            details: error.message
        });
    }
});

// Rotas da API
app.use('/api', routes);

// Rota de healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    
    // Erro de validação
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            mensagem: 'Erro de validação', 
            detalhes: err.message 
        });
    }
    
    // Erro de autenticação
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            mensagem: 'Não autorizado',
            detalhes: err.message
        });
    }
    
    // Erro interno do servidor
    res.status(500).json({ 
        mensagem: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3344;

// Função para iniciar o servidor
async function startServer() {
    try {
        // Conecta ao banco de dados
        await prisma.$connect();
        console.log('Conectado ao banco de dados com sucesso!');

        // Inicia o servidor
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer();

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
    
     