const express = require('express');
const app = express();


// Configurações iniciais
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importação de rotas
const rotasAlunos = require('./api/alunosRotas');

// Porta configurada no .env ou padrão 3000
const porta = Number(process.env.PORTA) || 3000;

// Rotas da aplicação
app.use('/alunos', rotasAlunos);

// Rota de erro 404
app.use((req, res) => {
  res.status(404).render('erro404', {
    titulo: 'rota não encontrada',
    dados: { titulo: 'rota não encontrada' }
  });
});

// Iniciar servidor
app.listen(porta, () => {
  console.log('Servidor rodando com sucesso!');
  console.log('Endereco: http://localhost:' + porta);
});
