const express = require('express');
const rotas = express.Router();

// Importar o controller
const turmasController = require('../controller/turmasController');

// Definição das rotas
rotas.post('/cadastrar', turmasController.cadastrar);
rotas.get('/buscarPorTurma', turmasController.buscarPorTurma);
rotas.get('/buscarPorTurno', turmasController.buscarPorTurno);

module.exports = rotas;
