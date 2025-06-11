const express = require('express')
const mongoose = require('mongoose')
const Blockchain = require('./blockchain')
const app = express()
app.use(express.json())

// Conecte ao MongoDB Atlas (variável de ambiente)
mongoose.connect(process.env.MONGODB_URI)

// Inicialize a Blockchain
const blockchain = new Blockchain()
blockchain.initialize()

// Rota para adicionar prontuário
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

// Rota para consultar prontuários
app.get('/prontuario/:pacienteId', async (req, res) => {
  const blocks = await Block.find({ 'data.pacienteId': req.params.pacienteId })
  res.json(blocks)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
