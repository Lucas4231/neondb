const express = require('express');
const router = express.Router();
const UserController = require('./controllers/userControllers');
const authMiddleware = require('./middleware/authorization');
const adminMiddleware = require('./middleware/adminAuthorization');

// Rotas públicas
router.post('/auth/register', UserController.create);
router.post('/auth/login', UserController.authenticate);

// Rotas de usuário (protegidas)
router.get('/user/me', authMiddleware, UserController.getCurrentUser);
router.put('/user/profile', authMiddleware, UserController.update);

// Rotas de administrador
router.get('/admin/users', [authMiddleware, adminMiddleware], UserController.listAll);
router.delete('/admin/users/:id', [authMiddleware, adminMiddleware], UserController.delete);

// Rota de teste
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

module.exports = router;