const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PublicacaoController {
    // Criar uma nova publicação
    async create(req, res) {
        try {
            console.log('Recebendo requisição para criar publicação...');
            console.log('Body:', req.body);
            console.log('File:', req.file);
            console.log('User:', req.user);

            const { description } = req.body;
            const userId = req.user.idUser;
            
            // Verificar se a imagem foi enviada
            if (!req.file) {
                console.error('Nenhum arquivo enviado');
                return res.status(400).json({ error: 'Imagem é obrigatória' });
            }

            // Usar o path da imagem do Cloudinary
            const imageUrl = req.file.path;

            if (!description) {
                console.error('Descrição não encontrada no request');
                return res.status(400).json({ error: 'Descrição é obrigatória' });
            }

            if (!userId) {
                console.error('ID do usuário não encontrado');
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }

            console.log('Criando publicação com:', {
                imagem: imageUrl,
                descricao: description,
                usuarioId: userId
            });

            const publicacao = await prisma.publicacao.create({
                data: {
                    imagem: imageUrl,
                    descricao: description,
                    usuario: {
                        connect: {
                            cod_usuario: userId
                        }
                    }
                },
                include: {
                    usuario: {
                        select: {
                            cod_usuario: true,
                            nome: true,
                            profileImage: true,
                        },
                    },
                },
            });

            console.log('Publicação criada com sucesso:', publicacao);
            return res.status(201).json(publicacao);
        } catch (error) {
            console.error('Erro ao criar publicação:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar publicação',
                details: error.message
            });
        }
    }

    // Listar todas as publicações
    async list(req, res) {
        try {
            const publicacoes = await prisma.publicacao.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    usuario: {
                        select: {
                            cod_usuario: true,
                            nome: true,
                            profileImage: true,
                        },
                    },
                },
            });

            return res.json(publicacoes);
        } catch (error) {
            console.error('Erro ao listar publicações:', error);
            return res.status(500).json({ error: 'Erro ao listar publicações' });
        }
    }

    // Curtir uma publicação
    async curtir(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.idUser;

            // Verificar se o usuário já curtiu
            const curtida = await prisma.curtida.findFirst({
                where: {
                    publicacaoId: parseInt(id),
                    usuarioId: userId,
                },
            });

            if (curtida) {
                return res.status(400).json({ error: 'Você já curtiu esta publicação' });
            }

            // Criar a curtida e incrementar o contador
            await prisma.$transaction([
                prisma.curtida.create({
                    data: {
                        publicacaoId: parseInt(id),
                        usuarioId: userId,
                    },
                }),
                prisma.publicacao.update({
                    where: { id: parseInt(id) },
                    data: { curtidas: { increment: 1 } },
                }),
            ]);

            return res.json({ message: 'Publicação curtida com sucesso' });
        } catch (error) {
            console.error('Erro ao curtir publicação:', error);
            return res.status(500).json({ error: 'Erro ao curtir publicação' });
        }
    }

    // Descurtir uma publicação
    async descurtir(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.idUser;

            // Verificar se o usuário já curtiu
            const curtida = await prisma.curtida.findFirst({
                where: {
                    publicacaoId: parseInt(id),
                    usuarioId: userId,
                },
            });

            if (!curtida) {
                return res.status(400).json({ error: 'Você ainda não curtiu esta publicação' });
            }

            // Remover a curtida e decrementar o contador
            await prisma.$transaction([
                prisma.curtida.delete({
                    where: { id: curtida.id },
                }),
                prisma.publicacao.update({
                    where: { id: parseInt(id) },
                    data: { curtidas: { decrement: 1 } },
                }),
            ]);

            return res.json({ message: 'Curtida removida com sucesso' });
        } catch (error) {
            console.error('Erro ao descurtir publicação:', error);
            return res.status(500).json({ error: 'Erro ao descurtir publicação' });
        }
    }
}

module.exports = new PublicacaoController(); 