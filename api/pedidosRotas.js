const express = require('express');
const rotas = express.Router();
const pedidosController = require('../controller/pedidosController');
const { auth } = require('../middlewares/authenticar');

// Rotas do fluxo de saída de alunos
rotas.post('/cadastrar', auth, pedidosController.cadastrar);
rotas.put('/aprovar/:id', auth, pedidosController.aprovar);
rotas.put('/rejeitar/:id', auth, pedidosController.rejeitar);
rotas.put('/liberar/:id', auth, pedidosController.liberar);
rotas.put('/retorno/:id', auth, pedidosController.retorno);
rotas.get('/listarPorStatus', auth, pedidosController.listarPorStatus);

// Histórico do responsável (Pai)
rotas.get('/solicitante/:id', auth, pedidosController.buscarPorSolicitante);

// Auditoria: linha do tempo completa de um pedido específico
rotas.get('/historico/:id', auth, pedidosController.buscarHistorico);

module.exports = rotas;
