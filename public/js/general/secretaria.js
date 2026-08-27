// Ajustado para incluir o prefixo /api que está definido no index.js
const API_URL = 'http://localhost:3000/api';
let pedidoSelecionado = null;

// ==========================================
// 1. GERENCIAMENTO DE TELAS E FORMULÁRIOS
// ==========================================
function mostrarTela(idTela) {
    const telas = ['tela-inicio', 'tela-solicitacoes', 'tela-vincular', 'tela-historico'];
    telas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) telaAtiva.style.display = 'block';

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('active');
    }

    if (idTela === 'tela-solicitacoes') {
        carregarPendentes();
    } else if (idTela === 'tela-vincular') {
        carregarTurmasVinculo();
    } else if (idTela === 'tela-historico') {
        carregarHistoricoSecretaria();
    }
}

async function salvarVinculo(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const corpo = {
        nome: document.getElementById('nomeResponsavelVinculo').value.trim(),
        cpf: document.getElementById('cpfResponsavelVinculo').value.trim(),
        telefone: document.getElementById('telefoneResponsavelVinculo').value.trim(),
        email: document.getElementById('emailNovoResponsavel').value.trim(),
        nome_aluno: document.getElementById('nomeAlunoVinculo').value.trim(),
        turma_id: document.getElementById('turmaVinculo').value,
        parentesco: document.getElementById('parentescoVinculo').value
    };

    try {
        const resp = await fetch(`${API_URL}/usuarios/vincular-responsavel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(corpo)
        });

        const data = await resp.json();

        if (resp.ok) {
            let msg = data.mensagem;
            if (data.senha_temporaria) {
                msg += `\n\nSenha temporária (o e-mail não pôde ser enviado): ${data.senha_temporaria}`;
            }
            alert(msg);
            document.getElementById('formVincular').reset();
        } else {
            alert('Erro: ' + (data.erro || 'Falha ao criar a conta do responsável'));
        }
    } catch (err) {
        alert('Erro de conexão com o servidor');
    }
}

async function carregarTurmasVinculo() {
    const token = localStorage.getItem('token');
    const select = document.getElementById('turmaVinculo');
    if (!select) return;

    try {
        const resp = await fetch(`${API_URL}/turmas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Falha ao buscar turmas');

        const turmas = await resp.json();
        select.innerHTML = '<option value="" disabled selected>Selecione a turma</option>';
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id_turma;
            option.textContent = `${turma.sala_turma} (${turma.turno})`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Erro ao carregar turmas:', err);
        select.innerHTML = '<option value="" disabled selected>Erro ao carregar turmas</option>';
    }
}

// ==========================================
// 2. CONFIGURAÇÃO DE TEMA E PARTÍCULAS
// ==========================================
function iniciarParticulas(theme) {
    if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach(dom => dom.pJS.fn.vendors.destroypJS());
        window.pJSDom = [];
    }

    const corLinha = theme === 'dark' ? '#FFFFFF' : '#0A192F';

    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 150, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#E52207" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5 },
                "size": { "value": 3, "random": true },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": corLinha,
                    "opacity": 0.2,
                    "width": 1
                },
                "move": { "enable": true, "speed": 2 }
            },
            "retina_detect": true
        });
    }
}

function aplicarTema(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
    iniciarParticulas(theme);
}

// ==========================================
// 3. REQUISIÇÕES DA SECRETARIA (API)
// ==========================================

