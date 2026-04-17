//Banco de Dados
const banco = require('../config/banco');

const usuarios = {
    cadastrar: async (nome, cpf, email, telefone, senha, tipo_usuario, ativo, data_criacao, data_atualizacao) => {
        const sql = `
            INSERT INTO usuarios (nome, cpf, email, telefone, senha, tipo_usuario, ativo, data_criacao, data_atualizacao) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultado] = await banco.query(sql, [
            nome, cpf, email, telefone, senha, tipo_usuario, ativo, data_criacao, data_atualizacao
        ]);
        return resultado.insertId;
    },

    buscarPorUsuario: async (email) => {
        const sql = `SELECT * FROM usuarios WHERE email = ? LIMIT 1`;
        const [rows] = await banco.query(sql, [email]);
        return rows[0]; // retorna o primeiro usuário encontrado
    }
};

module.exports = usuarios;
