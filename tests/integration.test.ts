import { Request, Response } from "express";
import { criarPrestador, atualizarPerfilPrestador } from "../controller/prestadorController/prestadorController";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { criarAnuncio } from "../controller/anuncioController/anuncioController";
import { criarCliente } from "../controller/clienteController/clienteController";



let prisma: PrismaClient;

beforeAll(async () => {
    prisma = new PrismaClient();
});

beforeEach(async () => {
    // Limpar os dados relevantes do banco de dados antes de cada teste
    await prisma.anuncio.deleteMany({})
    await prisma.cliente.deleteMany({})
    await prisma.prestadorServico.deleteMany({});
    await prisma.usuario.deleteMany({});

});

afterAll(async () => {
    await prisma.anuncio.deleteMany({})
    await prisma.cliente.deleteMany({})
    await prisma.prestadorServico.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.$disconnect();
});




// Testes de integração
test('Deve ser possível criar um prestador de serviço no banco de dados', async () => {
    const senha = 'senha456';

    const mockReq = {
        body: {
            nome: 'Carlos Santos',
            email: 'carlos.santos@example.com',
            senha,
            telefone: '(33) 1234-5678',
            cnpj: '11.223.334/5566-77',
            horarioDisponibilidade: '10h às 20h',
        },
    } as Request;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    await criarPrestador(mockReq, mockRes);

    const usuarioCriado = await prisma.usuario.findUnique({
        where: {
            email: 'carlos.santos@example.com',
        },
    });

    const prestadorCriado = await prisma.prestadorServico.findUnique({
        where: {
            cnpj: '11.223.334/5566-77',
        },
    });

    if (!prestadorCriado || !usuarioCriado) {
        throw new Error("Prestador não encontrado");
    }
    const senhaCorrespondente = await compare(senha, usuarioCriado.senha);

    expect(senhaCorrespondente).toBe(true);

    // Verifica se outros dados do prestador estão corretos
    expect(usuarioCriado.nome).toBe('Carlos Santos');
    expect(usuarioCriado.email).toBe('carlos.santos@example.com');
    expect(usuarioCriado.telefone).toBe('(33) 1234-5678');
    expect(prestadorCriado.cnpj).toBe('11.223.334/5566-77');
    expect(prestadorCriado.horarioDisponibilidade).toBe('10h às 20h');
});

test('Deve ser possível atualizar um prestador de serviço no banco de dados', async () => {
    const mockReqCriar = {
        body: {
            nome: "Maria Oliveira",
            email: "maria.oliveira@example.com",
            senha: "senha123",
            telefone: "(11) 9876-5432",
            cnpj: "98.765.432/1098-76",
            horarioDisponibilidade: "09h às 17h",
        },
    } as Request;

    const mockResCriar = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    await criarPrestador(mockReqCriar, mockResCriar);

    // Busca o prestador criado no banco de dados
    const prestadorCriado = await prisma.prestadorServico.findUnique({
        where: {
            cnpj: "98.765.432/1098-76",
        },
    });

    const usuarioCriado = await prisma.usuario.findUnique({
        where: {
            email: "maria.oliveira@example.com",
        },
    });
    // Verifica se o prestador foi criado corretamente
    expect(prestadorCriado).toBeTruthy();

    const mockReqAtualizar = {
        autenticado: usuarioCriado?.id, // Simulando um ID autenticado do prestador
        body: {
            nome: 'Carla',
            telefone: '(11) 9876-5432',
            cnpj: '98.765.432/1098-76',
            horarioDisponibilidade: '09h às 17h',
        },
    } as Request;

    const mockResAtualizar = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    await atualizarPerfilPrestador(mockReqAtualizar, mockResAtualizar);

    // Busca o prestador atualizado no banco de dados
    const prestadorUsuarioAtualizado = await prisma.usuario.findUnique({
        where: {
            email: usuarioCriado?.email
        },
    });

    // Busca o prestador atualizado no banco de dados
    const prestadorAtualizado = await prisma.prestadorServico.findUnique({
        where: {
            cnpj: prestadorCriado?.cnpj
        },
    });

    // Verifica se o prestador foi atualizado corretamente
    expect(prestadorUsuarioAtualizado?.nome).toBe('Carla');
    expect(prestadorUsuarioAtualizado?.telefone).toBe('(11) 9876-5432');
    expect(prestadorAtualizado?.cnpj).toBe('98.765.432/1098-76');
    expect(prestadorAtualizado?.horarioDisponibilidade).toBe('09h às 17h');
});

