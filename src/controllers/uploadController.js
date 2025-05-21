const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            console.log('Nenhum arquivo recebido na requisição');
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }

        console.log('Arquivo recebido:', {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });

        // Retorna a URL completa da imagem e outras informações
        const response = {
            url: req.file.path,
            secure_url: req.file.path.replace('http://', 'https://'),
            public_id: req.file.filename
        };

        console.log('Resposta do upload:', response);
        res.json(response);
    } catch (error) {
        console.error('Erro detalhado ao fazer upload da imagem:', error);
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