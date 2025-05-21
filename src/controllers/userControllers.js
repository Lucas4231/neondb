const prisma = require('../database/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
    // Criar usuário
    async create(req, res) {
        try {
            const { nome, email, password, level } = req.body;

            // Verifica se o email já existe
            const existingUser = await prisma.usuario.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ mensagem: 'Email já cadastrado' });
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10);

            // Cria o usuário
            const user = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    password: hashedPassword,
                    level: level || 1 // Se não especificado, cria como usuário comum
                }
            });

            // Remove a senha do objeto retornado
            const { password: _, ...userWithoutPassword } = user;

            return res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ mensagem: 'Erro ao criar usuário' });
        }
    }

    // Autenticar usuário
    async authenticate(req, res) {
        try {
            const { email, password } = req.body;

            // Busca o usuário pelo email
            const user = await prisma.usuario.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
            }

            // Verifica a senha
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
            }

            // Gera o token JWT
            const token = jwt.sign(
                {
                    idUser: user.cod_usuario,
                    nome: user.nome,
                    email: user.email,
                    level: user.level
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove a senha do objeto retornado
            const { password: _, ...userWithoutPassword } = user;

            return res.json({
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return res.status(500).json({ mensagem: 'Erro na autenticação' });
        }
    }

    // Buscar usuário atual
    async getCurrentUser(req, res) {
        try {
            const userId = req.user.idUser;

            const user = await prisma.usuario.findUnique({
                where: { cod_usuario: userId }
            });

            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            // Remove a senha do objeto retornado
            const { password: _, ...userWithoutPassword } = user;

            return res.json(userWithoutPassword);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
        }
    }

    // Atualizar usuário
    async update(req, res) {
        try {
            const userId = req.user.idUser;
            const { nome, email, senhaAtual, novaSenha } = req.body;

            // Busca o usuário atual
            const user = await prisma.usuario.findUnique({
                where: { cod_usuario: userId }
            });

            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            // Se estiver alterando a senha
            if (novaSenha) {
                if (!senhaAtual) {
                    return res.status(400).json({ mensagem: 'Senha atual é obrigatória para alterar a senha' });
                }

                // Verifica a senha atual
                const validPassword = await bcrypt.compare(senhaAtual, user.password);
                if (!validPassword) {
                    return res.status(401).json({ mensagem: 'Senha atual incorreta' });
                }

                // Hash da nova senha
                const hashedPassword = await bcrypt.hash(novaSenha, 10);
                user.password = hashedPassword;
            }

            // Atualiza os dados do usuário
            const updatedUser = await prisma.usuario.update({
                where: { cod_usuario: userId },
                data: {
                    nome: nome || user.nome,
                    email: email || user.email,
                    password: user.password
                }
            });

            // Remove a senha do objeto retornado
            const { password: _, ...userWithoutPassword } = updatedUser;

            return res.json(userWithoutPassword);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
        }
    }

    // Listar todos os usuários (apenas para administradores)
    async listAll(req, res) {
        try {
            // Verifica se o usuário é administrador
            if (req.user.level !== 2) {
                return res.status(403).json({ mensagem: 'Acesso negado' });
            }

            const users = await prisma.usuario.findMany({
                select: {
                    cod_usuario: true,
                    nome: true,
                    email: true,
                    level: true,
                    createdat: true
                }
            });

            return res.json(users);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return res.status(500).json({ mensagem: 'Erro ao listar usuários' });
        }
    }

    // Deletar usuário (apenas para administradores)
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Verifica se o usuário é administrador
            if (req.user.level !== 2) {
                return res.status(403).json({ mensagem: 'Acesso negado' });
            }

            // Verifica se o usuário existe
            const user = await prisma.usuario.findUnique({
                where: { cod_usuario: parseInt(id) }
            });

            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            // Deleta o usuário
            await prisma.usuario.delete({
                where: { cod_usuario: parseInt(id) }
            });

            return res.json({ mensagem: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ mensagem: 'Erro ao deletar usuário' });
        }
    }

    // Atualizar foto do perfil
    async updateProfileImage(req, res) {
        try {
            const userId = req.user.idUser;
            const { imageUrl } = req.body;

            console.log('Recebendo requisição para atualizar imagem:', {
                userId,
                imageUrl,
                body: req.body
            });

            if (!imageUrl) {
                console.log('URL da imagem não fornecida');
                return res.status(400).json({ mensagem: 'URL da imagem é obrigatória' });
            }

            // Verifica se o usuário existe
            const user = await prisma.usuario.findUnique({
                where: { cod_usuario: userId }
            });

            if (!user) {
                console.log('Usuário não encontrado:', userId);
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            console.log('Atualizando imagem de perfil:', { userId, imageUrl });

            const updatedUser = await prisma.usuario.update({
                where: { cod_usuario: userId },
                data: {
                    profileImage: imageUrl
                }
            });

            console.log('Usuário atualizado com sucesso:', {
                userId: updatedUser.cod_usuario,
                profileImage: updatedUser.profileImage
            });

            // Remove a senha do objeto retornado
            const { password: _, ...userWithoutPassword } = updatedUser;

            return res.json(userWithoutPassword);
        } catch (error) {
            console.error('Erro detalhado ao atualizar foto do perfil:', error);
            return res.status(500).json({ mensagem: 'Erro ao atualizar foto do perfil' });
        }
    }
}

module.exports = new UserController();