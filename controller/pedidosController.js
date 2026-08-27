// Pedidos controller
const pedidos = require('../model/pedidosModel');

const pedidosController = {
    // 1. PAI: Criar solicitação
    cadastrar: async (req, res) => {
        try {
            const { nome_aluno, id_turma, hora_prevista_saida, motivo, observacoes } = req.body;
            const solicitante_id = req.body.solicitante_id || req.usuario.id_usuario;

            if (!nome_aluno || !id_turma || !hora_prevista_saida) {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos" });
            }
            const pedido_id = await pedidos.cadastrar(
                nome_aluno, id_turma, solicitante_id, hora_prevista_saida, motivo || null, observacoes || null
            );
            res.status(201).json({ mensagem: `Pedido ${pedido_id} criado com sucesso e enviado à secretaria`, id_pedido: pedido_id });
        } catch (error) {
            console.error('Erro ao cadastrar pedido:', error);
            res.status(500).json({ erro: "Erro ao cadastrar pedido", detalhe: error.message });
        }
    },

    // 2. SECRETARIA: Aprovar solicitação -> envia para a portaria
    aprovar: async (req, res) => {
        try {
            const pedido_id = req.params.id;
            const usuario_id = req.usuario.id_usuario;
            const ok = await pedidos.atualizarStatus(pedido_id, 'APROVADA', usuario_id);
            if (!ok) return res.status(404).json({ erro: "Pedido não encontrado" });
            res.json({ mensagem: "Pedido aprovado com sucesso e enviado para a portaria" });
        } catch (error) {
            console.error('Erro ao aprovar pedido:', error);
            res.status(500).json({ erro: "Erro ao aprovar pedido" });
        }
    },

    // 3. SECRETARIA: Rejeitar solicitação
    rejeitar: async (req, res) => {
        try {
            const pedido_id = req.params.id;
            const usuario_id = req.usuario.id_usuario;
            const { observacao } = req.body;
            const ok = await pedidos.atualizarStatus(pedido_id, 'RECUSADA', usuario_id, observacao || null);
            if (!ok) return res.status(404).json({ erro: "Pedido não encontrado" });
            res.json({ mensagem: "Pedido rejeitado" });
        } catch (error) {
            console.error('Erro ao rejeitar pedido:', error);
            res.status(500).json({ erro: "Erro ao rejeitar pedido" });
        }
    },

    // 4. PORTARIA: Liberar aluno (registra horário de saída)
    liberar: async (req, res) => {
        try {
            const pedido_id = req.params.id;
            const usuario_id = req.usuario.id_usuario;
            const ok = await pedidos.atualizarStatus(pedido_id, 'EM_SAIDA', usuario_id);
            if (!ok) return res.status(404).json({ erro: "Pedido não encontrado" });
            res.json({ mensagem: "Aluno liberado na portaria com horário registrado" });
        } catch (error) {
            console.error('Erro ao liberar pedido:', error);
            res.status(500).json({ erro: "Erro ao liberar pedido" });
        }
    },

    // 5. PORTARIA: Registrar retorno do aluno (registra horário de volta)
    retorno: async (req, res) => {
        try {
            const pedido_id = req.params.id;
            const usuario_id = req.usuario.id_usuario;
            const ok = await pedidos.atualizarStatus(pedido_id, 'CONCLUIDA', usuario_id);
            if (!ok) return res.status(404).json({ erro: "Pedido não encontrado" });
            res.json({ mensagem: "Retorno do aluno registrado com sucesso! Processo concluído." });
        } catch (error) {
            console.error('Erro ao registrar retorno do aluno:', error);
            res.status(500).json({ erro: "Erro ao registrar retorno do aluno" });
        }
    },

    // 6. LISTAR: Por status (ex: ?status=PENDENTE, ?status=APROVADA, ?status=EM_SAIDA, ?status=CONCLUIDA)
    listarPorStatus: async (req, res) => {
        try {
            const { status } = req.query;
            const resultado = await pedidos.buscarPorStatus(status);
            res.json(resultado);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            res.status(500).json({ erro: "Erro ao buscar pedidos" });
        }
    },

    // 7. HISTÓRICO: Buscar pedidos feitos por um solicitante (Pai)
    buscarPorSolicitante: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ erro: "Solicitante não informado" });
            }
            const resultado = await pedidos.buscarPorSolicitante(id);
            res.json(resultado);
        } catch (error) {
            console.error('Erro ao buscar pedidos por solicitante:', error);
            res.status(500).json({ erro: "Erro ao buscar pedidos por solicitante" });
        }
    },

    // 8. AUDITORIA: Linha do tempo completa de um pedido (histórico imutável)
    buscarHistorico: async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await pedidos.buscarHistorico(id);
            res.json(resultado);
        } catch (error) {
            console.error('Erro ao buscar histórico do pedido:', error);
            res.status(500).json({ erro: "Erro ao buscar histórico do pedido" });
        }
    }
};

module.exports = pedidosController;
