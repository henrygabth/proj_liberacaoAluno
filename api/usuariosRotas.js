const express = require('express');
const rotas = express.Router();

// Importar o controller
const usuariosController = require('../controller/usuariosController');

// Definição das rotas
rotas.post('/cadastrar', usuariosController.cadastrar);
rotas.post('/login', usuariosController.login);
rotas.get('/buscarPorNome', usuariosController.buscarPorNome);
rotas.get('/buscarPorId/:id',usuariosController.buscarPorId);

module.exports = rotas;
