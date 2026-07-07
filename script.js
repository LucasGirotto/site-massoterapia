// =========================================================================
// CONFIGURAÇÃO DOS SERVIÇOS (SUPABASE E EMAILJS)
// =========================================================================
const SUPABASE_URL = "https://grrbgxwrivvevtgunodr.supabase.co";
const SUPABASE_KEY = "sb_publishable_6DcKUs-8akChNTaEKDuneQ_c9Cpl4yc";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Configurações do EmailJS (Você criará uma conta gratuita em emailjs.com)
// Eles fornecem esses IDs para disparar e-mails direto pelo JavaScript
const EMAILJS_PUBLIC_KEY = "MwJcg0cYSyBsgWPl9";
const EMAILJS_SERVICE_ID = "service_vd9pbys";
const EMAILJS_TEMPLATE_ID = "template_x7vcgjv";

// =========================================================================
// VARIÁVEIS DE CONTROLE DO FLUXO DO BOT
// =========================================================================
let etapaAtual = "nome"; // Controla o estado/etapa atual da conversa

// Objeto para acumular todas as respostas personalizadas da nova árvore de decisão
let dadosCliente = {
    nome: "",
    idade: "",
    objetivoPrincipal: "",
    procedimentoEscolhido: "",
    adicionalEscaldaPes: "Não selecionado", // Padrão se não passar pela opção 1
    observacaoLivre: "Não se aplica",       // Padrão se não escolher a opção 7
    dataHora: ""
};

// =========================================================================
// INICIALIZAÇÃO DO CHAT E RENDERIZADORES
// =========================================================================

function iniciarAnamnese() {
    const containerMensagens = document.getElementById("chat-messages");
    containerMensagens.innerHTML = "";
    etapaAtual = "nome";
    
    // Reseta o objeto para um novo agendamento limpo
    dadosCliente = { nome: "", idade: "", objetivoPrincipal: "", procedimentoEscolhido: "", adicionalEscaldaPes: "Não selecionado", observacaoLivre: "Não se aplica", dataHora: "" };

    mostrarMensagemBot("Olá! Seja muito bem-vindo(a). Para começarmos, qual é o seu nome completo?");
    liberarInputTexto("Digite seu nome completo...");
}

// Cria o balão do BOT no chat
function mostrarMensagemBot(texto) {
    const containerMensagens = document.getElementById("chat-messages");
    const divBot = document.createElement("div");
    divBot.className = "message bot";
    divBot.innerText = texto;
    containerMensagens.appendChild(divBot);
    containerMensagens.scrollTop = containerMensagens.scrollHeight;
}

// Cria o balão do USUÁRIO no chat
function mostrarMensagemUsuario(texto) {
    const containerMensagens = document.getElementById("chat-messages");
    const divUser = document.createElement("div");
    divUser.className = "message user";
    divUser.innerText = texto;
    containerMensagens.appendChild(divUser);
    containerMensagens.scrollTop = containerMensagens.scrollHeight;
}

// =========================================================================
// GERENCIADORES DE INTERFACE DA ÁREA DE ENTRADA (INPUT AREA)
// =========================================================================

// Configura o rodapé do chat para aceitar digitação de texto comum
function liberarInputTexto(placeholderTexto, maxCaracteres = 100) {
    const areaInput = document.querySelector(".chat-input-area");
    areaInput.innerHTML = `
        <div style="display: flex; gap: 8px;">
            <input type="text" id="user-input" maxlength="${maxCaracteres}" placeholder="${placeholderTexto}" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; outline: none;">
            <button class="btn-primary" style="border-radius: 8px; padding: 10px 15px;" onclick="capturarRespostaTexto()">Enviar</button>
        </div>
    `;

    document.getElementById("user-input").addEventListener("keypress", function(e) {
        if (e.key === 'Enter') capturarRespostaTexto();
    });
}

// Configura o rodapé do chat para exibir botões de clique em vez de teclado
function liberarBotoesOpcoes(listaOpcoes) {
    const areaInput = document.querySelector(".chat-input-area");
    areaInput.innerHTML = `<div style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; padding-right: 4px;"></div>`;
    const containerBotoes = areaInput.querySelector("div");

    listaOpcoes.forEach(opcao => {
        const botao = document.createElement("button");
        botao.className = "btn-primary";
        botao.style.borderRadius = "8px";
        botao.style.padding = "8px 12px";
        botao.style.textAlign = "left";
        botao.style.fontSize = "0.9rem";
        botao.innerText = opcao.texto;
        // Ao clicar no botão, dispara a função passando o valor e o texto legível
        botao.onclick = () => capturarRespostaBotao(opcao.valor, opcao.texto);
        containerBotoes.appendChild(botao);
    });
}

// =========================================================================
// MÁQUINA DE ESTADOS: PROCESSAMENTO DE TEXTOS E CLIQUES
// =========================================================================

