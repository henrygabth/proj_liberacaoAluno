const express = require('express');
const rotas = express.Router();
const pessoasController = require('../controller/pessoasAutorizadasController');
const { auth } = require('../middlewares/authenticar');

rotas.post('/cadastrar', auth, pessoasController.cadastrar);
rotas.get('/listar/:usuario_id', auth, pessoasController.listarPorUsuario);

module.exports = rotas;
