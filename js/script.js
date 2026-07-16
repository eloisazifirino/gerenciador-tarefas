const CHAVE_TAREFAS = "gerenciador-tarefas";

//ATRIBUINDO ELEMENTOS A VARIÁVEIS
const formTarefa = document.querySelector("#form-tarefa");
const campoTarefa = document.querySelector("#tarefa");
const campoResponsavel = document.querySelector("#responsavel");
const campoDescricao = document.querySelector("#descricao");
const campoData = document.querySelector("#data-tarefa");

//OBJETO DE LISTAS TAREFAS DA SECTION .quadro-tarefas
const listasPorStatus = {
    aberta: document.querySelector("#lista-abertas"),
    andamento: document.querySelector("#lista-andamento"),
    finalizada: document.querySelector("#lista-finalizadas")
};

//OBJETO DO CONTABILIZADOR DE TAREFAS POR STATUS NA SECTION .contadores prioridades
const contadoresStatus = {
    aberta: document.querySelector("#qtd-abertas"),
    andamento: document.querySelector("#qtd-andamento"),
    finalizada: document.querySelector("#qtd-finalizada")
};
//OBJETO DO CONTABILIZADOR DE TAREFAS POR PRIORIDADE NA SECTION .contadores prioridades
const contadoresPrioridade = {
    baixa: document.querySelector("#qtd-baixa"),
    media: document.querySelector("#qtd-media"),
    alta: document.querySelector("#qtd-alta")
};

//TRATAMENTO DE ERROS
let tarefas = carregarTarefas();

function carregarTarefas() {
    try {                     //transforma a string do localStorage de volta em um json
        const tarefasSalvas = JSON.parse(localStorage.getItem(CHAVE_TAREFAS));

        return Array.isArray(tarefasSalvas) ? tarefasSalvas : [];
    } catch (erro) {
        console.error("Não foi possível carregar as tarefas salvas.", erro);
        return [];
    }
}

function salvarTarefas() {
    localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}

function criarId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function criarElemento(tag, texto, classe) {
    const elemento = document.createElement(tag);

    if (texto) elemento.textContent = texto;
    if (classe) elemento.className = classe;

    return elemento;
}

function criarCardTarefa(tarefa) {
    const card = criarElemento("article", "", `card-tarefa prioridade-${tarefa.prioridade}`);
    card.dataset.id = tarefa.id;

    const titulo = criarElemento("h3", tarefa.nome);
    const responsavel = criarElemento("p", `Responsável: ${tarefa.responsavel}`);
    const descricao = criarElemento("p", tarefa.descricao);
    const prioridade = criarElemento(
        "p",
        `Prioridade: ${tarefa.prioridade === "media" ? "Média" : tarefa.prioridade}`,
        "tarefa-prioridade"
    );
    const data = criarElemento("p", `Data: ${formatarData(tarefa.data)}`);

    const acoes = criarElemento("div", "", "acoes-tarefa");
    const seletorStatus = document.createElement("select");
    seletorStatus.className = "status-tarefa";
    seletorStatus.setAttribute("aria-label", `Status da tarefa ${tarefa.nome}`);

    const opcoesStatus = {
        aberta: "Aberto",
        andamento: "Em andamento",
        finalizada: "Finalizada"
    };

    Object.entries(opcoesStatus).forEach(([valor, texto]) => {
        const opcao = new Option(texto, valor, false, tarefa.status === valor);
        seletorStatus.add(opcao);
    });

    seletorStatus.addEventListener("change", (evento) => {
        alterarStatus(tarefa.id, evento.target.value);
    });

    const botaoExcluir = criarElemento("button", "Excluir", "btn-excluir");
    botaoExcluir.type = "button";
    botaoExcluir.setAttribute("aria-label", `Excluir a tarefa ${tarefa.nome}`);
    botaoExcluir.addEventListener("click", () => excluirTarefa(tarefa.id));

    acoes.append(seletorStatus, botaoExcluir);
    card.append(titulo, responsavel, descricao, prioridade, data, acoes);

    return card;
}

function atualizarContadores() {
    Object.keys(contadoresStatus).forEach((status) => {
        contadoresStatus[status].textContent = tarefas.filter(
            (tarefa) => tarefa.status === status
        ).length;
    });

    Object.keys(contadoresPrioridade).forEach((prioridade) => {
        contadoresPrioridade[prioridade].textContent = tarefas.filter(
            (tarefa) => tarefa.prioridade === prioridade
        ).length;
    });
}

function renderizarTarefas() {
    Object.values(listasPorStatus).forEach((lista) => lista.replaceChildren());

    tarefas.forEach((tarefa) => {
        const lista = listasPorStatus[tarefa.status];

        if (lista) lista.append(criarCardTarefa(tarefa));
    });

    atualizarContadores();
}

function adicionarTarefa(evento) {
    evento.preventDefault();

    const prioridadeSelecionada = formTarefa.querySelector(
        'input[name="prioridade"]:checked'
    );

    if (!prioridadeSelecionada || !formTarefa.reportValidity()) return;

    const novaTarefa = {
        id: criarId(),
        nome: campoTarefa.value.trim(),
        responsavel: campoResponsavel.value.trim(),
        descricao: campoDescricao.value.trim(),
        prioridade: prioridadeSelecionada.value,
        data: campoData.value,
        status: "aberta"
    };

    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();

    formTarefa.reset();
    campoTarefa.focus();
}

function alterarStatus(id, novoStatus) {
    const tarefa = tarefas.find((item) => item.id === id);

    if (!tarefa || !listasPorStatus[novoStatus]) return;

    tarefa.status = novoStatus;
    salvarTarefas();
    renderizarTarefas();
}

function excluirTarefa(id) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
}

formTarefa.addEventListener("submit", adicionarTarefa);
renderizarTarefas();
