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
    },

    // ─── NOVO: busca dados da conta sem retornar a senha ───────────────────────
    buscarContaPorId: async (id_usuario) => {
        const sql = `
            SELECT id_usuario, nome, cpf, email, telefone, tipo_usuario, status
            FROM usuarios
            WHERE id_usuario = ?
            LIMIT 1
        `;
        const [rows] = await banco.query(sql, [id_usuario]);
        return rows[0];
    },

    // ─── NOVO: atualiza dados da conta (senha é opcional) ──────────────────────
    atualizarConta: async (id_usuario, nome, email, telefone, novaSenhaHash = null) => {
        let sql;
        let params;

        if (novaSenhaHash) {
            sql = `
                UPDATE usuarios
                SET nome = ?, email = ?, telefone = ?, senha = ?, data_atualizacao = NOW()
                WHERE id_usuario = ?
            `;
            params = [nome, email, telefone, novaSenhaHash, id_usuario];
        } else {
            sql = `
                UPDATE usuarios
                SET nome = ?, email = ?, telefone = ?, data_atualizacao = NOW()
                WHERE id_usuario = ?
            `;
            params = [nome, email, telefone, id_usuario];
        }

        const [resultado] = await banco.query(sql, params);
        return resultado.affectedRows;
    }
};

module.exports = usuarios;