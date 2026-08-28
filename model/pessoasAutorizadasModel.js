//pessoasAutorizadasModel
const banco = require('../config/banco');

const pessoas = {
    cadastrar: async (usuario_id, nome, cpf, telefone, parentesco) => {
        const sql = `
            INSERT INTO pessoas_autorizadas (usuario_id, nome, cpf, telefone, parentesco, ativo) 
            VALUES (?, ?, ?, ?, ?, 1)
        `;
        const [resultado] = await banco.query(sql, [usuario_id, nome, cpf, telefone, parentesco]);
        return resultado.insertId;
    },

    listarPorUsuario: async (usuario_id) => {
        const sql = "SELECT * FROM pessoas_autorizadas WHERE usuario_id = ? AND ativo = 1";
        const [rows] = await banco.query(sql, [usuario_id]);
        return rows;
    }
};

module.exports = pessoas;
