import { retornaUsuarioExistente} from "../../middlewares"; 
import { autenticaToken } from "../../middlewares"; 
import express from 'express';
import {atualizarSegurancaCliente, atulizarPerfilCliente, criarCliente, deletarCliente, listarClientes } from "../../controller/clienteController/clienteController";
import { fazerLogin } from "../../controller/clienteController/clienteController";

const clienteRoutes = express();
clienteRoutes.use(express.json())

//criando cliente e criptografando a senha
clienteRoutes.post('/cliente', criarCliente)

//criando token para determinado usuario (Fazer login)
clienteRoutes.post('/login', fazerLogin)

// Atualizando perfil do cliente
clienteRoutes.put('/cliente', retornaUsuarioExistente, autenticaToken, atulizarPerfilCliente)

// Atualizando dados de segurança do cliente (email e senha)
clienteRoutes.put('/cliente/dadosSeguranca', retornaUsuarioExistente, autenticaToken, atualizarSegurancaCliente)

// Listando todos os clientes
clienteRoutes.get('/cliente', listarClientes)

// Deletando cliente
clienteRoutes.delete('/cliente', retornaUsuarioExistente, autenticaToken, deletarCliente)

export { clienteRoutes }