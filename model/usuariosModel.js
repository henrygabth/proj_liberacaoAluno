const db = require('../config/banco');

const usuariosModel = {
    buscarPorEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0] || null;
    },

    buscarPorNome: async (nome) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE nome LIKE ?', [`%${nome}%`]);
        return rows[0] || null;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query(
            'SELECT id_usuario, nome, email, telefone, tipo_usuario, status FROM usuarios WHERE id_usuario = ?',
            [id]
        );
        return rows[0] || null;
    },

    buscarContaPorId: async (id) => {
        const [rows] = await db.query(
            'SELECT id_usuario, nome, email, telefone, tipo_usuario FROM usuarios WHERE id_usuario = ?',
            [id]
        );
        return rows[0] || null;
    },

    cadastrar: async (nome, cpf, email, telefone, senhaHash, tipo_usuario, status) => {
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, cpf, email, telefone, senha, tipo_usuario, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, cpf, email, telefone, senhaHash, tipo_usuario, status]
        );
        return result.insertId;
    },

    atualizarConta: async (id, nome, email, telefone, novaSenhaHash) => {
        if (novaSenhaHash) {
            await db.query(
                'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), telefone = COALESCE(?, telefone), senha = ? WHERE id_usuario = ?',
                [nome, email, telefone, novaSenhaHash, id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), telefone = COALESCE(?, telefone) WHERE id_usuario = ?',
                [nome, email, telefone, id]
            );
        }
    }
};

module.exports = usuariosModel;