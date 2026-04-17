const jwt = require('jsonwebtoken');
const SEGREDO = 'chave_secreta_escola'; 

const auth = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const token = tokenHeader.startsWith('Bearer ') 
        ? tokenHeader.split(' ')[1] 
        : tokenHeader;

    try {
        const decoded = jwt.verify(token, SEGREDO);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = { auth, SEGREDO };