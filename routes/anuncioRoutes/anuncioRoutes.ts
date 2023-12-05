// import { retornaPrestadorExistente } from "./middlewares";
import { retornaUsuarioExistente } from "../../middlewares";
import { autenticaToken } from "../../middlewares"; 
import { criarAnuncio, deletaAnuncio, editaAnuncio, listaAnuncioPrestador, listaTodosAnuncios } from "../../controller/anuncioController/anuncioController";
import express from 'express';


const anuncioRoutes = express();
anuncioRoutes.use(express.json())


// cria anuncio associado a um prestador 
anuncioRoutes.post('/anuncio', retornaUsuarioExistente, autenticaToken, criarAnuncio);

// lista os anuncios associados a um prestador
anuncioRoutes.get('/anunciosPrestador', retornaUsuarioExistente, listaAnuncioPrestador);

// lista todos os anuncios cadastrados
anuncioRoutes.get('/anuncios', listaTodosAnuncios);

// edita um anuncio 
anuncioRoutes.put('/anuncios/:id', retornaUsuarioExistente, autenticaToken, editaAnuncio);

// deleta um anuncio
anuncioRoutes.delete('/anuncio/:id', retornaUsuarioExistente, autenticaToken, deletaAnuncio);

export { anuncioRoutes }