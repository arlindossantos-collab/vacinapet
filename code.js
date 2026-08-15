// Dados Iniciais Padrão (caso o localStorage esteja vazio)
const petPadrao = {
  nome: "Theo",
  especie: "Canina",
  raca: "Chihuahua",
  sexo: "Macho",
  microchip: "963003100111144",
  tutor: "Arlindo Santos"
};

const vacinasPadrao = [
  {
    id: "1",
    nome: "Canigen R",
    descricao: "Vacina contra Raiva canina.",
    dataAplicacao: "2024-07-26",
    dataProxima: "2025-07-26",
    local: "Clínica VetVida",
    medico: "Dra. Racema Paulino dos Santos (CRMV-PE 3260)"
  }
];

// Carregar Dados do LocalStorage
let petInfo = JSON.parse(localStorage.getItem('pet_info')) || petPadrao;
let vacinas = JSON.parse(localStorage.getItem('pet_vacinas')) || vacinasPadrao;

// Renderizar Informações na Tela
function renderizarPet() {
  document.getElementById('v-nome').textContent = petInfo.nome;
  document.getElementById('v-raca').textContent = `${petInfo.especie} (${petInfo.raca})`;
  document.getElementById('v-sexo').textContent = petInfo.sexo;
  document.getElementById('v-microchip').textContent = petInfo.microchip || '-';
  document.getElementById('v-tutor').textContent = petInfo.tutor || '-';

  // Preencher formulário de edição
  document.getElementById('f-nome').value = petInfo.nome;
  document.getElementById('f-especie').value = petInfo.especie;
  document.getElementById('f-raca').value = petInfo.raca;
  document.getElementById('f-sexo').value = petInfo.sexo;
  document.getElementById('f-microchip').value = petInfo.microchip;
  document.getElementById('f-tutor').value = petInfo.tutor;
}

function alternarEdicaoPet() {
  const view = document.getElementById('pet-view');
  const form = document.getElementById('pet-form');
  const btn = document.getElementById('btn-editar-pet');

  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    view.classList.add('hidden');
    btn.textContent = 'Cancelar';
  } else {
    form.classList.add('hidden');
    view.classList.remove('hidden');
    btn.textContent = 'Editar Dados';
  }
}

function salvarPet(e) {
  e.preventDefault();
  petInfo = {
    nome: document.getElementById('f-nome').value,
    especie: document.getElementById('f-especie').value,
    raca: document.getElementById('f-raca').value,
    sexo: document.getElementById('f-sexo').value,
    microchip: document.getElementById('f-microchip').value,
    tutor: document.getElementById('f-tutor').value
  };

  localStorage.setItem('pet_info', JSON.stringify(petInfo));
  renderizarPet();
  alternarEdicaoPet();
}

function renderizarVacinas() {
  const container = document.getElementById('lista-vacinas');
  container.innerHTML = '';

  if (vacinas.length === 0) {
    container.innerHTML = `<div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">Nenhuma vacina registrada.</div>`;
    return;
  }

  vacinas.forEach(v => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3";

    const dataApp = v.dataAplicacao ? new Date(v.dataAplicacao).toLocaleDateString('pt-BR') : '-';
    const dataProx = v.dataProxima ? new Date(v.dataProxima).toLocaleDateString('pt-BR') : 'Não agendado';

    card.innerHTML = `
      <div class="flex justify-between items-start border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-lg font-bold text-slate-800">✅ ${v.nome}</h3>
          ${v.descricao ? `<p class="text-xs text-slate-500 mt-0.5">${v.descricao}</p>` : ''}
        </div>
        <button onclick="deletarVacina('${v.id}')" class="text-slate-300 hover:text-red-500 transition text-sm">🗑️</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
        <div class="bg-slate-50 p-2.5 rounded-lg">
          <span class="block text-slate-400">Aplicação</span>
          <strong>${dataApp}</strong>
        </div>

        <div class="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
          <span class="block text-amber-600 font-medium">Próxima Dose / Revacinação</span>
          <strong class="text-amber-800">${dataProx}</strong>
        </div>

        ${v.local ? `<div><strong>Local:</strong> ${v.local}</div>` : ''}
        ${v.medico ? `<div><strong>Vet:</strong> ${v.medico}</div>` : ''}
      </div>

      ${v.dataProxima ? `
        <div class="pt-2 flex justify-end">
          <button onclick="baixarEventoAgenda('${v.nome}', '${v.dataProxima}', '${v.local}', '${v.medico}')" 
                  class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-medium">
            🔔 Adicionar Lembrete na Agenda (.ics)
          </button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

function abrirModalVacina() {
  document.getElementById('modal-vacina').classList.remove('hidden');
}

function fecharModalVacina() {
  document.getElementById('modal-vacina').classList.add('hidden');
}

function adicionarVacina(e) {
  e.preventDefault();

  const nova = {
    id: Date.now().toString(),
    nome: document.getElementById('vac-nome').value,
    descricao: document.getElementById('vac-desc').value,
    dataAplicacao: document.getElementById('vac-data-app').value,
    dataProxima: document.getElementById('vac-data-prox').value,
    local: document.getElementById('vac-local').value,
    medico: document.getElementById('vac-medico').value
  };

  vacinas.unshift(nova);
  localStorage.setItem('pet_vacinas', JSON.stringify(vacinas));
  
  renderizarVacinas();
  fecharModalVacina();
  e.target.reset();
}

function deletarVacina(id) {
  vacinas = vacinas.filter(v => v.id !== id);
  localStorage.setItem('pet_vacinas', JSON.stringify(vacinas));
  renderizarVacinas();
}

// Gerador de arquivo de calendário (.ics)
function baixarEventoAgenda(nome, dataProx, local, medico) {
  const dataFormatada = dataProx.replace(/-/g, '');
  const icsData = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Carteira Vacina Pet//PT
BEGIN:VEVENT
SUMMARY:Reforço Vacina ${nome} - ${petInfo.nome}
DESCRIPTION:Vacina: ${nome}\\nMédico: ${medico}\\nLocal: ${local}
DTSTART:${dataFormatada}T090000Z
DTEND:${dataFormatada}T100000Z
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `vacina_${nome.toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderizarPet();
  renderizarVacinas();
});