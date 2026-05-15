const usuariosModel = require('../model/usuariosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SEGREDO } = require('../middlewares/authenticar');

const usuariosController = {

    cadastrar: async (req, res) => {
        // Mantido igual ao seu código original
        try {
            const { nome, cpf, email, telefone, senha, tipo_usuario, status } = req.body;
            const senhaHash = await bcrypt.hash(senha, 10);
            const id = await usuariosModel.cadastrar(nome, cpf, email, telefone, senhaHash, tipo_usuario, status);
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao cadastrar usuário.', detalhe: error.message });
        }
    },

    login: async (req, res) => {
        // Mantido igual ao seu código original
        try {
            const { email, senha } = req.body;
            const usuario = await usuariosModel.buscarPorEmail(email);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Senha incorreta.' });
            }

            const token = jwt.sign(
                {
                    id_usuario: usuario.id_usuario,
                    nome: usuario.nome,
                    tipo_usuario: usuario.tipo_usuario
                },
                SEGREDO,
                { expiresIn: '8h' }
            );

            res.json({ mensagem: 'Login realizado com sucesso!', token });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao realizar login.', detalhe: error.message });
        }
    },

    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            const usuario = await usuariosModel.buscarPorNome(nome);
            if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar usuário.', detalhe: error.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await usuariosModel.buscarPorId(id);
            if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar usuário.', detalhe: error.message });
        }
    },

    // ─── NOVO: retorna os dados da conta do usuário logado ────────────────────
    getConta: async (req, res) => {
        try {
            // req.usuario vem do middleware authenticar (JWT decodificado)
            const id_usuario = req.usuario.id_usuario;

            const usuario = await usuariosModel.buscarContaPorId(id_usuario);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            res.json(usuario);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar dados da conta.', detalhe: error.message });
        }
    },

    // ─── NOVO: atualiza os dados da conta do usuário logado ──────────────────
    atualizarConta: async (req, res) => {
        try {
            const id_usuario = req.usuario.id_usuario;
            const { nome, email, telefone, senhaAtual, novaSenha } = req.body;

            // Busca o usuário completo (com senha) para validar
            const usuarioCompleto = await usuariosModel.buscarPorId(id_usuario);
            if (!usuarioCompleto) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            // Se enviou nova senha, valida a senha atual primeiro
            let novaSenhaHash = null;
            if (novaSenha) {
                if (!senhaAtual) {
                    return res.status(400).json({ erro: 'Informe a senha atual para trocar a senha.' });
                }

                const senhaValida = await bcrypt.compare(senhaAtual, usuarioCompleto.senha);
                if (!senhaValida) {
                    return res.status(401).json({ erro: 'Senha atual incorreta.' });
                }

                novaSenhaHash = await bcrypt.hash(novaSenha, 10);
            }

            const linhasAfetadas = await usuariosModel.atualizarConta(
                id_usuario, nome, email, telefone, novaSenhaHash
            );

            if (linhasAfetadas === 0) {
                return res.status(400).json({ erro: 'Nenhuma alteração foi realizada.' });
            }

            res.json({ mensagem: 'Dados atualizados com sucesso!' });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao atualizar conta.', detalhe: error.message });
        }
    }
};

module.exports = usuariosController;