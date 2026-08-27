// pedidosModel.js
const db = require('../config/banco');
const historico = require('./historicoModel');

// Cadastrar novo pedido (Pai cria -> PENDENTE)
// Também grava o primeiro registro no histórico (status_anterior = null)
async function cadastrar(nome_aluno, turma_id, solicitante_id, hora_prevista_saida, motivo, observacoes) {
    const [result] = await db.query(
        `INSERT INTO pedidos_saida (nome_aluno, turma_id, solicitante_id, hora_prevista_saida, motivo, observacoes, status, data_criacao)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDENTE', NOW())`,
        [nome_aluno, turma_id, solicitante_id, hora_prevista_saida, motivo, observacoes]
    );

    const pedido_id = result.insertId;

    await historico.registrar(pedido_id, solicitante_id, null, 'PENDENTE', 'Solicitação criada pelo responsável');

    return pedido_id;
}

// Atualizar status de um pedido (aprovar / rejeitar / liberar / retorno)
// Também grava, na mesma operação, o registro correspondente no histórico imutável
async function atualizarStatus(pedido_id, statusNovo, usuario_id, observacao = null) {
    // 1. Descobre o status atual, para registrar a transição completa no histórico
    const [pedidoAtual] = await db.query(
        'SELECT status FROM pedidos_saida WHERE pedidos_saida_id = ?',
        [pedido_id]
    );
    if (pedidoAtual.length === 0) {
        return false; // pedido não existe
    }
    const statusAnterior = pedidoAtual[0].status;

    let camposExtras = '';
    // Registra a hora real de saída na portaria
    if (statusNovo === 'EM_SAIDA') {
        camposExtras = ', hora_saida_real = NOW()';
    }
    // Registra a hora real de retorno na portaria
    else if (statusNovo === 'CONCLUIDA') {
        camposExtras = ', hora_retorno_real = NOW()';
    }

    // 2. Atualiza o pedido
    const [result] = await db.query(
        `UPDATE pedidos_saida
         SET status = ?, usuario_id = ?, observacao = ?${camposExtras}, data_atualizacao = NOW()
         WHERE pedidos_saida_id = ?`,
        [statusNovo, usuario_id, observacao, pedido_id]
    );

    if (result.affectedRows === 0) {
        return false;
    }

    // 3. Grava a transição no histórico imutável
    await historico.registrar(pedido_id, usuario_id, statusAnterior, statusNovo, observacao);

    return true;
}

// Base do SELECT usada nas buscas de pedidos, já com os JOINs necessários
const SELECT_BASE = `
    SELECT p.pedidos_saida_id, p.nome_aluno, p.data_criacao, p.hora_prevista_saida,
           p.status, p.motivo, p.observacoes, p.observacao,
           p.hora_saida_real, p.hora_retorno_real,
           t.sala_turma AS turma, t.turno,
           sol.nome AS responsavel,
           usu.nome AS aprovador
    FROM pedidos_saida p
    LEFT JOIN turmas t ON p.turma_id = t.id_turma
    LEFT JOIN usuarios sol ON p.solicitante_id = sol.id_usuario
    LEFT JOIN usuarios usu ON p.usuario_id = usu.id_usuario
`;

// Buscar pedidos por status (Secretaria/Portaria)
async function buscarPorStatus(status) {
    let sql = SELECT_BASE;
    const params = [];

    if (status) {
        sql += ` WHERE p.status = ?`;
        params.push(status);
    }
    sql += ` ORDER BY p.data_criacao ASC`;

    const [rows] = await db.query(sql, params);
    return rows;
}

// Buscar pedidos feitos por um solicitante (Pai/Histórico)
async function buscarPorSolicitante(solicitante_id) {
    const sql = `${SELECT_BASE} WHERE p.solicitante_id = ? ORDER BY p.data_criacao DESC`;
    const [rows] = await db.query(sql, [solicitante_id]);
    return rows;
}

// Buscar o histórico completo (linha do tempo) de um pedido específico
async function buscarHistorico(pedido_id) {
    return historico.listarPorPedido(pedido_id);
}

module.exports = { cadastrar, atualizarStatus, buscarPorStatus, buscarPorSolicitante, buscarHistorico };
