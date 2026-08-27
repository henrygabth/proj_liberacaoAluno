const usuariosModel = require('../model/usuariosModel');
const alunosModel = require('../model/alunosModel');
const responsaveisAlunosModel = require('../model/responsaveisAlunosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { SEGREDO } = require('../middlewares/authenticar');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // usa STARTTLS na porta 587 (mais estável que 465 em algumas redes)
    family: 4,      // força IPv4 - evita ECONNREFUSED em redes com IPv6 mal configurado
    tls: {
        rejectUnauthorized: false // contorna antivírus/proxy que interceptam TLS com certificado próprio
    },
    auth: {
        user: process.env.EMAIL_USER || 'seu.email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
    }
});

// Gera uma senha temporária aleatória e diferente a cada chamada (não é uma senha fixa/padrão)
function gerarSenhaAleatoria() {
    return crypto.randomBytes(6).toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 8);
}

const usuariosController = {
    cadastrar: async (req, res) => {
        try {
            const { nome, cpf, email, telefone, senha, tipo_usuario, status } = req.body;

            if (!nome || !cpf || !email || !telefone || !senha || !tipo_usuario) {
                return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
            }

            const usuarioExistente = await usuariosModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ erro: 'E-mail já cadastrado.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const tipoPadronizado = tipo_usuario.trim().toUpperCase();

            const id = await usuariosModel.cadastrar(
                nome,
                cpf,
                email,
                telefone,
                senhaHash,
                tipoPadronizado,
                status || '1'
            );

            const token = jwt.sign(
                { id_usuario: id, tipo_usuario: tipoPadronizado, nome },
                SEGREDO,
                { expiresIn: '8h' }
            );

            return res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso!',
                token,
                id_usuario: id
            });
        } catch (error) {
            console.error('Erro no cadastro:', error);
            return res.status(500).json({ erro: 'Erro ao cadastrar usuário.', detalhe: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
            }

            let usuario = await usuariosModel.buscarPorEmail(email);
            if (!usuario && usuariosModel.buscarPorNome) {
                usuario = await usuariosModel.buscarPorNome(email);
            }

            if (!usuario) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            let senhaValida = false;
            if (usuario.senha && (usuario.senha.startsWith('$2b$') || usuario.senha.startsWith('$2a$'))) {
                senhaValida = await bcrypt.compare(senha, usuario.senha);
            } else {
                senhaValida = (senha === usuario.senha);
            }

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, tipo_usuario: usuario.tipo_usuario, nome: usuario.nome },
                SEGREDO,
                { expiresIn: '8h' }
            );

            let redirecionarPara = 'home.html';
            const tipo = (usuario.tipo_usuario || '').toUpperCase();

            if (tipo === 'SECRETARIA' || tipo === 'ADMIN') {
                redirecionarPara = 'secretaria.html';
            } else if (tipo === 'PORTARIA' || tipo === 'PORTEIRO') {
                redirecionarPara = 'portaria.html';
            } else if (tipo === 'PAI' || tipo === 'RESPONSAVEL') {
                redirecionarPara = 'home.html';
            }

            return res.json({
                mensagem: 'Login realizado com sucesso!',
                token,
                redirecionarPara,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nome: usuario.nome,
                    tipo_usuario: usuario.tipo_usuario
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ erro: 'Erro interno ao realizar login.', detalhe: error.message });
        }
    },

    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            if (!nome) return res.status(400).json({ erro: 'O parâmetro nome é obrigatório.' });

            const usuario = await usuariosModel.buscarPorNome(nome);
            if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar por nome:', error);
            return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const usuario = await usuariosModel.buscarPorId(req.params.id);
            if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar por ID:', error);
            return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
        }
    },

    getConta: async (req, res) => {
        try {
            const usuario = await usuariosModel.buscarContaPorId(req.usuario.id_usuario);
            if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

            return res.json(usuario);
        } catch (error) {
            console.error('Erro ao carregar conta:', error);
            return res.status(500).json({ erro: 'Erro ao carregar dados da conta.' });
        }
    },

    atualizarConta: async (req, res) => {
        try {
            const { nome, email, telefone, novaSenha } = req.body;
            let novaSenhaHash = null;

            if (novaSenha && novaSenha.trim() !== '') {
                novaSenhaHash = await bcrypt.hash(novaSenha, 10);
            }

            await usuariosModel.atualizarConta(req.usuario.id_usuario, nome, email, telefone, novaSenhaHash);
            return res.json({ mensagem: 'Conta atualizada com sucesso!' });
        } catch (error) {
            console.error('Erro ao atualizar conta:', error);
            return res.status(500).json({ erro: 'Erro ao atualizar conta.' });
        }
    },

    solicitarRecuperacao: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório.' });

            const usuario = await usuariosModel.buscarPorEmail(email);
            if (!usuario) {
                return res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
            }

            const tokenReset = jwt.sign(
                { id_usuario: usuario.id_usuario, email: usuario.email },
                SEGREDO,
                { expiresIn: '15m' }
            );

            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const linkRecuperacao = `${baseUrl}/reset_password.html?token=${tokenReset}`;

            const mailOptions = {
                from: `"Controle de Saídas" <${process.env.EMAIL_USER || 'seu.email@gmail.com'}>`,
                to: usuario.email,
                subject: '🔒 Redefinição de Senha - Controle de Saídas',
                html: `<p>Olá <strong>${usuario.nome}</strong>, para redefinir sua senha acesse o link: <a href="${linkRecuperacao}">${linkRecuperacao}</a></p>`
            };

            await transporter.sendMail(mailOptions);
            return res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
        } catch (error) {
            console.error('Erro ao enviar e-mail de recuperação:', error);
            return res.status(500).json({ erro: 'Erro ao enviar e-mail de recuperação.' });
        }
    },

    redefinirSenha: async (req, res) => {
        try {
            const { token, novaSenha } = req.body;

            if (!token || !novaSenha) {
                return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
            }

            const decoded = jwt.verify(token, SEGREDO);
            const senhaHash = await bcrypt.hash(novaSenha, 10);

            await usuariosModel.atualizarConta(decoded.id_usuario, null, null, null, senhaHash);

            return res.json({ mensagem: 'Senha redefinida com sucesso!' });
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.status(400).json({ erro: 'Link inválido ou expirado.' });
        }
    },

    // SECRETARIA: Cria a conta de um responsável (Pai), gera senha única e vincula ao aluno.
    // Ninguém de fora consegue criar essa conta sozinho — só quem está logado como SECRETARIA/ADMIN.
    criarResponsavel: async (req, res) => {
        try {
            const { nome, cpf, email, telefone, nome_aluno, turma_id, parentesco } = req.body;

            if (!nome || !cpf || !email || !telefone || !nome_aluno) {
                return res.status(400).json({ erro: 'Preencha nome, cpf, e-mail, telefone e nome do aluno.' });
            }

            const existente = await usuariosModel.buscarPorEmail(email);
            if (existente) {
                return res.status(400).json({ erro: 'Já existe uma conta cadastrada com este e-mail.' });
            }

            // 1. Gera uma senha temporária única para esta conta
            const senhaTemporaria = gerarSenhaAleatoria();
            const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

            // 2. Cria a conta do responsável (tipo PAI)
            const usuario_id = await usuariosModel.cadastrar(
                nome, cpf, email, telefone, senhaHash, 'PAI', '1'
            );

            // 3. Localiza o aluno (ou cria, se ainda não existir cadastrado) e vincula
            const aluno_id = await alunosModel.buscarOuCriar(nome_aluno, turma_id || null);
            await responsaveisAlunosModel.vincular(usuario_id, aluno_id, parentesco || 'Responsável');

            // 4. Envia a senha temporária por e-mail
            let emailEnviado = true;
            try {
                await transporter.sendMail({
                    from: `"Controle de Saídas" <${process.env.EMAIL_USER || 'seu.email@gmail.com'}>`,
                    to: email,
                    subject: '🏫 Sua conta de acesso foi criada',
                    html: `
                        <p>Olá <strong>${nome}</strong>,</p>
                        <p>Uma conta foi criada para você no sistema de controle de saídas, vinculada ao aluno <strong>${nome_aluno}</strong>.</p>
                        <p><strong>E-mail de acesso:</strong> ${email}<br>
                           <strong>Senha temporária:</strong> ${senhaTemporaria}</p>
                        <p>Recomendamos trocar essa senha assim que possível em "Minha Conta" após o primeiro acesso,
                           ou pela opção "Esqueci minha senha" na tela de login.</p>
                    `
                });
            } catch (erroEmail) {
                console.error('Erro ao enviar e-mail de boas-vindas:', erroEmail.message);
                emailEnviado = false;
            }

            const resposta = {
                mensagem: emailEnviado
                    ? `Conta criada e senha enviada por e-mail para ${email}.`
                    : `Conta criada, mas não foi possível enviar o e-mail. Informe a senha manualmente.`
            };

            // Se o e-mail falhou (ex: credenciais de e-mail não configuradas no .env),
            // devolve a senha na resposta para a secretaria não ficar sem saída.
            if (!emailEnviado) {
                resposta.senha_temporaria = senhaTemporaria;
            }

            return res.status(201).json(resposta);
        } catch (error) {
            console.error('Erro ao criar conta do responsável:', error);
            return res.status(500).json({ erro: 'Erro ao criar conta do responsável.', detalhe: error.message });
        }
    }
};

module.exports = usuariosController;