const banco = require('../config/banco');

const usuarios = {
    cadastrar: async (nome, cpf, email, telefone, senha, tipo_usuario, status) => {
        const sql = `
            INSERT INTO usuarios (nome, cpf, email, telefone, senha, tipo_usuario, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultado] = await banco.query(sql, [
            nome, cpf, email, telefone, senha, tipo_usuario, status
        ]);
        return resultado.insertId;
    },

    // Renomeado para buscarPorEmail para fazer sentido com o Controller
    buscarPorEmail: async (email) => {
        const sql = "SELECT * FROM usuarios WHERE email = ? LIMIT 1";
        const [rows] = await banco.query(sql, [email]);
        return rows[0];
    },

    buscarPorNome: async (nome) => {
        const sql = `SELECT * FROM usuarios WHERE nome = ? LIMIT 1`;
        const [rows] = await banco.query(sql, [nome]);
        return rows[0];
    },

    buscarPorId: async (id_usuario) => {
        const sql = `SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1`;
        const [rows] = await banco.query(sql, [id_usuario]);
        return rows[0];
    }
};

module.exports = usuarios;