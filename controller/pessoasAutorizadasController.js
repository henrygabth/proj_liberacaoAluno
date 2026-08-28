//Pessoas autorizadas controller
const pessoas = require('../model/pessoasAutorizadasModel');

const pessoasController = {
    cadastrar: async (req, res) => {
        try {
            const { usuario_id, nome, cpf, telefone, parentesco } = req.body;
            if (!usuario_id || !nome || !cpf) {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
            }
            const id = await pessoas.cadastrar(usuario_id, nome, cpf, telefone, parentesco);
            res.status(201).json({ mensagem: `Pessoa autorizada ${id} cadastrada com sucesso` });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao cadastrar pessoa autorizada" });
        }
    },

    listarPorUsuario: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const resultado = await pessoas.listarPorUsuario(usuario_id);
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar pessoas autorizadas" });
        }
    }
};

module.exports = pessoasController;
