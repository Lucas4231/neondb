const express = require('express');
const router = express.Router();
const UserController = require('./controllers/userControllers');
const authMiddleware = require('./middleware/authorization');
const adminMiddleware = require('./middleware/adminAuthorization');
const { upload } = require('./config/cloudinary');
const { uploadImage, deleteImage } = require('./controllers/uploadController');

// Rotas públicas
router.post('/auth/register', UserController.create);
router.post('/auth/login', UserController.authenticate);

// Rotas de usuário (protegidas)
router.get('/user/me', authMiddleware, UserController.getCurrentUser);
router.put('/user/profile', authMiddleware, UserController.update);
router.put('/user/profile-image', authMiddleware, UserController.updateProfileImage);

// Rotas de administrador
router.get('/admin/users', [authMiddleware, adminMiddleware], UserController.listAll);
router.delete('/admin/users/:id', [authMiddleware, adminMiddleware], UserController.delete);

// Rotas para upload de imagens
router.post('/upload', upload.single('image'), uploadImage);
router.delete('/upload/:public_id', deleteImage);

// Rota de teste
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Rota de teste do Cloudinary
router.get('/test-cloudinary', async (req, res) => {
    try {
        const { cloudinary } = require('./config/cloudinary');
        console.log('Tentando conectar ao Cloudinary...');
        console.log('Configuração:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'Não configurado',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'Não configurado'
        });
        
        const result = await cloudinary.api.ping();
        console.log('Resposta do Cloudinary:', result);
        res.json({ 
            message: 'Cloudinary está funcionando!', 
            result,
            config: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'Não configurado',
                api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'Não configurado'
            }
        });
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            error: 'Erro ao conectar com Cloudinary', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;