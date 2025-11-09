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

// === Função para calcular o trajeto ===
async function calcularTrajeto() {
  const origem = document.querySelectorAll('.left-panel input')[0].value.trim();
  const destino = document.querySelectorAll('.left-panel input')[1].value.trim();
  const duracaoBox = document.querySelector('.info-box p:nth-child(1) b');
  const distanciaBox = document.querySelector('.info-box p:nth-child(2) b');

  if (!origem || !destino) {
    alert("Informe o local de partida e destino!");
    return;
  }

  try {
    // 🔍 Obter coordenadas da origem
    const resOrigem = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origem)}`
    );
    const dataOrigem = await resOrigem.json();

    // 🔍 Obter coordenadas do destino
    const resDestino = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destino)}`
    );
    const dataDestino = await resDestino.json();

    if (!dataOrigem[0] || !dataDestino[0]) {
      alert("Não foi possível localizar um ou ambos os endereços.");
      return;
    }

    // 📍 Coordenadas encontradas
    const lat1 = parseFloat(dataOrigem[0].lat);
    const lon1 = parseFloat(dataOrigem[0].lon);
    const lat2 = parseFloat(dataDestino[0].lat);
    const lon2 = parseFloat(dataDestino[0].lon);

    // 📏 Calcular distância (em km)
    const R = 6371; // raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = R * c;

    // ⏱️ Estimativa de duração (a 40 km/h média)
    const tempoHoras = distanciaKm / 40;
    const minutos = Math.round(tempoHoras * 60);

    // 🧮 Mostrar resultados
    distanciaBox.textContent = `${distanciaKm.toFixed(2)} km`;
    duracaoBox.textContent = `${minutos} min`;
  } catch (error) {
    console.error(error);
    alert("Erro ao calcular trajeto. Tente novamente.");
  }
}

// === Função para favoritar linha ===
function favoritarLinha() {
  const origem = document.querySelector('#origem').value.trim();
  const destino = document.querySelector('#destino').value.trim();
  const lista = document.querySelector('.saved-lines ul');
  const emptyMsg = document.querySelector('.saved-lines .empty');
  if (!origem || !destino) {
    alert("Informe os locais antes de favoritar!");
    return;
  }

  // Remove a mensagem inicial se existir
  if (emptyMsg) emptyMsg.remove();

  // Cria um novo item
  const novaLinha = document.createElement('li');
  novaLinha.textContent = `${origem} → ${destino}`;
  lista.appendChild(novaLinha);
}

// === Adiciona eventos aos botões ===
document.addEventListener('DOMContentLoaded', () => {
  const btnCalcular = document.querySelector('#calcular');
  const btnFavoritar = document.querySelector('#favoritar');
  if (btnCalcular) btnCalcular.addEventListener('click', calcularTrajeto);
  if (btnFavoritar) btnFavoritar.addEventListener('click', favoritarLinha);
});
