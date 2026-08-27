const express = require('express');
const rotas = express.Router();

// Importar o controller
const alunosController = require('../controller/alunosController');

// Definição das rotas
rotas.post('/cadastrar', alunosController.cadastrar);
rotas.get('/buscarTodos', alunosController.listarTodos);
rotas.put('/atualizar/:id', alunosController.atualizar);
rotas.delete('/apagar/:id', alunosController.apagar);
rotas.get('/buscarPorNome', alunosController.buscarPorNome);
rotas.get('/buscarPorId', alunosController.buscarPorId);
rotas.get('/buscarPorMatricula', alunosController.buscarPorMatricula);
rotas.get('/buscarPorTurma', alunosController.buscarPorTurma);
rotas.get('/buscarPorStatus', alunosController.buscarPorStatus);

module.exports = rotas;
