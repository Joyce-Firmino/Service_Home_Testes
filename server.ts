import express from 'express';
import { routes } from './routes/index';
import cors from 'cors';

const app = express();
app.use(express.json())

app.use(cors())

app.use(routes)

app.listen(3009, () => {
    console.log("conectado");
});