const usuariosModel = require('../model/usuariosModel');
const alunosModel = require('../model/alunosModel');
const responsaveisAlunosModel = require('../model/responsaveisAlunosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { SEGREDO } = require('../middlewares/authenticar');
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "725327633780-mt7ue9m9s39dgcq4n80487s82aheh9aq.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Função para obter o transporter dinamicamente (garante leitura correta do process.env)
function getTransporter() {
    const emailUser = process.env.EMAIL_USER || "portariainteligente950@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
        console.error("ALERTA: process.env.EMAIL_PASS nao esta definido no .env!");
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // TLS/SSL direto na porta 465
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
}

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

    loginGoogle: async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) return res.status(400).json({ erro: 'Token do Google não fornecido.' });

            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const email = payload.email;

            let usuario = await usuariosModel.buscarPorEmail(email);

            if (!usuario) {
                return res.status(404).json({ erro: 'Nenhuma conta cadastrada encontrada para este e-mail do Google.' });
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
            }

            return res.json({
                mensagem: 'Autenticação via Google realizada com sucesso!',
                token,
                redirecionarPara,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nome: usuario.nome,
                    tipo_usuario: usuario.tipo_usuario
                }
            });
        } catch (error) {
            console.error('Erro na autenticação do Google:', error);
            return res.status(401).json({ erro: 'Token do Google inválido ou expirado.' });
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
            const emailSistema = process.env.EMAIL_USER || "portariainteligente950@gmail.com";

            const mailOptions = {
                from: `"Controle de Saidas" <${emailSistema}>`,
                to: usuario.email,
                subject: 'Redefinicao de Senha - Controle de Saidas',
                text: `Olá ${usuario.nome}, acesse o link para redefinir sua senha: ${linkRecuperacao}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f6f8;">
                        <div style="background-color: #ffffff; border-radius: 6px; padding: 25px; border: 1px solid #e0e0e0;">
                            <h2 style="color: #1a202c; font-size: 18px; margin-top: 0; border-bottom: 2px solid #3182ce; padding-bottom: 8px;">
                                Redefinição de Senha
                            </h2>
                            <p style="color: #4a5568; font-size: 14px;">Olá, <strong>${usuario.nome}</strong>.</p>
                            <p style="color: #4a5568; font-size: 14px;">Você solicitou a redefinição de senha para a sua conta no Controle de Saídas. Clique no botão abaixo para criar uma nova senha:</p>
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${linkRecuperacao}" style="background-color: #3182ce; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; display: inline-block;">
                                    Redefinir Senha
                                </a>
                            </div>
                            <p style="color: #718096; font-size: 12px; margin-bottom: 0;">Este link expira em 15 minutos. Se você não fez essa solicitação, pode ignorar este e-mail.</p>
                        </div>
                    </div>
                `
            };

            const transporter = getTransporter();
            await transporter.sendMail(mailOptions);

            return res.json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' });
        } catch (error) {
            console.error('ERRO DETALHADO NO SMTP/NODEMAILER:', error);
            return res.status(500).json({ 
                erro: 'Erro ao enviar e-mail de recuperação.', 
                detalhe: error.message 
            });
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

            const senhaTemporaria = gerarSenhaAleatoria();
            const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

            const usuario_id = await usuariosModel.cadastrar(
                nome, cpf, email, telefone, senhaHash, 'PAI', '1'
            );

            const aluno_id = await alunosModel.buscarOuCriar(nome_aluno, turma_id || null);
            await responsaveisAlunosModel.vincular(usuario_id, aluno_id, parentesco || 'Responsável');

            let emailEnviado = true;
            try {
                const emailSistema = process.env.EMAIL_USER || "portariainteligente950@gmail.com";
                const transporter = getTransporter();

                await transporter.sendMail({
                    from: `"Controle de Saidas" <${emailSistema}>`,
                    to: email,
                    subject: 'Sua conta de acesso foi criada - Controle de Saidas',
                    text: `Olá ${nome}, sua conta foi criada. E-mail: ${email} | Senha temporária: ${senhaTemporaria}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f6f8;">
                            <div style="background-color: #ffffff; border-radius: 6px; padding: 25px; border: 1px solid #e0e0e0;">
                                <h2 style="color: #1a202c; font-size: 18px; margin-top: 0; border-bottom: 2px solid #2b6cb0; padding-bottom: 8px;">
                                    Bem-vindo ao Controle de Saídas
                                </h2>
                                <p style="color: #4a5568; font-size: 14px;">Olá, <strong>${nome}</strong>.</p>
                                <p style="color: #4a5568; font-size: 14px;">Sua conta de responsável vinculada ao aluno <strong>${nome_aluno}</strong> foi cadastrada com sucesso.</p>
                                <div style="background-color: #edf2f7; border-left: 4px solid #2b6cb0; padding: 12px 15px; margin: 20px 0;">
                                    <p style="margin: 0 0 6px 0; color: #2d3748; font-size: 13px;"><strong>E-mail de acesso:</strong> ${email}</p>
                                    <p style="margin: 0; color: #2d3748; font-size: 13px;"><strong>Senha temporária:</strong> <span style="font-family: monospace; font-weight: bold; background-color: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${senhaTemporaria}</span></p>
                                </div>
                                <p style="color: #718096; font-size: 12px; margin-bottom: 0;">Recomendamos alterar sua senha após o primeiro acesso.</p>
                            </div>
                        </div>
                    `
                });
            } catch (erroEmail) {
                console.error('Erro ao enviar e-mail de boas-vindas:', erroEmail);
                emailEnviado = false;
            }

            const resposta = {
                mensagem: emailEnviado
                    ? `Conta criada e senha enviada por e-mail para ${email}.`
                    : `Conta criada, mas não foi possível enviar o e-mail. Informe a senha manualmente.`
            };

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