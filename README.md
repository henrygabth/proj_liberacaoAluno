# 🏫 Sistema de Liberação de Alunos

> Projeto desenvolvido no **SENAI** para automatizar e controlar a saída de alunos, integrando a autorização dos responsáveis diretamente com a liberação na portaria — eliminando conferências manuais e aumentando a segurança escolar.

---

## 📋 Sobre o Projeto

Atualmente, o controle de saída de alunos em muitas escolas ainda é feito de forma manual, o que gera brechas de segurança e sobrecarrega os funcionários. Este sistema resolve esse problema ao integrar a autorização dos responsáveis em tempo real com a liberação da portaria.

**Fluxo principal:**
1. O **Responsável** acessa o sistema e envia a autorização de saída
2. A **Secretaria** valida a solicitação
3. A **Portaria** recebe a liberação e registra a saída do aluno
4. O Responsável recebe uma notificação confirmando a saída

---

## 🎯 Atores do Sistema

| Ator | Funções |
|------|---------|
| **Responsável** | Requisitar saída, autorizar saída, visualizar histórico, receber notificações |
| **Secretaria** | Validar saída, gerenciar alunos, gerenciar responsáveis |
| **Portaria** | Registrar entrada/saída, liberar saída do aluno |
| **Aluno** | Passar pela portaria com liberação registrada |

---

## 🛠️ Tecnologias Utilizadas

- **Back-end:** Node.js
- **Template Engine:** EJS
- **Front-end:** HTML5, CSS3, JavaScript
- **Banco de Dados:** MySQL (MySQL Workbench)
- **Outras dependências:** ver `package.json`

---

## 📁 Estrutura do Projeto

```
projeto-liberacao-aluno/
│
├── api/
├── config/
├── controller/
├── middlewares/
├── model/
├── node_modules/
├── public/
│   ├── css/
│   ├── img/
│   ├── js\general/
│   ├── home.html
│   ├── index.html
│   ├── login.html
│   ├── recover_password.html
│   └── register.html
│
├── index.js
├── package-lock.json
└── package.json
```

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [MySQL Workbench](https://www.mysql.com/products/workbench/) (recomendado)

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/projeto-liberacao-aluno.git
cd projeto-liberacao-aluno
```

**2. Instale as dependências**
```bash
npm i
```

**3. Configure o banco de dados**

Abra o MySQL Workbench, crie um banco de dados e execute o arquivo:
```
database/schema.sql
```

**4. Inicie o servidor**
```bash
node index.js
```

**5. Acesse no navegador**
```
http://localhost:3000
```

---

## 🗄️ Banco de Dados

O banco foi modelado e gerenciado com **MySQL Workbench**.

Principais tabelas:

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Responsáveis, secretaria e portaria |
| `alunos` | Cadastro dos alunos |
| `responsaveis` | Vínculo entre aluno e responsável |
| `requisicoes` | Solicitações de saída |
| `historico_saidas` | Registro de todas as saídas |

---

## 📊 Diagrama de Caso de Uso

O sistema contempla os seguintes casos de uso:

- Logar / Cadastrar
- Requisição de saída *(Responsável)*
- Autorizar saída do aluno *(Responsável)* — `«include»` Validar saída
- Visualizar histórico de saída *(Responsável)*
- Receber notificação *(Responsável)* — `«extend»` Autorizar saída
- Validar saída *(Secretaria)*
- Gerenciar alunos / Gerenciar responsáveis *(Secretaria)*
- Registrar saída e entrada *(Portaria)*
- Liberar saída do aluno *(Portaria / Catraca)* — `«include»` Validar saída

---

## 👥 Equipe
Desenvolvido por alunos do **SENAI** — Curso de Desenvolvimento de Sistemas.
E com apoio dos docentes: Douglas de Cassio Quinzani Gaspar e Renato de Mattos Onofre

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais no SENAI.
