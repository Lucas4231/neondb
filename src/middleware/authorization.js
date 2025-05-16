const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Pega o token do header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ mensagem: 'Token não fornecido' });
        }

        // Formato do token: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ mensagem: 'Token mal formatado' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ mensagem: 'Token mal formatado' });
        }

        // Verifica o token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }

            // Adiciona os dados do usuário na requisição
            req.user = decoded;
            return next();
        });
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(500).json({ mensagem: 'Erro na autenticação' });
    }
};