//Chamar o Model do Cliente
const alunos = require('../model/alunosModel')

const alunosController = {
    cadastrar: async (req, res) => {
        try {
            const { nome, matricula, turma_id, data_nascimento, status, data_criacao } = req.body;
            if (!nome || !matricula || !turma_id || !data_nascimento || !status || !data_criacao) {
                return res.status(400).json({ "erro": "Todos os campos são obrigatórios" })
            }
            const aluno_id = await alunos.cadastrar(
                nome, matricula, turma_id, data_nascimento, status, data_criacao
            );
            return res.status(200).json({
                "mensagem": `Aluno ${aluno_id} cadastrado com sucesso` })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ "erro": "Erro ao cadastrar cliente" })
        }
    },

    listarTodos: async (req, res) => {
        try {
            const resultado = await alunos.buscarTodos();
            return res.status(200).json(resultado);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ "erro": "Erro ao buscar os alunos" })
        }
    },

    atualizar: async (req, res) => {
        try {
            const { nome, matricula, turma_id, data_nascimento, status, data_criacao } = req.body;
            const aluno_id = req.params.id;

            const resultado = await alunos.atualizar(
                nome, matricula, turma_id, data_nascimento, status, data_criacao, aluno_id
            );

            if (resultado > 0) {
                return res.status(200).json({ "mensagem": `Aluno ${aluno_id} atualizado com sucesso` });
            } else {
                return res.status(404).json({ "erro": "Aluno não encontrado" });
            }
        } catch (error) {
            return res.status(500).json({ "erro": "Erro ao atualizar aluno" })
        }
    },
    apagar: async (req, res) => {
        try {
            const id = req.params.id;
            const resultado = await alunos.apagar(id);
            if (resultado) {
                res.status(200).json({ "resultado": "Removido" });
            } else {
                res.status(204).send();
            }
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao apagar." })
        }
    },
    buscarPorNome: async (req, res) => {
        try {
            const { nome } = req.body;
            const resultado = await alunos.buscarPorNome(nome);
            if (!resultado) { //Se passar um nome que não existe
                res.status(404).json({
                    "resultado": "Aluno não encontrado"
                })
            }
            //Se encontrar o nome do Gênero...
            res.status(200).json(resultado); //Envia o resultado
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao buscar" })
        }
    },
    buscarPorId: async (req, res) => {
        try {
            const { id } = req.body;
            const resultado = await alunos.buscarPorId(id);
            if (!resultado) {
                res.status(404).json({ "resultado": "Aluno não encontrado" })
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao buscar" })
        }
    },
    buscarPorMatricula: async (req, res) => {
        try {
            const { matricula } = req.body;
            const resultado = await alunos.buscarPorMatricula(matricula);
            if (!resultado) {
                res.status(404).json({ "resultado": "Aluno não encontrado" })
            }
            res.status(200).json({ resultado })
        } catch (error) {
            res.status(500).json({ "erro": "Erro ao buscar" })
        }
    },
    buscarPorTurma: async (req, res) => {
        try {
            const { turma_id } = req.body;
            const resultado = await alunos.buscarPorTurma(turma_id);
            if(!resultado){
                res.status(404).json({"resultado": "Turma não encontrada"})
            }
            res.status(200).json({resultado})
        }catch(error){
            res.status(500).json({"erro": "Erro ao buscar"})
        }
    },
    buscarPorStatus: async (req, res) => {
        try{
            const {status} = req.body;
            const resultado = await alunos.buscarPorStatus(status);
            if(!resultado){
                res.status(404).json({"erro": "Status inválido"})
            }
            res.status(200).json({resultado})
        }catch(error){
            res.status(500).json({"erro": "Erro ao buscar"})
        }
    }
}

module.exports = alunosController;
