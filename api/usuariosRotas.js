const express = require('express');
const rotas = express.Router();
const usuariosController = require('../controller/usuariosController');
const { auth, exigirPapel } = require('../middlewares/authenticar');

// Rotas públicas (não exigem token de autenticação)
rotas.post('/login', usuariosController.login);
rotas.post('/login-google', usuariosController.loginGoogle);
rotas.post('/recuperar-senha', usuariosController.solicitarRecuperacao);
rotas.post('/redefinir-senha', usuariosController.redefinirSenha);

// Rotas protegidas (exigem estar logado)
rotas.post('/cadastrar', auth, exigirPapel('SECRETARIA', 'ADMIN'), usuariosController.cadastrar);
rotas.post('/vincular-responsavel', auth, exigirPapel('SECRETARIA', 'ADMIN'), usuariosController.criarResponsavel);

rotas.get('/buscarPorNome', auth, usuariosController.buscarPorNome);
rotas.get('/buscarPorId/:id', auth, usuariosController.buscarPorId);

rotas.get('/conta', auth, usuariosController.getConta);
rotas.put('/conta', auth, usuariosController.atualizarConta);
rotas.put('/:id', auth, usuariosController.atualizarConta);

module.exports = rotas;