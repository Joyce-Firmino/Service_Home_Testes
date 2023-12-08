document.getElementById('botaoListar').addEventListener('click', event => {
    event.preventDefault();

    let idCounter = 1;
    const listaPrestadores = [
        { id: idCounter++, nome: 'Fulano', email: 'fulano@gmail.com', telefone: '123456789', cnpj: '12345678901', horarioDisponibilidade: '09:00 - 18:00' },
        { id: idCounter++, nome: 'Ciclano', email: 'ciclano@gmail.com', telefone: '987654321', cnpj: '98765432109', horarioDisponibilidade: '10:00 - 19:00' },
        // Adicione mais prestadores conforme necessário
    ];

    const tabela = document.getElementById('tabelaCorpo');
    listaPrestadores.forEach(prestador => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${prestador.id}</td>
            <td>${prestador.nome}</td>
            <td>${prestador.email}</td>
            <td>${prestador.telefone}</td>
            <td>${prestador.cnpj}</td>
            <td>${prestador.horarioDisponibilidade}</td>
        `;
    });
});