// Processa as respostas digitadas (Nome, Idade, Outros)
function capturarRespostaTexto() {
    const inputCampo = document.getElementById("user-input");
    const resposta = inputCampo.value.trim();

    if (resposta === "") return;
    mostrarMensagemUsuario(resposta);

    if (etapaAtual === "nome") {
        dadosCliente.nome = resposta;
        etapaAtual = "idade";
        setTimeout(() => {
            mostrarMensagemBot(`Prazer em te conhecer, ${dadosCliente.nome}! Qual é a sua idade?`);
            liberarInputTexto("Digite sua idade (Apenas números)...");
        }, 600);
    } 
    else if (etapaAtual === "idade") {
        dadosCliente.idade = resposta;
        etapaAtual = "objetivo";
        setTimeout(() => {
            mostrarMensagemBot("O que você procura hoje com a massagem? Selecione uma das opções abaixo:");
            liberarBotoesOpcoes([
                { valor: 1, texto: "1 - Relaxar as tensões do dia a dia" },
                { valor: 2, texto: "2 - Melhorar a qualidade do sono" },
                { valor: 3, texto: "3 - Melhorar as dores do corpo" },
                { valor: 4, texto: "4 - Se sente inchada com retenção de líquidos" },
                { valor: 5, texto: "5 - Busca mais firmeza e elasticidade da pele" },
                { valor: 6, texto: "6 - Se sente ansioso(a), irritado(a) ou estressado(a)" },
                { valor: 7, texto: "7 - Outros" }
            ]);
        }, 600);
    }
    else if (etapaAtual === "opcao_7_digitacao") {
        dadosCliente.observacaoLivre = resposta;
        irParaSelecaoDataHora();
    }
}

// Processa as respostas clicadas via botões
function capturarRespostaBotao(valor, textoExibido) {
    mostrarMensagemUsuario(textoExibido);

    if (etapaAtual === "objetivo") {
        dadosCliente.objetivoPrincipal = textoExibido;
        
        // Desvios condicionais baseados na escolha do menu principal
        if (valor === 1) {
            etapaAtual = "sub_opcao_1";
            setTimeout(() => {
                mostrarMensagemBot("Escolha o procedimento ideal para relaxar suas tensões:");
                liberarBotoesOpcoes([
                    { valor: "relaxante", texto: "1.1 - Massagem relaxante" },
                    { valor: "pedras", texto: "1.2 - Massagem com pedras quentes" }
                ]);
            }, 600);
        } 
        else if (valor === 2) {
            dadosCliente.procedimentoEscolhido = "2.1 - Massagem relaxante + Escalda pés + Aromaterapia";
            irParaSelecaoDataHora();
        } 
        else if (valor === 3) {
            etapaAtual = "sub_opcao_3";
            setTimeout(() => {
                mostrarMensagemBot("Escolha o foco do tratamento para suas dores:");
                liberarBotoesOpcoes([
                    { valor: "pedras_dor", texto: "3.1 - Massagem com pedras quentes" },
                    { valor: "focada", texto: "3.2 - Massagem focada na região dolorida" }
                ]);
            }, 600);
        } 
        else if (valor === 4) {
            dadosCliente.procedimentoEscolhido = "4.1 - Drenagem linfática";
            irParaSelecaoDataHora();
        } 
        else if (valor === 5) {
            dadosCliente.procedimentoEscolhido = "5.1 - Massagem modeladora";
            irParaSelecaoDataHora();
        } 
        else if (valor === 6) {
            dadosCliente.procedimentoEscolhido = "6.1 - Massagem com pedras quentes + Aromaterapia";
            irParaSelecaoDataHora();
        } 
        else if (valor === 7) {
            etapaAtual = "opcao_7_digitacao";
            dadosCliente.procedimentoEscolhido = "7.1 - Procedimento personalizado personalizado a avaliar";
            setTimeout(() => {
                mostrarMensagemBot("Por favor, digite resumidamente o que você busca (Até 300 caracteres):");
                liberarInputTexto("Explique sua necessidade aqui...", 300);
            }, 600);
        }
    } 
    else if (etapaAtual === "sub_opcao_1") {
        dadosCliente.procedimentoEscolhido = textoExibido;
        etapaAtual = "adicional_1";
        setTimeout(() => {
            mostrarMensagemBot("Gostaria de adicionar um relaxante Escalda Pés ao seu procedimento?");
            liberarBotoesOpcoes([
                { valor: "sim", texto: "Sim, quero adicionar o Escalda pés" },
                { valor: "nao", texto: "Não, apenas a massagem principal" }
            ]);
        }, 600);
    } 
    else if (etapaAtual === "adicional_1") {
        dadosCliente.adicionalEscaldaPes = textoExibido;
        irParaSelecaoDataHora();
    } 
    else if (etapaAtual === "sub_opcao_3") {
        dadosCliente.procedimentoEscolhido = textoExibido;
        irParaSelecaoDataHora();
    }
}

// Modifica o estado e chama a interface do calendário
function irParaSelecaoDataHora() {
    etapaAtual = "data_hora";
    setTimeout(() => {
        exibirSelecaoDataHora();
    }, 600);
}

