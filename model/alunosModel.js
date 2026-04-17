//Banco de Dados
const banco = require('../config/banco')


const alunos = {
    cadastrar: async (nome, matricula, turma_id, data_nascimento, status, data_criacao) => {
        const sql = "INSERT INTO alunos (nome, matricula, turma_id, data_nascimento, status, data_criacao) VALUES (?,?,?,?,?,?)";
        const [resultado] = await banco.query(sql, [
            nome, matricula, turma_id, data_nascimento, status, data_criacao
        ]);
        return resultado.insertId;
    },
    buscarTodos: async () => {
        const sql = "SELECT * FROM alunos ORDER BY nome";
        const [resultado] = await banco.query(sql);
        //O retorno nesse caso é o próprio resultado,
        //ou seja, todas as linhas do SELECT
        return resultado;
    },
    atualizar: async (nome, matricula, turma_id, data_nascimento, status, data_criacao, aluno_id) => {
        const sql = "UPDATE alunos SET nome =?, matricula =?, turma_id =?, data_nascimento =?, status =?, data_criacao =?WHERE aluno_id =?"
        const [resultado] = await banco.query(
            sql, [nome, matricula, turma_id, data_nascimento, status, data_criacao, aluno_id]
        );
        //Para os comandos de UPDATE e DELETE retornamos
        //o affectedRows (quantidade de linhas atualizadas)
        //O teste > 0 verifica se foram alteradas ao menos
        //1 linha, se for retorna verdadeiro
        return resultado.affectedRows > 0;
    },
    apagar: async (id) => {
        const sql = "DELETE FROM alunos WHERE aluno_id=?";
        const [resultado] = await banco.query(sql, [id]);
        return resultado.affectedRows > 0;
    },
    buscarPorNome: async (nome) => {
        const sql = "SELECT aluno_id FROM alunos WHERE nome=?";
        const [resultado] = await banco.query(sql, [nome]);
        return resultado;
    },
    buscarPorId: async (id) => {
        const sql = "SELECT nome FROM alunos WHERE aluno_id=?"
        const [resultado] = await banco.query(sql, [id]);
        return resultado;
    },
    buscarPorMatricula: async (matricula) =>{
        const sql = "SELECT nome FROM alunos WHERE matricula=?"
        const [resultado] = await banco.query(sql, [matricula]);
        return resultado;
    },
    buscarPorTurma: async (turma_id) => {
        const sql = "SELECT * FROM alunos WHERE turma_id = ? ORDER BY nome; "
        const [resultado] = await banco.query(sql, [turma_id]);
        return resultado;
    },
    buscarPorStatus: async (status) => {
        const sql = "SELECT * FROM alunos WHERE status=? ORDER BY nome; "
        const [resultado] = await banco.query(sql, [status]);
        return resultado;
    }
}


module.exports = alunos;