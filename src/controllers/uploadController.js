const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }

        // Retorna a URL completa da imagem e outras informações
        res.json({
            url: req.file.path,
            secure_url: req.file.path.replace('http://', 'https://'),
            public_id: req.file.filename
        });
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.params;
        
        await cloudinary.uploader.destroy(public_id);
        
        res.json({ message: 'Imagem deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        res.status(500).json({ error: 'Erro ao deletar imagem' });
    }
};

module.exports = {
    uploadImage,
    deleteImage
}; 