// =========================================================================
// AGENDAMENTO E VALIDAÇÕES DE DATA/HORA
// =========================================================================

function exibirSelecaoDataHora() {
    mostrarMensagemBot("Excelente escolha! Agora, selecione o melhor dia e horário útil (Segunda a Sexta):");

    const hoje = new Date().toISOString().split('T')[0];
    const areaInput = document.querySelector(".chat-input-area");
    areaInput.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <input type="date" id="data-agendamento" min="${hoje}" style="padding: 8px; border: 1px solid #ddd; border-radius: 8px; outline: none;">
            <select id="hora-agendamento" style="padding: 8px; border: 1px solid #ddd; border-radius: 8px; outline: none;">
                <option value="">Selecione o horário</option>
                <option value="08:00">08:00</option>
                <option value="09:30">09:30</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:30">15:30</option>
                <option value="17:00">17:00</option>
            </select>
            <button class="btn-primary" style="border-radius: 8px; padding: 10px;" onclick="validarEFinalizarAgendamento()">Confirmar Agendamento</button>
        </div>
    `;
}

async function validarEFinalizarAgendamento() {
    const dataEscolhida = document.getElementById("data-agendamento").value;
    const horaEscolhida = document.getElementById("hora-agendamento").value;

    if (!dataEscolhida || !horaEscolhida) {
        alert("Por favor, selecione o dia e o horário.");
        return;
    }

    const dataObjeto = new Date(dataEscolhida + "T00:00:00");
    const diaDaSemana = dataObjeto.getDay();

    if (diaDaSemana === 0 || diaDaSemana === 6) {
        alert("Atendemos apenas em dias úteis (Segunda a Sexta). Escolha outro dia, por favor.");
        return;
    }

    const dataFormatada = dataEscolhida.split("-").reverse().join("/");
    dadosCliente.dataHora = `${dataFormatada} às ${horaEscolhida}`;

    mostrarMensagemBot("Gravando dados da sua consulta com segurança...");

    // 1. GRAVAÇÃO NO SUPABASE
    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([
            { 
                nome: dadosCliente.nome, 
                idade: parseInt(dadosCliente.idade) || 0, 
                objetivo_principal: dadosCliente.objetivoPrincipal, 
                procedimento_escolhido: dadosCliente.procedimentoEscolhido, 
                escalda_pes: dadosCliente.adicionalEscaldaPes, 
                observacao_livre: dadosCliente.observacaoLivre, 
                data_hora: dadosCliente.dataHora 
            }
        ]);

    if (error) console.error("Erro supabaseClient:", error);

    // 2. DISPARO AUTOMÁTICO DE E-MAIL (Via EmailJS)
    enviarEmailNotificacao();

    // 3. ENVIAR PARA O WHATSAPP
    enviarWhatsApp();
}

// =========================================================================
// INTEGRAÇÕES DE SAÍDA (EMAIL E WHATSAPP)
// =========================================================================

function enviarEmailNotificacao() {
    // Inicializa o EmailJS com a chave pública
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Mapeia as variáveis que você configurou dentro do template do site do EmailJS
    const parametrosTemplate = {
        nome_cliente: dadosCliente.nome,
        idade_cliente: dadosCliente.idade,
        objetivo: dadosCliente.objetivoPrincipal,
        procedimento: dadosCliente.procedimentoEscolhido,
        adicional: dadosCliente.adicionalEscaldaPes,
        observacao: dadosCliente.observacaoLivre,
        data_hora: dadosCliente.dataHora
    };

    // Dispara o e-mail em segundo plano
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, parametrosTemplate)
        .then(() => console.log("Notificação por E-mail enviada com sucesso!"))
        .catch((erro) => console.error("Falha no envio do e-mail:", erro));
}

function enviarWhatsApp() {
    // Monta o relatório estruturado
    const textoWhatsApp = `*Novo Agendamento Automatizado*\n\n` +
        `👤 *Nome:* ${dadosCliente.nome}\n` +
        `🎂 *Idade:* ${dadosCliente.idade} anos\n` +
        `🎯 *Queixa/Objetivo:* ${dadosCliente.objetivoPrincipal}\n` +
        `💆 *Procedimento:* ${dadosCliente.procedimentoEscolhido}\n` +
        `🦶 *Adicional Escalda Pés:* ${dadosCliente.adicionalEscaldaPes}\n` +
        `📝 *Notas Extra:* ${dadosCliente.observacaoLivre}\n\n` +
        `📅 *Horário Selecionado:* ${dadosCliente.dataHora}`;

    const textoCodificado = encodeURIComponent(textoWhatsApp);
    const numeroWhatsAppDaEsposa = "5514996604099"; // Coloque o número dela aqui (DDI + DDD + Número)
    const urlLinkWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsAppDaEsposa}&text=${textoCodificado}`;

    mostrarMensagemBot("Tudo pronto! Você será redirecionado ao WhatsApp para enviar a mensagem final de confirmação.");
    
    setTimeout(() => {
        window.open(urlLinkWhatsApp, "_blank");
    }, 1500);
}