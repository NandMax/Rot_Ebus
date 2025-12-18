// ---> Funções da Página index.html
// Insere as sugestões de pesquisa no campo de busca
const searchInput = document.getElementById('q');
const helpItems = document.querySelectorAll('.help-item');

helpItems.forEach(item => {
  item.addEventListener('click', () => {
    searchInput.value = item.textContent;
    searchInput.focus();
  });
});

// Deixa todo o bloco das rotas clicável
document.querySelectorAll('.route-btn').forEach(btn => {
  const link = btn.querySelector('.ver-btn');
  if (link) {
    btn.addEventListener('click', () => {
      window.location.href = link.getAttribute('href');
    });
  }
});

// Direciona os botões para as rotas disponíveis
function scrollAndBlink(id) {
  const elemento = document.getElementById(id);
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elemento.classList.remove('flash');
  void elemento.offsetWidth; 
  elemento.classList.add('flash');
}

// ---> Funções da Páginas simulador-de-rotas.html
// Inicializa o mapa centrado em Belém
const map = L.map('map').setView([-1.455, -48.490], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let rotaAtual = null;
let origemMarker = null;
let destinoMarker = null;

// Calcula a distância e o tempo das rotas
async function calcularTrajeto() {
  const inputs = document.querySelectorAll('.left-panel input');
  let origem = inputs[0].value.trim();
  let destino = inputs[1].value.trim();
  const duracaoBox = document.querySelector('.info-box p:nth-child(1) b');
  const distanciaBox = document.querySelector('.info-box p:nth-child(2) b');
  if (!origem || !destino) {
    alert("Informe o local de partida e destino!");
    return;
  }

  // Adiciona a região automaticamente
  origem = normalizarBusca(origem);
  destino = normalizarBusca(destino);

  try {

    const areaPA = "&countrycodes=br&viewbox=-52,-0.5,-47,-2.0&bounded=1";
    //const resOrigem = await fetch(`https://nominatim.openstreetmap.org/search?format=json${areaPA}&q=${encodeURIComponent(origem)}`);
    //const dataOrigem = await resOrigem.json();
    //const resDestino = await fetch(`https://nominatim.openstreetmap.org/search?format=json${areaPA}&q=${encodeURIComponent(destino)}`);
    //const dataDestino = await resDestino.json();

    const headers = {
      "User-Agent": "RotEbus/1.0 (contato@rotebus.com)"
    };

    const resOrigem = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json${areaPA}&q=${encodeURIComponent(origem)}`,
      { headers }
    );
    const dataOrigem = await resOrigem.json();

    const resDestino = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json${areaPA}&q=${encodeURIComponent(destino)}`,
      { headers }
    );
    const dataDestino = await resDestino.json();

    if (!dataOrigem[0] || !dataDestino[0]) {
      alert("Não foi possível localizar um ou ambos os endereços.");
      return;
    }

    const lat1 = parseFloat(dataOrigem[0].lat);
    const lon1 = parseFloat(dataOrigem[0].lon);
    const lat2 = parseFloat(dataDestino[0].lat);
    const lon2 = parseFloat(dataDestino[0].lon);

    // Remove a rota anterior, se existir
    if (rotaAtual) map.removeLayer(rotaAtual);
    if (origemMarker) map.removeLayer(origemMarker);
    if (destinoMarker) map.removeLayer(destinoMarker);

    // Adiciona marcadores
    origemMarker = L.marker([lat1, lon1]).addTo(map).bindPopup(`Origem: ${origem}`).openPopup();
    destinoMarker = L.marker([lat2, lon2]).addTo(map).bindPopup(`Destino: ${destino}`);

    // Desenha uma linha azul entre os pontos
    rotaAtual = L.polyline([[lat1, lon1], [lat2, lon2]], {
      color: 'blue',
      weight: 5,
      opacity: 0.8
    }).addTo(map);

    // Ajusta a visualização
    map.fitBounds(rotaAtual.getBounds(), { padding: [50, 50] });

    // Distância em linha reta (Haversine)
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distanciaKm = R * c;

    // Calcula a distância e o tempo esperado
    let multiplicador;
    if (distanciaKm < 1.5) {
      multiplicador = 2.5 + Math.random() * 1.5;
    } else if (distanciaKm < 6) {
      multiplicador = 1.6 + Math.random() * 1.2;
    } else {
      multiplicador = 1.15 + Math.random() * 0.45;
    }
    distanciaKm = distanciaKm * multiplicador;

    let velocidadeMedia;
    if (distanciaKm < 2.5) {
      velocidadeMedia = 9 + Math.random() * 4;
    } else if (distanciaKm < 8) {
      velocidadeMedia = 12 + Math.random() * 8;
    } else {
      velocidadeMedia = 20 + Math.random() * 15;
    }

    const paradasPorKm = 0.7;
    let paradasEstimadas = Math.round(paradasPorKm * distanciaKm);
    paradasEstimadas = Math.min(paradasEstimadas, 10);
    const tempoPorParadaMin = 0.9 + Math.random() * 1.4;
    const tempoParadas = paradasEstimadas * tempoPorParadaMin + 2;

    // calcula o tempo total e exibe
    const tempoHoras = distanciaKm / velocidadeMedia;
    const minutos = Math.round(tempoHoras * 60 + tempoParadas);
    distanciaBox.textContent = `${distanciaKm.toFixed(2)} km`;
    duracaoBox.textContent = `${minutos} min`;

  } catch (error) {
    console.error(error);
    alert("Erro ao calcular trajeto. Tente novamente.");
  }
}

