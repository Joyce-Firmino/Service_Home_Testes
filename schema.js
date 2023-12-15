require('dotenv').config();
const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventoSchema = new Schema({
    titulo: String,
    decricao: String,
    data: Date,
    inscritos: Number,
    tipo: {
        type: String,
        enum: ['Cientifico', 'Tecnologico', 'Cultural', 'Religioso'],
        default: Number
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

const Evento = mongoose.model('Evento', eventoSchema);

module.exports = Evento;