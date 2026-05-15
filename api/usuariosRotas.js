const express = require('express');
const rotas = express.Router();

// Importar o controller
const usuariosController = require('../controller/usuariosController');

// Importar o middleware de autenticação
const { auth } = require('../middlewares/authenticar');

// ─── Rotas existentes ─────────────────────────────────────────────────────────
rotas.post('/cadastrar', usuariosController.cadastrar);
rotas.post('/login', usuariosController.login);
rotas.get('/buscarPorNome', usuariosController.buscarPorNome);
rotas.get('/buscarPorId/:id', usuariosController.buscarPorId);

// ─── NOVAS: rotas da conta (protegidas por JWT) ───────────────────────────────
rotas.get('/conta', auth, usuariosController.getConta);         // Carrega os dados
rotas.put('/conta', auth, usuariosController.atualizarConta);   // Salva alterações

module.exports = rotas;