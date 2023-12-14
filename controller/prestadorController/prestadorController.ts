import { prismaClient } from "../../prismaClient";
import express, { Request, Response } from 'express';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';


const app = express();
app.use(express.json())



//Criar prestador
export async function criarPrestador(req: Request, res: Response) {
    const { nome, email, senha, telefone, cnpj, horarioDisponibilidade } = req.body
    
     // Verificar se o usuario já está cadastrado
  const usuarioCadastro = await prismaClient.usuario.findUnique({
    where:{
      email: email,
    }
  });

  if (usuarioCadastro !== null) {
    return res.status(409).json({ error: "Usuário já existe" });
  }

    try {
        const senhaCriptografada = await hash(senha, 5)
        const novoUsuario = await prismaClient.usuario.create({
            data: {
                nome,
                email,
                senha: senhaCriptografada,
                telefone,
            }
        })
        const novoPrestador = await prismaClient.prestadorServico.create({
            data: {
                cnpj,
                horarioDisponibilidade,
                anuncios: {
                    create: []
                },
                usuario: {
                    connect: {
                        id: novoUsuario.id
                    }
                }
            }
        });
        res.status(201).json({ message: 'Prestador de serviço criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar prestador de serviço' });
    }
};



//Cria token para determinado usuario (Fazer login)
export async function fazerLogin(req: Request, res: Response) {
    const { email, senha } = req.body
    const retornaUsuarioPrestador = await prismaClient.usuario.findUnique({
        where: {
            email: email
        },
    })
    try {
        if (retornaUsuarioPrestador !== null) {
            const compararSenhas = await compare(senha, retornaUsuarioPrestador.senha)
            if (!compararSenhas) {
                return res.status(401).json({ message: "Credenciais inválidas!" });
            }
            const prestadorId = retornaUsuarioPrestador.id

            const token = jwt.sign(
                { id: prestadorId },
                process.env.CHAVE_SECRETA as string,
                { expiresIn: '1d', subject: prestadorId }
            );

            return res.status(200).json(token)
        }
    } catch (error) {
        return res.status(404).json({ error: "Erro ao fazer login do prestador" })
    }

};



// Atualizando perfil do prestador
export async function atualizarPerfilPrestador(req: Request, res: Response) {
    const id = req.autenticado
    if (!id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const { nome, telefone, cnpj, horarioDisponibilidade } = req.body

    try {
        const atualizaUsuario = await prismaClient.usuario.update({
            where: {
                id: id
            },
            data: {
                nome,
                telefone,
            }
        })
        const atualizaPrestador = await prismaClient.prestadorServico.update({
            where: {
                usuarioIdPrestador: id
            },
            data: {
                cnpj,
                horarioDisponibilidade
            }
        })
        return res.status(200).json({ message: 'Prestador de serviço atualizado com sucesso' })
    } catch (error) {
        return res.status(500).json({ error: "Erro a atualizar prestador" })
    }
}


// Atualizando dados de segurança do prestador (email e senha)
export async function atualizarSegurancaPrestador(req: Request, res: Response) {
    const { email, senha } = req.body
    const id = req.autenticado
    if (!email || !senha) {
        return res.status(400).json({ error: 'Dados inválidos ao atualizar a segurança do prestador' });
    }

    const senhaCriptografada = await hash(senha, 5)
    try {
        const atualizaUsuario = await prismaClient.usuario.update({
            where: {
                id: id
            },
            data: {
                email,
                senha: senhaCriptografada
            }
        })
        return res.status(200).json("Prestador atualizado com sucesso ")
    } catch (error) {
        return res.status(404).json({ error: "Erro a atualizar prestador" })
    }
};


// Listando todos os usuários prestadores com detalhes
export async function listarTodosPrestadores(req: Request, res: Response) {
    try {
        const usuariosComPrestadores = await prismaClient.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                prestador: {
                    select: {
                        cnpj: true,
                        horarioDisponibilidade: true,
                    },
                },
            },
        });

        return res.status(200).json(usuariosComPrestadores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao obter usuários e prestadores de serviço" });
    }
};


// Listando os prestadores por tipo de serviço
export async function listarPrestadoresPorServico(req: Request, res: Response) {
    const servico = <string>req.body.servico.toLowerCase();

    try {
        const prestadores = await prismaClient.prestadorServico.findMany({
            where: {
                anuncios: {
                    some: {
                        servico: {
                            equals: servico
                        }
                    }
                }
            },
            include: {
                usuario: {
                    select: {
                        id: false,
                        nome: true,
                        email: true,
                        telefone: true,
                        // cliente: true,  verificar depois se eu quiser ver clientes associados a prestador
                    }
                },
            }
        });

        if (prestadores.length === 0) {
            return res.status(404).json({ error: 'Nenhum prestador encontrado para esse serviço' });
        }

        const prestadoresComUsuarioPrimeiro = prestadores.map((prestador) => {
            return {
                ...prestador.usuario,
                prestador: {
                    cnpj: prestador.cnpj,
                    horarioDisponibilidade: prestador.horarioDisponibilidade
                }
            };
        });

        res.json({ prestadores: prestadoresComUsuarioPrimeiro });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar prestadores por serviço' });
    }
};



// Deleta prestadores
export async function deletarPrestador(req: Request, res: Response) {
    const id = req.autenticado; // id do usuario autenticado
    
    try {
        // Deletando todos os anúncios do usuário Prestador antes de deletar o prestador
        await prismaClient.anuncio.deleteMany({
            where: {
                prestadorId: id
            }
        });

        try {
            // Deleta o prestador
            await prismaClient.prestadorServico.delete({
                where: {
                    usuarioIdPrestador: id
                },
            });

            try {
                // Deleta o usuário
                await prismaClient.usuario.delete({
                    where: {
                        id: id
                    },
                });

                return res.status(200).json({ message: 'Prestador deletado com sucesso!' });
            } catch (error) {
                // Caso haja falha ao deletar o usuário após excluir o prestador
                return res.status(500).json({ error: 'Erro ao deletar o usuário', details: error });
            }
        } catch (error) {
            // Caso haja falha ao deletar o prestador
            return res.status(500).json({ error: 'Erro ao deletar o prestador', details: error });
        }
    } catch (error) {
        // Caso haja falha ao deletar os anúncios do prestador
        return res.status(500).json({ error: 'Erro ao deletar os anúncios do prestador', details: error });
    }
};