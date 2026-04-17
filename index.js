const express = require('express');
const app = express(); // Vamos usar apenas o 'app'

// Importação de rotas
const rotasAlunos = require('./api/alunosRotas'); // Importado aqui

// Variáveis de ambiente
require('dotenv').config();

// Configurações iniciais
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Configuração de JSON unificada

const porta = Number(process.env.PORTA) || 3000;

// Rotas da aplicação
app.use('/alunos', rotasAlunos); // Rota de alunos adicionada ao app principal

// Rota de erro (deve vir DEPOIS das outras rotas e ANTES do listen)
app.use((req, res) => {
  res.status(404).render('erro404', {
    titulo: 'rota não encontrada', 
    dados: { titulo: 'rota não encontrada' }
  });
});

// Iniciar o servidor único
app.listen(porta, () => {
    console.log('Servidor rodando com sucesso!');
    console.log('Endereco: http://localhost:' + porta);
});
