<<<<<<< HEAD
#  Projeto Liberação Aluno
> **Escola SENAI “Prof. Dr. Euryclides de Jesus Zerbini”**
> Integração digital entre Responsáveis, Secretaria e Portaria para automação de saída escolar.

---

##  Sobre o Projeto
Este sistema visa automatizar a saída escolar, permitindo que os pais autorizem a liberação de seus filhos remotamente. O objetivo é integrar a portaria e a gestão em tempo real, eliminando processos manuais, reduzindo filas e reforçando a segurança para evitar saídas não autorizadas.

---

##  Tecnologias Utilizadas

| Tecnologia | Logo |
| :--- | :---: |
| **Node.js** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="30"> |
| **JavaScript** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="30"> |
| **MySQL** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" width="30"> |
| **Express** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="30" style="background-color: white;"> |
| **HTML5** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" width="30"> |
| **CSS3** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" width="30"> |

---

##  Pré-requisitos

1. **Node.js:** O ambiente deve estar instalado. [Baixe aqui](https://nodejs.org/pt).
2. **MySQL:** É necessário acesso a um SGBD MySQL instalado localmente.

---

##  Instalação e Configuração

### 1. Clonar o Projeto
Utilize o `degit` para baixar o repositório na pasta desejada:
```bash
npx degit henrygabth/Projeto_LiberacaoAluno <nome-da-pasta>
```

---

### 2. Instalar Dependências
```bash
npm i
```
---

### 3. Variáveis de Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto. Configure suas credenciais conforme a tabela:

| Variável | Descrição |
| :--- | :---: |
| **PORTA** | Porta de execução |
| **DBHOST** | Local do banco |
| **DBUSER** | Usuário do MySQL |
| **DBNAME** | Nome do Banco de dados |
| **DBPASS** | Senha do Banco de dados |

obs: O `.env` não é enviado ao GitHub. Você deve recriá-lo sempre que clonar o projeto.

---

### 4. Como rodar
Para inicializar o servidor, rode o seguinte comando em seu cmd

```bash
node index.js
```
---

 Documentação (`/Docs`)

Diagrama de Classe e Modelo Conceitual.

Dicionário de Dados.

Scripts SQL de criação do banco.

Trabalho de Conclusão de Curso completo

---

### Equipe e Orientação
**Desenvolvedores:**
Gabriel da Rocha Silva, Gabriel Henrique Furiati, Henry Gabriel Sorocaba Modesto e Vinicius da Silva Braz

**Orientadores:**
Douglas de Cassio Quinzani Gaspar e Renato de Mattos Onofre

---

"A verdadeira dificuldade não está em aceitar ideias novas, mas escapar das antigas."
**-John Maynard Keynes**

---

**Campinas,SP - 2026**
=======
# Projeto Base com MariaDB

Este projeto deve ser usado como ponto de partida para criar o projeto que você vai entregar para o professor. 

# Pré-requisitos

1. O ambiente node deve estar instalado. Se ainda não está instalado baixe o ambiente e instale em https://nodejs.org/pt

2. MariaDB: Para este projeto é necessário acesso a um SGBD MariaDB instalado localmente ou configurado na nuvem. Configure o acesso no arquivo .env

# Instalação do projeto


1. Baixe este projeto usando degit

`npx degit henrygabth/Projeto_LiberacaoAluno <pasta>`


| TROQUE | POR |
|----------|----------|
| `<repositorio>` | nome do repositorio que sera usado como base (este por exemplo)|
| `<pasta>` | Nome da pasta do seu projeto que será criada automaticamente |

2. Instale todas as dependencias

```
npm i
```

3. Faça uma copia do arquivo .env.example e renomeie para .env

obs: Guarde o arquivo .env em local seguro. Este arquivo não será enviado ao github e precisa ser recriado todas as vezes em que o projeto for baixado do gihub

4. Altere as configurações do arquivo .env

| VARIAVEL | DESCRIÇÃO |
|----------|----------|
|PORTA |Porta em que a aplicação vai rodar|
|DBHOST | Local onde seu banco está roando. defina como localhost quando estiver rodando local |
|DBUSER | Usuário do Banco |
|DBNAME | nome do banco |
|DBPASS | Senha para acesso ao banco |


5. Rode o projeto

```
npm run dev
```

6. Configure o Git/Github

O projeto é baixado sem a configuração do git ou github portanto será necessário criar o repositório local(git) e remoto(github) além de subir as atualizações.

## Algumas informações para uso do projeto

Use a pasta docs para colocar todos os documentos relativos ao seu projeto tais como :
- Diagrama de classe
- Dicionario de dados
- Modelo conceitual
- Scripts de criação do banco
- Trabalho de conclusão de curso

## Tecnologias utilizadas/configuradas neste projeto

* node
* Javascript
* HTML/CSS
* Express
* MariaDB
* ejs
>>>>>>> 6a4523b (v1.4 - adicionando funções)
