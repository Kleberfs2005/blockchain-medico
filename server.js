//Usado para teste de conexão com o MongoDB Atlas
require('dotenv').config()
process.removeAllListeners('warning') // Opcional - suprime warnings não críticos
//****************Código somente para teste de conexão com o DNS LOCAL ***************
//const dns = require('dns')
//dns.setServers(['8.8.8.8', '8.8.4.4'])
// *************************************************************** */
const express = require('express')
const mongoose = require('mongoose')
const { Blockchain, Block } = require('./blockchain') // Importando a classe Blockchain e o modelo Block
const app = express()

app.use(express.json())

mongoose.set('strictQuery', false) // ou true, conforme sua necessidade
// Conexão aprimorada com tratamento de erros
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true, // Correção erro R01
    w: 'majority', // Correção erro R01
  })
  .then(async () => {
    console.log('Conectado ao MongoDB Atlas!')

    // Inicialize a Blockchain APÓS a conexão
    const blockchain = new Blockchain()
    await blockchain.initialize()
    console.log('Blockchain inicializada')
    // Rotas (mantidas do serveroriginal.js)
    app.post('/prontuario', async (req, res) => {
      const { pacienteId, medico, informacoes } = req.body
      try {
        const newBlock = await blockchain.addBlock({
          pacienteId,
          medico,
          informacoes,
        })
        res.status(201).json(newBlock)
      } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar bloco' })
      }
    })

    app.get('/prontuario/:pacienteId', async (req, res) => {
      try {
        const blocks = await Block.find({
          'data.pacienteId': req.params.pacienteId,
        })
        res.json(blocks)
      } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar prontuário' })
      }
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
  })
  .catch((err) => {
    console.error('Erro fatal na conexão com MongoDB:', err)
    process.exit(1)
  })
