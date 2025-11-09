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
