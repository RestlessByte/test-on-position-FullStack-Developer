const products = [
  { name: 'Смартфон Byte X1', category: 'Смартфоны', price: 29990, image: 'https://placehold.co/200x150?text=Byte+X1' },
  { name: 'Ноутбук DevBook 15', category: 'Ноутбуки', price: 78990, image: 'https://placehold.co/200x150?text=DevBook+15' },
  { name: 'Наушники AirByte S', category: 'Наушники', price: 3990, image: 'https://placehold.co/200x150?text=AirByte+S' },
  { name: 'Колонка SmartCube', category: 'Гаджеты', price: 5990, image: 'https://placehold.co/200x150?text=SmartCube' },
  { name: 'Геймпад BytePad 2', category: 'Игры', price: 3490, image: 'https://placehold.co/200x150?text=BytePad+2' }
];

const catalogEl = document.getElementById('catalog');
const cartCountEl = document.getElementById('cart-count');
const categoriesEl = document.getElementById('categories');

const categories = ['Все', ...new Set(products.map(p => p.category))];
let cartCount = 0;

function fmtPrice(n) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(n);
}

function renderCategories() {
  categoriesEl.innerHTML = '';
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.dataset.category = c;
    btn.addEventListener('click', () => renderCatalog(c));
    categoriesEl.appendChild(btn);
  });
}

function renderCatalog(filter = 'Все') {
  catalogEl.innerHTML = '';
  products
    .filter(p => filter === 'Все' || p.category === filter)
    .forEach(p => {
      const card = document.createElement('div');
      card.className = 'product';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">${fmtPrice(p.price)}</p>
        <button class="buy">Купить</button>
      `;
      card.querySelector('.buy').addEventListener('click', () => {
        cartCount++;
        cartCountEl.textContent = cartCount;
      });
      catalogEl.appendChild(card);
    });
}

renderCategories();
renderCatalog();
