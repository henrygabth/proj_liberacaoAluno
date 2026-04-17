const usuarios = require('../model/usuariosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SEGREDO = "chave_super_secreta"; // ideal usar process.env.SEGREDO

const usuariosController = {
    cadastrar: async (req, res) => {
        try {
            const { nome, cpf, email, telefone, senha, tipo_usuario, ativo, data_criacao, data_atualizacao } = req.body;

            if (!nome || !cpf || !email || !telefone || !senha || !tipo_usuario || ativo === undefined || !data_atualizacao) {
                return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const id_usuario = await usuarios.cadastrar(
                nome, cpf, email, telefone, senhaHash, tipo_usuario, ativo, data_criacao, data_atualizacao
            );

            return res.status(201).json({ mensagem: `Usuário ${id_usuario} cadastrado com sucesso` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao cadastrar usuário", detalhes: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            if (!email || !senha || senha.length < 6) {
                return res.status(400).json({ erro: 'Email e senha (mín. 6 chars) são obrigatórios.' });
            }

            // busca usuário pelo email
            const usuario = await usuarios.buscarPorUsuario(email);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            if (!usuario.senha) {
                console.error("ERRO: O usuario foi encontrado, mas a propriedade 'senha' está undefined.", usuario);
                return res.status(500).json({
                    erro: 'Erro interno: A senha não foi retornada pelo banco de dados. Verifique o usuariosModel.'
                });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Senha incorreta.' });
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                SEGREDO,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                mensagem: 'Login realizado com sucesso',
                token
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: error.message });
        }
    }
};

module.exports = usuariosController;