// Carregar solicitações pendentes
async function carregarPendentes() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('lista-pendentes');
    if (!tbody) return;

    try {
        const resp = await fetch(`${API_URL}/pedidos/listarPorStatus?status=PENDENTE`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resp.ok) throw new Error('Falha ao buscar solicitações');

        const dados = await resp.json();
        tbody.innerHTML = '';

        if (dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente.</td></tr>';
        } else {
            dados.forEach(pedido => {
                const tr = document.createElement('tr');
                const dataHora = pedido.data_criacao 
                    ? new Date(pedido.data_criacao).toLocaleString('pt-BR') 
                    : '-';

                tr.innerHTML = `
                    <td>${dataHora}</td>
                    <td>${pedido.nome_aluno || 'Aluno'}</td>
                    <td>${pedido.turma || '-'}</td>
                    <td>${pedido.motivo || '-'}</td>
                    <td>${pedido.observacoes || '-'}</td>
                    <td>
                        <button class="btn-action btn-accept" onclick="decidir(${pedido.pedidos_saida_id}, 'aceitar')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action btn-deny" onclick="abrirModalNegar(${pedido.pedidos_saida_id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        const elemCount = document.getElementById('count-pendentes');
        if (elemCount) elemCount.textContent = dados.length;
    } catch (err) {
        console.error('Erro ao carregar pendentes:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="color:red;">Erro ao carregar pendentes.</td></tr>';
    }
}

// Aprovar ou rejeitar pedido
async function decidir(id, acao, observacao = null) {
    if (acao === 'aceitar' && !confirm("Deseja realmente APROVAR esta saída?")) return;

    const token = localStorage.getItem('token');
    let url = '';
    if (acao === 'aceitar') url = `${API_URL}/pedidos/aprovar/${id}`;
    if (acao === 'negar') url = `${API_URL}/pedidos/rejeitar/${id}`;

    try {
        const resp = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: observacao ? JSON.stringify({ observacao }) : null
        });

        if (resp.ok) {
            alert(`Pedido ${acao === 'aceitar' ? 'aprovado' : 'negado'} com sucesso!`);
            carregarPendentes();
            carregarHistoricoSecretaria();
        } else {
            const erro = await resp.json();
            alert('Erro: ' + (erro.erro || 'Falha na operação'));
        }
    } catch (err) {
        alert('Erro de conexão com o servidor');
    }
}

// Controles do Modal de Recusa
function abrirModalNegar(id) {
    pedidoSelecionado = id;
    const modal = document.getElementById('modalNegar');
    if (modal) modal.style.display = 'flex';
}

function fecharModal() {
    const modal = document.getElementById('modalNegar');
    if (modal) modal.style.display = 'none';
    const campoMotivo = document.getElementById('motivoNegativa');
    if (campoMotivo) campoMotivo.value = '';
}

function confirmarNegativa() {
    const campoMotivo = document.getElementById('motivoNegativa');
    const motivo = campoMotivo ? campoMotivo.value.trim() : '';
    if (!motivo) {
        alert('Informe o motivo da negativa.');
        return;
    }
    decidir(pedidoSelecionado, 'negar', motivo);
    fecharModal();
}

// Carregar histórico de aprovações da secretaria
async function carregarHistoricoSecretaria() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('tabelaHistoricoSecretariaBody');
    if (!tbody) return;

    try {
        const resp = await fetch(`${API_URL}/pedidos/listarPorStatus?status=APROVADA`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resp.ok) throw new Error('Falha ao carregar histórico');

        const dados = await resp.json();
        tbody.innerHTML = '';

        if (dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum registro encontrado.</td></tr>';
            return;
        }

        dados.forEach(pedido => {
            const tr = document.createElement('tr');
            const dataHora = pedido.data_criacao 
                ? new Date(pedido.data_criacao).toLocaleString('pt-BR') 
                : '-';

            tr.innerHTML = `
                <td>${dataHora}</td>
                <td>${pedido.nome_aluno || 'Aluno'}</td>
                <td>${pedido.turma || '-'}</td>
                <td><span class="status status-aprovado">Aprovado</span></td>
                <td>${pedido.aprovador || '-'}</td>
            `;
            tbody.appendChild(tr);
        });

        const elemCountHoje = document.getElementById('count-hoje');
        if (elemCountHoje) elemCountHoje.textContent = dados.length;
    } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;">Erro ao carregar histórico.</td></tr>';
    }
}

// ==========================================
// 4. AUTENTICAÇÃO E INICIALIZAÇÃO
// ==========================================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            sidebar.classList.toggle('open');
            mainContent.classList.toggle('shifted');
        });
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            aplicarTema(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    aplicarTema(savedTheme);

    carregarPendentes();
    carregarHistoricoSecretaria();
});