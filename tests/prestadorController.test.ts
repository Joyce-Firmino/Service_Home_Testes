import { Request, Response } from 'express';
import { criarPrestador,fazerLogin, atualizarPerfilPrestador, deletarPrestador, atualizarSegurancaPrestador} from '../controller/prestadorController/prestadorController'; 
import { prismaClient } from "../prismaClient";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



jest.mock('../prismaClient', () => ({
  prismaClient: {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null), // Retorna null para indicar que o usuário não existe
      update: jest.fn(),
      delete: jest.fn(),
    }, 
    prestadorServico: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    anuncio: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('Teste de prestador', () => {
  describe('Casos de sucesso', () => {

    test('Deve ser possível cadastrar um prestador de serviço', async () => {
      const mockReq = {
        body: {
          nome: "João",
          email: 'joao@example.com',
          senha: '123456',
          telefone: '(12) 3456-789',
          cnpj: '12.345.678/9012-34',
          horarioDisponibilidade: '08h às 18h'
          }
        } as Request;
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      
      (prismaClient.usuario.create as jest.Mock).mockResolvedValueOnce({ id: 'idDoUsuarioCriado' });
      (prismaClient.prestadorServico.create as jest.Mock).mockResolvedValueOnce({ id: 'idDoPrestadorCriado' });
      
      await criarPrestador(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Prestador de serviço criado com sucesso' });
    });

    test('Deve ser possível fazer login de um prestador', async () => {
      const mockReq = {
        body: {
          email: 'joao@example.com',
          senha: '123456',
        },
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Simulando o retorno do usuário ao fazer login
      (prismaClient.usuario.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'idDoUsuario',
        email: 'joao@example.com',
        senha: 'senhaCriptografada',
        // Outros campos do usuário, se necessário
      });

      // Simulando o comportamento de sucesso na comparação de senhas
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

      // Simulando o retorno do token ao fazer login
      jest.spyOn(jwt, 'sign').mockReturnValueOnce('token_simulado' as any);

      await fazerLogin(mockReq, mockRes);

      // Verifica se o status retornado é 201
      expect(mockRes.status).toHaveBeenCalledWith(201);
      // Verifica se o token foi retornado no JSON
      expect(mockRes.json).toHaveBeenCalledWith('token_simulado');
    });

    test('Deve ser possível atualizar dados de um prestador', async () => {
      const mockReq = {
        autenticado: '58d5f45d654fd', // Simulando um ID autenticado do prestador
        body: {
          nome: 'Roseane',
          telefone: '(58) 6571-6478',
          cnpj: '66.654.314/0001-65',
          horarioDisponibilidade: '09h às 17h',
        },
      } as Request;
    
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      // Mock para simular a atualização bem-sucedida do prestador
      (prismaClient.usuario.update as jest.Mock).mockResolvedValueOnce({ id: '58d5f45d654fd' });
      (prismaClient.prestadorServico.update as jest.Mock).mockResolvedValueOnce({ id: '58d5f45d654fd' });
    
      await atualizarPerfilPrestador(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Prestador de serviço atualizado com sucesso' });

    });

    test('Deve ser possível deletar um prestador', async () => {
      const mockReq = {
        autenticado: '58d5f45d654fd',
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock para simular a exclusão bem-sucedida do prestador e do usuário
      (prismaClient.anuncio.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (prismaClient.prestadorServico.delete as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (prismaClient.usuario.delete as jest.Mock).mockResolvedValueOnce({ count: 1 });

      await deletarPrestador(mockReq, mockRes);

      expect(prismaClient.anuncio.deleteMany).toHaveBeenCalledWith({
        where: {
          prestadorId: '58d5f45d654fd',
        },
      });

      expect(prismaClient.prestadorServico.delete).toHaveBeenCalledWith({
        where: {
          usuarioIdPrestador: '58d5f45d654fd',
        },
      });

      expect(prismaClient.usuario.delete).toHaveBeenCalledWith({
        where: {
          id: '58d5f45d654fd',
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Prestador deletado com sucesso!' });
    });
  });
});


describe('Teste de prestador', () => {
  describe('Casos de erro', () => {

    test('Não deve ser possível cadastrar dois prestadores com mesmo email', async () => {
      const mockReq1 = {
        body: {
          nome: "João",
          email: 'joao@example.com',
          senha: '123456',
          telefone: '(12) 3456-789',
          cnpj: '12.345.678/9012-34',
          horarioDisponibilidade: '08h às 18h'
        }
      } as Request;
    
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      // Simulando a consulta ao tentar cadastrar o segundo prestador com o mesmo email
      (prismaClient.usuario.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'idDoUsuarioExistente',
        email: 'joao@example.com',
        // Outros campos do usuário, se necessário
      });
    
      await criarPrestador(mockReq1, mockRes); // Cria o primeiro prestador
    
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário já existe' });
    });

    test('Não deve ser possível que prestador atualize seus dados sem está autenticado', async () => {
      const mockReq = {
        autenticado: undefined, // Simulando que o usuário não está autenticado
        body: {
          nome: 'Novo Nome',
          telefone: '(99) 9999-9999',
          cnpj: '98.765.432/1098-76',
          horarioDisponibilidade: '09h às 17h'
        },
      } as unknown as Request;
    
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      await atualizarPerfilPrestador(mockReq, mockRes);
    
      expect(mockRes.status).toHaveBeenCalledWith(401); // Ou 403, dependendo do erro de autenticação que você está usando
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não autenticado' });
    });

    test('Não deve ser possível atualizar a segurança do prestador com dados inválidos', async () => {
      const mockReq = {
        autenticado: '58d5f45d654fd', // Simulando um ID autenticado do prestador
        body: {
          email: '', // Simulando um email vazio
          senha: '', // Simulando uma senha vazia
        },
      } as unknown as Request;
    
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    
      await atualizarSegurancaPrestador(mockReq, mockRes);
    
      expect(mockRes.status).toHaveBeenCalledWith(400); // Ou outro código de erro que você definir para dados inválidos
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Dados inválidos ao atualizar a segurança do prestador' });
    });
    

  });
});