

describe('Testes de sucesso', () => {

    const titulo = "Nova ocorrencia"

    const atualizar = "Atualizado"

    let idOcorrencia;

    it('Deve carregar a página inicial', () => {
        cy.visit('http://127.0.0.1:5500/view/index.html');
        cy.contains('Faça Suas Denúncias Aqui!').should('exist');
    });

    it('Deve ser direcionado para a página de adicionar ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/index.html');

        cy.get('#denuncia').click();

        cy.url().should('include', 'http://127.0.0.1:5500/view/enviar.html');
    });

    it('Deve testar cor do botão de adicionar ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/index.html');

        cy.get('#denuncia').should('have.css', 'background-color', 'rgb(112, 76, 175)');
    });

    it('Deve testar se tabela é exibida na tela', () => {
        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.get('#tabela').should('exist');
    });

    it('Deve testar se mapa é exibido na tela', () => {
        cy.visit('http://127.0.0.1:5500/view/mapas.html');

        cy.get('.map-container').should('exist');
    });


    it('Deve criar uma ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/enviar.html');

        cy.get('#map').trigger('click', 10, 2);

        cy.get('#titulo').type(titulo);
        cy.get('#tipo').type('Isso é uma ocorrência de teste');
        cy.get('#dataHora').type('2023-12-31T12:00');
        cy.wait(4000);

        cy.get('#botao').click();


        cy.on('window:alert', (mensagem) => {
            // Verifica se a mensagem do alerta é a esperada
            expect(mensagem).to.equal('Salvo com sucesso');
        });

        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', titulo).should('exist');
    });

    it('Deve listar uma ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', titulo).should('exist');
    });

    it('Deve deletar uma ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', titulo).should('exist');

        cy.contains('table tbody tr', titulo).as('linhaSelecionada');

        cy.get('@linhaSelecionada').find('td').eq(0).invoke('text').then((textoCapturado) => {
            idOcorrencia = textoCapturado;

            cy.log(`ID da linha capturado: ${idOcorrencia}`);

            cy.visit('http://127.0.0.1:5500/view/deletar.html');

            cy.get('#idDel').type(idOcorrencia);

            cy.get('#botao').click();

        });

        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', titulo).should('not.exist');

    });

    it('Deve atualizar uma ocorrência', () => {

        cy.visit('http://127.0.0.1:5500/view/enviar.html');

        cy.get('#map').trigger('click', 10, 2);

        cy.get('#titulo').type(titulo);
        cy.get('#tipo').type('Isso é uma ocorrência de teste');
        cy.get('#dataHora').type('2023-12-31T12:00');

        cy.get('#botao').click();

        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', titulo).should('exist');

        cy.contains('table tbody tr', titulo).as('linhaSelecionada');

        cy.get('@linhaSelecionada').find('td').eq(0).invoke('text').then((textoCapturado) => {
            idOcorrencia = textoCapturado;

            cy.log(`ID da linha capturado: ${idOcorrencia}`);

            cy.visit('http://127.0.0.1:5500/view/atualizar.html');

            cy.get('#map').trigger('click', 10, 2);

            cy.get('#titulo').type(atualizar);
            cy.get('#tipo').type('Isso é uma ocorrência de teste');
            cy.get('#dataHora').type('2023-12-31T12:00');
            cy.get('#idDel').type(idOcorrencia);
            cy.get('#botao').click();
        });


        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', atualizar).should('exist');

    });


    it('Deve deletar uma ocorrência', () => {
        cy.visit('http://127.0.0.1:5500/view/listar.html');

        cy.get('#botao').click();

        cy.contains('table', atualizar).should('exist');

        cy.contains('table tbody tr', atualizar).as('linhaSelecionada');

        cy.get('@linhaSelecionada').find('td').eq(0).invoke('text').then((textoCapturado) => {
            idOcorrencia = textoCapturado;

            cy.log(`ID da linha capturado: ${idOcorrencia}`);

            cy.visit('http://127.0.0.1:5500/view/deletar.html');

            cy.get('#idDel').type(idOcorrencia);

            cy.get('#botao').click();

        });

    });

})
