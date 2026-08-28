const mysql = require('mysql2/promise');

const conexaoBanco = mysql.createPool({
    host: process.env.DB_HOST || '10.87.100.6',
    user: process.env.DB_USER || 'aluno',
    password: process.env.DB_PASSWORD || 'Senai1234',  
    database: process.env.DB_NAME || 'projetocodemasters_novo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conexaoBanco;