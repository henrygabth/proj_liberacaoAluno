require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS, Imagens) a partir de /public
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
const usuariosRotas = require('./api/usuariosRotas');
const alunosRotas = require('./api/alunosRotas');
const turmasRotas = require('./api/turmasRotas');
const pedidosRotas = require('./api/pedidosRotas');
const pessoasAutorizadasRotas = require('./api/pessoasAutorizadasRotas');

app.use('/api/usuarios', usuariosRotas);
app.use('/api/alunos', alunosRotas);
app.use('/api/turmas', turmasRotas);
app.use('/api/pedidos', pedidosRotas);
app.use('/api/pessoas-autorizadas', pessoasAutorizadasRotas);

// Rota raiz "/" - Abre a home.html no navegador
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORTA || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
