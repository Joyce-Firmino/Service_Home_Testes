import { Request, Response } from 'express';
import { criarPrestador, fazerLogin } from '../controller/prestadorController/prestadorController';
import { prismaClient } from "../prismaClient";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


import { criarAnuncio, deletaAnuncio, editaAnuncio, listaAnuncioPrestador } from '../controller/anuncioController/anuncioController'; // Substitua pelo caminho real

beforeEach(() => {
    jest.clearAllMocks();
});

jest.mock('../prismaClient', () => ({
    prismaClient: {
        anuncio: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn()
        },
    },
}));

describe('Testes para Anúncios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Casos de Sucesso', () => {
        test('Deve ser possível criar um anúncio', async () => {

            // criei um mock
            const mockReq = {
                body: {
                    titulo: 'Anúncio',
                    descricao: 'Descrição do anúncio de teste',
                    latitude: 10.123,
                    longitude: 20.456,
                    preco: 50.0,
                    servico: 'servico_teste',
                },
                autenticado: '3dj2jq33gh2332ff',
            } as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            (prismaClient.anuncio.create as jest.Mock).mockResolvedValueOnce({
                id: '3dj2jq33gh2332ff',
            });

            await criarAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            // expect(mockRes.json).toHaveBeenCalledWith({ id: 'idDoUsuarioAutenticado' });
        });

        test('Deve ser possível editar um anúncio', async () => {
            const mockReq = {
                body: {
                    titulo: 'Novo Título',
                    descricao: 'Nova Descrição',
                    preco: '99.99',
                    servico: 'Novo Serviço',
                    latitude: '12.345',
                    longitude: '67.890',
                },
                params: {
                    id: '3dj2jq33gh2332ff',
                },
            } as unknown as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            (prismaClient.anuncio.update as jest.Mock).mockResolvedValueOnce({
                id: '3dj2jq33gh2332ff',
                // Outros campos do anúncio, se necessário
            });

            await editaAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            // expect(mockRes.json).toHaveBeenCalledWith({ id: 'idDoAnuncio' });
        });

        test('Deve retornar a lista de anúncios do prestador', async () => {
            const mockUserId = '234567818293'; // Substitua pelo ID real do usuário autenticado
            const mockReq = {
                body: {
                    id: '1',
                    titulo: 'Anúncio 1',
                    descricao: 'Descrição do Anúncio 1',
                    latitude: 10.123,
                    longitude: 20.456,
                    preco: '50.0',
                    servico: 'servico_teste_1',
                    prestadorId: mockUserId,
                },
                userExpr: {
                    id: "dafaefae"
                }
            } as unknown as Request;

            (prismaClient.anuncio.findMany as jest.Mock).mockResolvedValueOnce(mockReq);

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            // Mockando a chamada do Prisma Client se necessário

            await listaAnuncioPrestador(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockReq);
        });

        test('Deve deletar um anúncio com sucesso', async () => {
            const mockAnuncioId = 'idDoAnuncio'; // Substitua pelo ID real do anúncio

            const mockReq = {
                params: {
                    id: mockAnuncioId,
                },
            } as unknown as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            (prismaClient.anuncio.delete as jest.Mock).mockResolvedValueOnce({
                id: mockAnuncioId,
                // Outros campos do anúncio, se necessário
            });

            await deletaAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ id: mockAnuncioId });
        });
    })

    describe('Casos de Erro', () => {

        test('Deve retornar um erro de falha ao deletar um anúncio', async () => {
            const mockAnuncioId = 'idDoAnuncio'; // Substitua pelo ID real do anúncio

            const mockReq = {
                params: {
                    id: mockAnuncioId,
                },
            } as unknown as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            (prismaClient.anuncio.delete as jest.Mock).mockRejectedValueOnce(new Error('Erro ao deletar anúncio'));

            await deletaAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ Error: 'Não foi possível deletar anúncio!' });
        });

        test('Deve retornar um erro de falha ao editar um anúncio', async () => {

            const mockReq = {
                body: {
                    titulo: 'Novo Título',
                    descricao: 'Nova Descrição',
                    preco: '99.99',
                    servico: 'Novo Serviço',
                    latitude: '12.345',
                    longitude: '67.890',
                },
                params: {
                    id: '3dj2jq33gh2332ff', // Substitua com um ID real existente no seu banco de dados
                },
            } as unknown as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            (prismaClient.anuncio.update as jest.Mock).mockRejectedValueOnce(new Error('Não foi possível editar anúncio!'));

            await editaAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ Error: 'Não foi possível editar anúncio!' });
        })

        test('Deve retornar um erro  de falha ao criar um anúncio', async () => {
            const mockPrestadorId = 'idDoPrestador'; // Substitua pelo ID real do prestador
            const mockTitulo = 'Anúncio Duplicado';

            const mockReq = {
                body: {
                    titulo: mockTitulo,
                    descricao: 'Descrição do anúncio de teste',
                    latitude: 10.123,
                    longitude: 20.456,
                    preco: 50.0,
                    servico: 'servico_teste',
                },
                autenticado: mockPrestadorId,
            } as Request;

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            // Mockando a busca por anúncios com o mesmo título e prestadorId
            (prismaClient.anuncio.findFirst as jest.Mock).mockResolvedValueOnce([
                {
                    id: 'idDoAnuncioExistente',
                    titulo: mockTitulo,
                    prestadorId: mockPrestadorId,
                },
            ]);

            await criarAnuncio(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ Error: 'Não foi possível criar anúncio! Título duplicado para o mesmo prestador.' });
        })

    })
});