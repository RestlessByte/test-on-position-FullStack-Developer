const { createApp, ref, computed, watch, onMounted } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

/* ---------- Utils ---------- */
function slugify(text){
  const map = {
    а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y',
    к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f',
    х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya'
  };
  return String(text || '')
    .toLowerCase()
    .replace(/[а-яё]/g, s => map[s] || s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function fmtPrice(n){
  return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(n);
}
function setHead({title, description}){
  if(title) document.title = title;
  if(description){
    let m = document.querySelector('meta[name="description"]');
    if(!m){ m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
    m.setAttribute('content', description);
  }
}

/* ---------- Data (mock) ---------- */
const seedCategories = [
  { name:'Смартфоны', slug:'smartfony' },
  { name:'Ноутбуки', slug:'noutbuki' },
  { name:'Наушники', slug:'naushniki' },
  { name:'Гаджеты и умный дом', slug:'gadzhety' },
  { name:'Игры и развлечения', slug:'games' },
  { name:'Аксессуары', slug:'accessories' },
];
const seedProducts = [
  { name:'Смартфон Byte X1 8/256', category:'smartfony', price:29990, image:'https://placehold.co/560x420/png?text=Byte+X1', description:'Флагман с отличной камерой и батареей 5000 мА·ч.' },
  { name:'Смартфон Byte X1 Pro 12/512', category:'smartfony', price:44990, image:'https://placehold.co/560x420/png?text=Byte+X1+Pro', description:'AMOLED 120 Гц, быстрая зарядка 120 Вт.' },
  { name:'Ноутбук DevBook 15 R5/16/512', category:'noutbuki', price:78990, image:'https://placehold.co/560x420/png?text=DevBook+15', description:'Ryzen 5, 16 ГБ, идеален для TS/PostgreSQL.' },
  { name:'Игровой ноутбук DevBook 16 RTX', category:'noutbuki', price:119990, image:'https://placehold.co/560x420/png?text=DevBook+16+RTX', description:'RTX, охлаждение на стероидах, экран 165 Гц.' },
  { name:'TWS Наушники AirByte S', category:'naushniki', price:3990, image:'https://placehold.co/560x420/png?text=AirByte+S', description:'Лёгкие, автономность до 30 часов.' },
  { name:'Студийные наушники ProMonitor', category:'naushniki', price:12990, image:'https://placehold.co/560x420/png?text=ProMonitor', description:'Честный звук, закрытая конструкция.' },
  { name:'Колонка SmartCube', category:'gadzhety', price:5990, image:'https://placehold.co/560x420/png?text=SmartCube', description:'Умная колонка с ассистентом.' },
  { name:'Wi‑Fi лампа RGB', category:'gadzhety', price:1290, image:'https://placehold.co/560x420/png?text=Wi-Fi+Lamp', description:'Сотни сценариев, поддержка автоматизации.' },
  { name:'Геймпад BytePad 2', category:'games', price:3490, image:'https://placehold.co/560x420/png?text=BytePad+2', description:'Беспроводной, низкая задержка, вибро.' },
  { name:'VR‑шлем VRByte One', category:'games', price:35990, image:'https://placehold.co/560x420/png?text=VRByte+One', description:'Погружение в другой мир.' },
  { name:'Кабель USB‑C 100 Вт', category:'accessories', price:790, image:'https://placehold.co/560x420/png?text=USB-C+100W', description:'Плетёный, быстрая зарядка.' },
  { name:'Рюкзак DevPack 20L', category:'accessories', price:2990, image:'https://placehold.co/560x420/png?text=DevPack+20L', description:'Защита ноутбука, влагозащита IPX4.' },
].map(p => ({ ...p, slug: slugify(p.name) }));

/* ---------- Components ---------- */
const Home = {
  name:'Home',
  setup(){
    setHead({ title:'Каталог — ByteMarket', description:'Магазин техники: смартфоны, ноутбуки, аксессуары.' });
    return { categories: seedCategories, fmtPrice };
  },
  template: `
  <section class="hero p-4 p-md-5 mb-4">
    <div class="row align-items-center">
      <div class="col-md-7">
        <h1 class="mb-3">Техника для тех, кто пишет код</h1>
        <p class="lead mb-3">Умные цены, честные характеристики, любовь к TypeScript и PostgreSQL.</p>
        <router-link class="btn btn-neon" :to="{name:'category', params:{slug: 'smartfony'}}">Смотреть смартфоны</router-link>
      </div>
      <div class="col-md-5 text-center">
        <img class="img-fluid product-image" src="https://placehold.co/480x280/png?text=Welcome" alt="Hero">
      </div>
    </div>
  </section>

  <h5 class="mb-3">Категории</h5>
  <div class="d-flex flex-wrap">
    <router-link
      v-for="c in categories" :key="c.slug"
      :to="{name:'category', params:{slug:c.slug}}"
      class="catalog-link"
    ><i class="bi bi-folder2-open mr-2"></i>{{ c.name }}</router-link>
  </div>
  `
};

const CategoryPage = {
  name:'CategoryPage',
  props:['slug'],
  setup(props){
    const pageSize = 6;
    const page = ref( Number(new URLSearchParams(location.hash.split('?')[1] || '').get('page') || 1) );
    const products = computed(()=> seedProducts.filter(p => p.category === props.slug));
    const pages = computed(()=> Math.max(1, Math.ceil(products.value.length / pageSize)));
    const pageItems = computed(()=>{
      const start = (page.value - 1) * pageSize;
      return products.value.slice(start, start + pageSize);
    });
    watch(()=>props.slug, ()=>{
      page.value = 1;
      const cat = seedCategories.find(c=>c.slug===props.slug);
      setHead({
        title: `${cat ? cat.name : 'Категория'} — ByteMarket`,
        description: `Товары категории ${cat ? cat.name : ''} по выгодным ценам.`
      });
    }, { immediate:true });

    // sync query ?page=
    function go(p){
      p = Math.min(Math.max(1, p), pages.value);
      const url = new URL(location.href);
      url.hash = `#/c/${props.slug}?page=${p}`;
      history.replaceState(null, '', url);
      page.value = p;
      window.scrollTo({ top: 0, behavior:'smooth' });
    }

    const addToCart = (prod)=>{
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.push({ slug: prod.slug, qty: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart:update'));
      window.dispatchEvent(new CustomEvent('cart:added', { detail: prod.name }));
      $('#addedModal').modal('show');
    };

    return { fmtPrice, page, pages, pageItems, go, addToCart };
  },
  template: `
  <div>
    <h2 class="mb-4 text-wrap">{{ ($route.params.slug) }}</h2>
    <div class="row">
      <div v-for="p in pageItems" :key="p.slug" class="col-6 col-md-4 mb-4 d-flex">
        <div class="card w-100">
          <router-link :to="{name:'product', params:{slug:p.slug}}">
            <img class="card-img-top" :src="p.image" :alt="p.name" loading="lazy">
          </router-link>
          <div class="card-body d-flex flex-column">
            <h6 class="card-title flex-grow-1">{{ p.name }}</h6>
            <div class="d-flex align-items-center justify-content-between">
              <div class="price">{{ fmtPrice(p.price) }}</div>
              <button class="btn btn-neon btn-sm" @click="addToCart(p)"><i class="bi bi-bag-plus mr-1"></i> В корзину</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nav aria-label="Навигация страниц" class="d-flex justify-content-center">
      <ul class="pagination">
        <li class="page-item" :class="{disabled: page<=1}">
          <a class="page-link" href="#" @click.prevent="go(page-1)">Назад</a>
        </li>
        <li v-for="p in pages" :key="p" class="page-item" :class="{active: p===page}">
          <a class="page-link" href="#" @click.prevent="go(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="{disabled: page>=pages}">
          <a class="page-link" href="#" @click.prevent="go(page+1)">Вперёд</a>
        </li>
      </ul>
    </nav>
  </div>
  `
};

const ProductPage = {
  name:'ProductPage',
  props:['slug'],
  setup(props){
    const product = computed(()=> seedProducts.find(p => p.slug === props.slug));
    watch(product, (p)=>{
      if(p) setHead({ title: `${p.name} — ${fmtPrice(p.price)}`, description: p.description });
    }, { immediate:true });

    const addToCart = ()=>{
      const p = product.value; if(!p) return;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.push({ slug: p.slug, qty: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart:update'));
      window.dispatchEvent(new CustomEvent('cart:added', { detail: p.name }));
      $('#addedModal').modal('show');
    };

    return { product, fmtPrice, addToCart };
  },
  template: `
  <div v-if="product">
    <div class="row">
      <div class="col-md-5 mb-3">
        <img class="img-fluid product-image w-100" :src="product.image" :alt="product.name">
      </div>
      <div class="col-md-7">
        <h1 class="h3 mb-3">{{ product.name }}</h1>
        <div class="mb-3"><span class="badge badge-green p-2">{{ fmtPrice(product.price) }}</span></div>
        <p class="text-muted">{{ product.description }}</p>
        <div class="d-flex align-items-center">
          <button class="btn btn-neon mr-3" @click="addToCart"><i class="bi bi-bag-plus mr-1"></i> В корзину</button>
          <router-link :to="{ name:'category', params:{ slug: product.category } }" class="text-muted">← В категорию</router-link>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-5">
    <h5>Товар не найден</h5>
    <router-link to="/">На главную</router-link>
  </div>
  `
};

const CartPage = {
  name:'CartPage',
  setup(){
    const items = ref([]);
    const enrich = ()=>{
      const raw = JSON.parse(localStorage.getItem('cart') || '[]');
      items.value = raw.map(i=>{
        const prod = seedProducts.find(p=>p.slug===i.slug);
        return { ...i, product: prod, price: prod?.price || 0 };
      });
    };
    const total = computed(()=> items.value.reduce((s,i)=> s + i.qty * i.price, 0));
    const clear = ()=>{ localStorage.removeItem('cart'); enrich(); window.dispatchEvent(new Event('cart:update')); };
    onMounted(enrich);
    return { items, total, fmtPrice, clear };
  },
  template: `
  <div>
    <h2 class="mb-4">Корзина</h2>
    <div v-if="items.length">
      <div class="list-group mb-3">
        <div v-for="i in items" :key="i.slug" class="list-group-item d-flex align-items-center justify-content-between glass">
          <div class="d-flex align-items-center">
            <img :src="i.product?.image" width="64" class="mr-3 rounded">
            <div>
              <div class="font-weight-bold">{{ i.product?.name }}</div>
              <div class="text-muted small">{{ fmtPrice(i.price) }} × {{ i.qty }}</div>
            </div>
          </div>
          <div class="font-weight-bold">{{ fmtPrice(i.price * i.qty) }}</div>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-between">
        <div class="h5 mb-0">Итого: {{ fmtPrice(total) }}</div>
        <button class="btn btn-outline-light" @click="clear">Очистить</button>
      </div>
    </div>
    <div v-else class="text-muted">Корзина пуста.</div>
  </div>
  `
};

const NotFound = { template:`<div class="py-5 text-center"><h5>Страница не найдена</h5><router-link to="/">На главную</router-link></div>` };

/* ---------- Router ---------- */
const routes = [
  { path:'/', name:'home', component: Home },
  { path:'/c/:slug', name:'category', component: CategoryPage, props:true },
  { path:'/product/:slug', name:'product', component: ProductPage, props:true },
  { path:'/cart', name:'cart', component: CartPage },
  { path:'/:pathMatch(.*)*', component: NotFound },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

/* ---------- App ---------- */
const App = {
  setup(){
    const isCatalogOpen = ref(false);
    const isMobileOpen = ref(false);
    const cartCount = ref( (JSON.parse(localStorage.getItem('cart') || '[]')).length );
    const lastAddedName = ref('');

    const categories = seedCategories.map(c => ({ ...c, slug: c.slug || slugify(c.name) }));

    function toggleCatalog(){ isCatalogOpen.value = !isCatalogOpen.value; }
    function openCatalog(v){ isCatalogOpen.value = v; }
    function toggleMobile(){ isMobileOpen.value = !isMobileOpen.value; }
    function closeAllMobile(){ isMobileOpen.value=false; isCatalogOpen.value=false; }
    function addedInfo(){ /* noop, but makes header button consistent */ }

    window.addEventListener('cart:update', ()=> cartCount.value = (JSON.parse(localStorage.getItem('cart') || '[]')).length );
    window.addEventListener('cart:added', (e)=> { lastAddedName.value = e.detail; });

    router.afterEach((to)=>{
      // Set titles for categories/products handled in components; fallback:
      if(to.name==='home'){
        setHead({ title:'Каталог — ByteMarket', description:'ByteMarket — магазин техники.' });
      }
    });

    return { categories, isCatalogOpen, isMobileOpen, toggleCatalog, openCatalog, toggleMobile, closeAllMobile, addedInfo, cartCount, lastAddedName };
  }
};

createApp(App)
  .use(router)
  .mount('#app');