// Função auxiliar para ajustar a busca conforme a região inserida
function normalizarBusca(local) {
  const texto = local.toLowerCase();
  if (texto.includes('belém') || texto.includes('ananindeua') || texto.includes('pa')) {
    return local;
  }

  // palavras que costumam indicar que é Ananindeua
  const palavrasAnanindeua = ['cidade nova', 'maguari', 'icoaraci', 'aguas lindas', 'coqueiro'];

  for (const termo of palavrasAnanindeua) {
    if (texto.includes(termo)) {
      return `${local}, Ananindeua, PA`;
    }
  }

  // padrão: Belém
  return `${local}, Belém, PA`;
}

// Função para favoritar linha
function favoritarLinha() {
  const origem = document.querySelector('#origem').value.trim();
  const destino = document.querySelector('#destino').value.trim();
  const lista = document.querySelector('.saved-lines ul');
  const emptyMsg = document.querySelector('.saved-lines .empty');
  if (!origem || !destino) {
    alert("Informe os locais antes de favoritar!");
    return;
  }

  if (emptyMsg) emptyMsg.remove();
  const novaLinha = document.createElement('li');
  novaLinha.textContent = `${origem} → ${destino}`;
  lista.appendChild(novaLinha);
}

// Adiciona eventos aos botões
document.addEventListener('DOMContentLoaded', () => {
  const btnCalcular = document.querySelector('#calcular');
  const btnFavoritar = document.querySelector('#favoritar');
  if (btnCalcular) btnCalcular.addEventListener('click', calcularTrajeto);
  if (btnFavoritar) btnFavoritar.addEventListener('click', favoritarLinha);
});

// Banco de dados das paradas e linhas (pág: 3)
const locaisInfo = {
  "Osvaldo Cruz": {
    linhas: [
      "🚌 Linha 916 - Águas Lindas (Pte. Vargas)",
      "🚌 Linha 917 - Águas Lindas (Ver-o-Peso)"
    ],
    paradas: [
      "🚏 Osvaldo Cruz com Quadra 5<br><small>916: Águas Lindas / Pte. Vargas</small>",
      "🚏 Osvaldo Cruz com São Mateus<br><small>921: Unama BR-316 / Pte. Vargas</small>"
    ]
  },
  "Unama Br": {
    linhas: [
      "🚌 Linha 921 - Águas Lindas (Pte. Vargas)",
      "🚌 Linha 920 - Águas Lindas (Ver-o-Peso)"
    ],
    paradas: [
      "🚏 Unama BR-316<br><small>Terminal Águas Lindas</small>",
      "🚏 BR-316 com WE-72<br><small>Águas Lindas / Pte. Vargas</small>"
    ]
  },
  "José Malcher com Castelo": {
    linhas: [
      "🚌 Linha 916 - Águas Lindas (Pte. Vargas)",
      "🚌 Linha 919 - Águas Lindas (Ver-o-Peso)"
    ],
    paradas: [
      "🚏 José Malcher com Quintino<br><small>916: Águas Lindas / Pte. Vargas</small>",
      "🚏 José Malcher com 14 de Março<br><small>919: Águas Lindas / Ver-o-Peso</small>"
    ]
  },
  "IFPA | Almirante com Estrella": {
    linhas: [
      "🚌 Linha 921 - Águas Lindas (Pte. Vargas)"
    ],
    paradas: [
      "🚏 IFPA<br><small>Almirante Barroso / Estrella</small>",
      "🚏 Almirante Barroso com Magalhães Barata<br><small>Águas Lindas / Pte. Vargas</small>"
    ]
  }
};

// Função para atualizar as caixas do lado direito
function atualizarInfo(local) {
  const linhasBox = document.getElementById("linhas-box");
  const paradasBox = document.getElementById("paradas-box");

  if (locaisInfo[local]) {
    const { linhas, paradas } = locaisInfo[local];
    linhasBox.innerHTML = `
      <h5 class="titulo-h5">Linhas Disponíveis</h5>
      ${linhas.map(l => `<p>${l}</p>`).join("")}
    `;
    paradasBox.innerHTML = `
      <h5 class="titulo-h5">Paradas Próximas</h5>
      ${paradas.map(p => `<p>${p}</p>`).join("")}
    `;
  } else {
    linhasBox.innerHTML = `<h5 class="titulo-h5">Linhas Disponíveis</h5><p>🚌 Informe um local</p>`;
    paradasBox.innerHTML = `<h5 class="titulo-h5">Paradas Próximas</h5><p>🚏 Informe um local</p>`;
  }
}

// Eventos de clique
document.querySelectorAll(".help-item").forEach(item => {
  item.addEventListener("click", () => {
    const local = item.dataset.local;
    document.getElementById("q").value = local;
    atualizarInfo(local);
  });
});
