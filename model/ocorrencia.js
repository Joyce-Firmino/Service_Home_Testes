const mongoose = require('../database/banco')

//..................... Definindo a estrutura da tabela Ocorrencia ...................
const { Schema } = mongoose;

const ocorrenciaSchema = new Schema({
  titulo: String,
  tipo: String,
  dataHora: {
    type: Date
  },
  localizacao: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
});

const Ocorrencia = mongoose.model('Ocorrencia', ocorrenciaSchema);

module.exports = Ocorrencia;




