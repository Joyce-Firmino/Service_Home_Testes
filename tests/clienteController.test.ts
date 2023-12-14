import { Request, Response } from 'express';
import { criarCliente, fazerLogin, atulizarPerfilCliente, atualizarSegurancaCliente, deletarCliente, listarClientes } from '../controller/clienteController/clienteController';
import { prismaClient } from '../prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../prismaClient', () => ({
    prismaClient: {
        usuario: {
            create: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(null), // Retorna null para indicar que o usuário não existe
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        cliente: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Teste de cliente', () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });
  describe('Casos de sucesso', () => {
    test('Deve ser possível cadastrar um cliente', async () => {
      const mockReq = {
        body: {
          nome: 'Terceiro',
          email: 'terceiro.chuu@gmail.com',
          senha: '123456',
          telefone: '(83) 4002=8922',
          cpf: '999.999.999-99',
          endereco: 'Rua dos bobos, nº 0',
        },
      } as Request;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    (prismaClient.usuario.create as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioCriado' });
    (prismaClient.cliente.create as jest.Mock).mockResolvedValueOnce({ id: 'idDoClienteCriado' });

    await criarCliente(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Cliente criado com sucesso' });
    });
    
    test('Deve ser possível atualizar um cliente', async () => {
      const mockReq = {
        autenticado: 'idDoCliente', // Simula um usuário autenticado
        body: {
          nome: 'Terceiro',
          telefone: '(83) 4002-8922',
          foto: 'chuu.jpg',
          cpf: '999.999.999-99',
          endereco: 'Avenida Brasil, nº 5',
        },
      } as Request;
  
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      (prismaClient.usuario.update as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioAtualizado' });
      (prismaClient.cliente.update as jest.Mock).mockResolvedValueOnce({ id: 'idDoClienteAtualizado' });
  
      await atulizarPerfilCliente(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith('Cliente atualizado com sucesso');
    });

    test('Deve ser possível atualizar a segurança de um cliente', async () => {
      const mockReq = {
        autenticado: 'idDoCliente', // Simula um usuário autenticado
        body: {
          email: 'novo_email@gmail.com',
          senha: 'nova_senha_segura',
        },
      } as Request;
  
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      (prismaClient.usuario.update as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioAtualizado' });
  
      await atualizarSegurancaCliente(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith('Cliente atualizado com sucesso');
    });

    test('Deve ser possível deletar um cliente', async () => {
      const mockReq = {
        autenticado: 'idDoCliente', // Simula um usuário autenticado
      } as Request;
  
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      // Mock da função de deleção do Prisma
      (prismaClient.cliente.delete as jest.Mock).mockResolvedValueOnce({ id: 'idDoClienteDeletado' });
      (prismaClient.usuario.delete as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioDeletado' });
  
      await deletarCliente(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith('Cliente deletado com sucesso');
    });

    test('Deve ser possível listar todos os clientes', async () => {
      const clientes = [
        {
          id: 'idGenerico1',
          nome: 'Gabriella',
          email: 'regina_george@gmail.com',
          telefone: '(83) 1234-5678',
        },
        {
          id: 'idGenerico2',
          nome: 'Marianna',
          email: 'bora@gmail.com',
          telefone: '(83) 8765-4321',
        },
      ];
    
      const mockReq = {} as Request;
    
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      (prismaClient.usuario.findMany as jest.Mock).mockResolvedValueOnce(clientes);
    
      await listarClientes(mockReq, mockRes);
    
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(clientes);
    });   
  });

  describe('Casos de falha', () => {
    test('Não deve ser possível cadastrar um cliente já existente', async () => {
      const mockReq = {
        body: {
          nome: 'Gabriella',
          email: 'regina_george@gmail.com',
          senha: 'ricarts2',
          telefone: '(83) 1234-5678',
          cpf: '123.456.789-00',
          endereco: 'Rua dos gatos, nº 12',
        },
      } as Request;
  
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      // Mock da função findUnique do Prisma para simular que o usuário já existe
      (prismaClient.usuario.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioExistente' });
  
      await criarCliente(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário já existe' });
      });
  });
});