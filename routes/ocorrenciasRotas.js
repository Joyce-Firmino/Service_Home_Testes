require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')

const Ocorrencia = require('../model/ocorrencia')
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // permite a api se comunicar com outro site

const app = express();
app.use(express.json());
app.use(cors());


app.post('/ocorrencia', async (req, res) => {
    const { latitude, longitude, titulo, tipo, dataHora } = req.body;
    const ocorrencia = new Ocorrencia({
        titulo,
        tipo,
        dataHora,
        localizacao: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    });

    const novaOcorrencia = await ocorrencia.save().then((retorno) => console.log("Salvo com sucesso", retorno)).catch(err => console.log("Erro:",err));

    return res.status(200).json(novaOcorrencia);
})

app.get('/ocorrencia', async (req, res) => {
    try {
        const lista = await Ocorrencia.find();
        res.json(lista);
    } catch (err) {
        console.error('Erro ao buscar dados do MongoDB:', err);
        res.status(500).send('Erro ao buscar dados do MongoDB');
    }
})

app.delete('/ocorrencia', async (req, res) => {
    const { id } = req.body;
      // Validar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const deletando = await Ocorrencia.findOneAndDelete({ _id: id });
    res.status(201).send(JSON.stringify("Deletado com sucesso"));
  } catch (error) {
    // Tratar outros erros, se necessário
    res.status(500).send('Erro interno');
  }

})

app.put('/ocorrencia', async (req, res) => {
    const { dataHora, latitude, longitude, titulo, tipo, id } = req.body
    const edite = await Ocorrencia.updateOne({ _id: id }, {
        $set: {
            titulo: titulo, tipo: tipo, dataHora: dataHora, localizacao: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        }
    })
    res.status(500).send('Erro');
})


const porta = process.env.API_PORT;

app.listen(porta, () => {
    console.log(`Conectado na porta ${porta}`);
}
);