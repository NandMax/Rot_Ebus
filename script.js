// Pega o campo de busca
const searchInput = document.getElementById('q');

// Pega todos os "help-item"
const helpItems = document.querySelectorAll('.help-item');

// Adiciona o clique em cada um
helpItems.forEach(item => {
  item.addEventListener('click', () => {
    searchInput.value = item.textContent; // coloca o texto no input
    searchInput.focus(); // move o cursor pra lá
  });
});
