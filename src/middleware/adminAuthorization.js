const adminAuthorization = (req, res, next) => {
    if (req.user.level !== 2) {
        return res.status(403).send({ 
            mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
        });
    }
    next();
};

module.exports = adminAuthorization; 