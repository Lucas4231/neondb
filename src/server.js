const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();

// Configuração do CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://cidadeemfoco.vercel.app', 'exp://192.168.1.7:19000', 'exp://localhost:19000'] 
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
    
     