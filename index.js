const express = require('express');
const path = require('path');
const app = express();

// Configurações iniciais
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importação de rotas
const rotasAlunos = require('./api/alunosRotas');
const rotasUsuarios = require('./api/usuariosRotas');
const rotasTurmas = require('./api/turmasRotas')

// Porta configurada no .env ou padrão 3000
const porta = Number(process.env.PORTA) || 3000;

// Rotas da aplicação
app.use('/alunos', rotasAlunos);
app.use('/usuarios', rotasUsuarios);
app.use('/turmas', rotasTurmas)



// Iniciar servidor
app.listen(porta, () => {
  console.log('Servidor rodando com sucesso!');
  console.log('Endereco: http://localhost:' + porta);
});
