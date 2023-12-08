import { Request, Response } from "express";
import { criarPrestador, atualizarPerfilPrestador } from "../controller/prestadorController/prestadorController";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";



let prisma: PrismaClient;

beforeAll(async () => {
    prisma = new PrismaClient();
});

beforeEach(async () => {
    // Limpar os dados relevantes do banco de dados antes de cada teste
    await prisma.prestadorServico.deleteMany({});
    await prisma.usuario.deleteMany({});
});

afterAll(async () => {
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


// test('Deve ser possível criar um prestador de serviço(teste integração)', async () => {
//     const senhaOriginal = "senha456";
//     const senhaCriptografada = await hash(senhaOriginal, 5);

//     const mockReq = {
//         body: {
//             nome: "Carlos Santos",
//             email: "carlos.santos@example.com",
//             senha: senhaOriginal,
//             telefone: "(33) 1234-5678",
//             cnpj: "11.223.334/5566-77",
//             horarioDisponibilidade: "10h às 20h",
//         },
//     } as Request;

//     const mockRes = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//     } as unknown as Response;

//     await criarPrestador(mockReq, mockRes);

//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const prestadorCriado = await prisma.usuario.findUnique({
//         where: {
//             email: "carlos.santos@example.com",
//         },
//     });

//     if (!prestadorCriado) {
//         throw new Error("Prestador não encontrado");
//     }

//     const senhaCorrespondente = await compare(senhaOriginal, prestadorCriado.senha);

//     if (!senhaCorrespondente) {
//         throw new Error("Senha não corresponde");
//     }

//     const prestadorEsperado = {
//         nome: "Carlos Santos",
//         email: "carlos.santos@example.com",
//         senha: senhaCriptografada, // Use a senha criptografada aqui
//         telefone: "(33) 1234-5678",
//         cnpj: "11.223.334/5566-77",
//         horarioDisponibilidade: "10h às 20h",
//     };

//     expect(prestadorCriado).toMatchObject(prestadorEsperado);
// });


// test('Deve ser possível criar um prestador de serviço(teste integração)', async () => {
//     const senha= "senha456";
//     const senhaCriptografada = await hash(senha, 5);

//     const mockReq = {
//         body: {
//             nome: "Carlos Santos",
//             email: "carlos.santos@example.com",
//             senha: "senha456",
//             telefone: "(33) 1234-5678",
//             cnpj: "11.223.334/5566-77",
//             horarioDisponibilidade: "10h às 20h",
//         },
//     } as Request;

//     const mockRes = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//     } as unknown as Response;

//     await criarPrestador(mockReq, mockRes);

//     // Espera um curto período (500ms) para a criação ser concluída no banco de dados
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const prestadorEsperado = {
//         nome: "Carlos Santos",
//         email: "carlos.santos@example.com",
//         senha: senhaCriptografada,
//         telefone: "(33) 1234-5678",
//         cnpj: "11.223.334/5566-77",
//         horarioDisponibilidade: "10h às 20h",
//     };

//     const prestadorCriado = await prisma.usuario.findUnique({
//         where: {
//             email: "carlos.santos@example.com",
//         },
//     });

//     expect(prestadorCriado).toMatchObject(prestadorEsperado);
// });


// test('Deve ser possível criar um prestador de serviço(teste integração)', async () => {
//     const mockReq = {
//         body: {
//             nome: 'Carlinha',
//             email: 'carlitaa@gmail.com',
//             telefone: '(11) 9876-5432',
//             cnpj: '98.765.437/1098-76',
//             horarioDisponibilidade: '09h às 17h',
//         },
//     } as Request;

//     const mockRes = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//     } as unknown as Response;

//     await criarPrestador(mockReq, mockRes);

//     const prestadorEsperado = {
//         nome: 'Carlinha',
//         email: 'carlitaa@gmail.com',
//         telefone: '(11) 9876-5432',
//         cnpj: '98.765.437/1098-76',
//         horarioDisponibilidade: '09h às 17h',
//     };

//     const prestadorCriado = await prisma.usuario.findUnique({
//         where: {
//             email: 'carlitaa@gmail.com',

//         },
//     });

//     expect(prestadorCriado).toMatchObject(prestadorEsperado);
// });