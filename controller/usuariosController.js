const usuarios = require('../model/usuariosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SEGREDO = "chave_super_secreta";

const usuariosController = {
    cadastrar: async (req, res) => {
        try {
            const { nome, cpf, email, telefone, senha, tipo_usuario, ativo, data_criacao, data_atualizacao } = req.body;

            if (!nome || !cpf || !email || !telefone || !senha || !tipo_usuario || ativo === undefined) {
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

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
            }

            // Busca usuário pelo email usando a função corrigida no Model
            const usuario = await usuarios.buscarPorEmail(email);

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
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
            console.error(error);
            res.status(500).json({ erro: error.message });
        }
    },

    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.body;
            const resultado = await usuarios.buscarPorNome(nome);
            if (!resultado) {
                return res.status(404).json({ "resultado": "Usuário não encontrado" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao buscar por nome" });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            // Geralmente ID vem por req.params.id, mas mantive req.body conforme seu código
            const { id_usuario } = req.body;
            const resultado = await usuarios.buscarPorId(id_usuario); // Corrigido de 'alunos' para 'usuarios'

            if (!resultado) {
                return res.status(404).json({ "resultado": "ID não encontrado" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao buscar por ID" });
        }
    }
};

module.exports = usuariosController;