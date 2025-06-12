const SHA256 = require('crypto-js/sha256')
const mongoose = require('mongoose')

// 1. Modelo do Bloco no MongoDB
const blockSchema = new mongoose.Schema({
  index: Number,
  timestamp: String,
  data: Object, // { pacienteId, medico, informacoes }
  previousHash: String,
  hash: String,
})
const Block = mongoose.model('Block', blockSchema)

// 2. Classe Blockchain
class Blockchain {
  constructor() {
    this.chain = []
    this.pendingData = []
  }

  //Atualizado o blockchain.js para garantir inicialização correta:
  async initialize() {
    try {
      await this.loadChainFromDB()
      if (this.chain.length === 0) {
        await this.createGenesisBlock()
      }
      console.log('Blockchain carregada com', this.chain.length, 'blocos')
    } catch (err) {
      console.error('Erro ao inicializar blockchain:', err)
    }
  }

  async loadChainFromDB() {
    const blocks = await Block.find().sort('index')
    this.chain = blocks
  }

  async createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      data: { message: 'Bloco Gênese' },
      previousHash: '0',
      hash: '0',
    }
    genesisBlock.hash = this.calculateHash(genesisBlock)
    const newBlock = new Block(genesisBlock)
    await newBlock.save()
    this.chain.push(genesisBlock)
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  calculateHash(block) {
    return SHA256(
      block.index +
        block.previousHash +
        block.timestamp +
        JSON.stringify(block.data)
    ).toString()
  }

  async addBlock(newBlockData) {
    const latestBlock = this.getLatestBlock()
    const newBlock = {
      index: latestBlock.index + 1,
      timestamp: new Date().toISOString(),
      data: newBlockData,
      previousHash: latestBlock.hash,
      hash: '',
    }
    newBlock.hash = this.calculateHash(newBlock)

    // Salva no MongoDB
    const dbBlock = new Block(newBlock)
    await dbBlock.save()

    this.chain.push(newBlock)
    return newBlock
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }
}

module.exports = { Blockchain, Block }
