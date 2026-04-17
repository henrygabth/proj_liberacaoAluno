const express = require('express')
//Chamar o Controller do Cliente
const alunos = require('../controllers/alunosController')
const alunosController = require('../controllers/alunosController')

//Configurar o gerenciador de Rotas com o Router do Express
const rotas = express.Router()

//Bloquear a rota de "cadastrar" para ser usada só se tiver o Token
rotas.post('/cadastrar', alunosController.cadastrar)
rotas.get('/buscarTodos', alunos.listarTodos);
//O atualizar tem o parâmetro "id" na URL
rotas.put('/atualizar/:id', alunos.atualizar);
rotas.delete('/apagar/:id', alunos.apagar);
rotas.get('/buscarPorNome', alunos.buscarPorNome);
rotas.get('/buscarPorId', alunos.buscarPorId);
rotas.get('/buscarPorMatricula', alunos.buscarPorMatricula);
rotas.get('/buscarPorTurma', alunos.buscarPorTurma);
rotas.get('/buscarPorStatus', alunos.buscarPorStatus);

module.exports = rotas