test('Deve ser possível criar um anúncio no banco de dados', async () => {
    const mockReqCriar = {
        body: {
            nome: "Joaquim de Oliveira",
            email: "joaquim.oliveira@example.com",
            senha: "senha123",
            telefone: "(11) 9876-5432",
            cnpj: "98.685.432/1098-76",
            horarioDisponibilidade: "09h às 17h",
        },
    } as Request;

    const mockResCriar = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    await criarPrestador(mockReqCriar, mockResCriar);

    const prestadorCriado = await prisma.prestadorServico.findUnique({
        where: {
            cnpj: "98.685.432/1098-76",
        },
    });

    const usuarioCriado = await prisma.usuario.findUnique({
        where: {
            email: "joaquim.oliveira@example.com",
        },
    });

    expect(prestadorCriado).toBeTruthy();
    const mockreqAnuncio = {
        autenticado: usuarioCriado?.id, // Simulando um ID autenticado do prestador
        body: {
            titulo: "Eletricidade",
            descricao: "Energia",
            preco: "R$ 100,00",
            servico: "Eletricista",
            latitude: "21456314123",
            longitude: "6512365121",
        },
    } as Request;

    const mockResAnuncio = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    // Chamar a função para criar o anúncio
    await criarAnuncio(mockreqAnuncio, mockResAnuncio);
    expect(mockResAnuncio.status).toHaveBeenCalledWith(200);

    const anuncioCriado = await prisma.anuncio.findFirst({
        where: {
            titulo: "Eletricidade",
            prestadorId: usuarioCriado?.id,
        },
    });

    const anuncioEsperado={
        id: anuncioCriado?.id,
        titulo: anuncioCriado?.titulo,
        descricao: anuncioCriado?.descricao,
        preco: anuncioCriado?.preco,
        servico: anuncioCriado?.servico,
        latitude:  anuncioCriado?.latitude,
        longitude: anuncioCriado?.longitude,
        dtCriacao: anuncioCriado?.dtCriacao,
        dtAtualizacao: anuncioCriado?.dtAtualizacao,
        prestadorId: anuncioCriado?.prestadorId   }

    expect(anuncioCriado).toEqual(anuncioEsperado);

    const idAnuncioCriado= anuncioCriado?.id
    console.log(idAnuncioCriado);
});

test('Deve ser possível criar um cliente no banco de dados', async () => {
    const senha = 'senha456';
    const mockReq = {
        body: {
            nome: 'Verissimo Terceiro',
            email: 'terceiro.chuu@gmail.com',
            senha,
            telefone: '(83) 4002-8922',
            cpf: '999.999.999-99',
            endereco: 'Avenida Brasil, nº 5',
        },
    } as Request;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;

    await criarCliente(mockReq, mockRes);

    const usuarioCriado = await prisma.usuario.findUnique({
        where: {
            email: 'terceiro.chuu@gmail.com',
        },
    });

    const clienteCriado = await prisma.cliente.findUnique({
        where: {
            cpf: '999.999.999-99',
        },
    });

    if (!clienteCriado || !usuarioCriado) {
        throw new Error("Cliente não encontrado");
    }
    const senhaCorrespondente = await compare(senha, usuarioCriado.senha);

    expect(senhaCorrespondente).toBe(true);
    expect(usuarioCriado.nome).toBe('Verissimo Terceiro');
    expect(usuarioCriado.email).toBe('terceiro.chuu@gmail.com');
    expect(usuarioCriado.telefone).toBe('(83) 4002-8922');
    expect(clienteCriado.cpf).toBe('999.999.999-99');
    expect(clienteCriado.endereco).toBe('Avenida Brasil, nº 5');
});