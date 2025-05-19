const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Verificar se as variáveis de ambiente estão definidas
console.log('Configuração do Cloudinary:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Definido' : 'Não definido');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Definido' : 'Não definido');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Definido' : 'Não definido');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Erro: Variáveis de ambiente do Cloudinary não estão definidas!');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cidadeemfoco',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
}; 