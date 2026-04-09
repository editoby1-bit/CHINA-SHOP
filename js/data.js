(function () {
  const STORAGE_KEYS = {
    shops: 'cs_shops',
    products: 'cs_products',
    cart: 'cs_cart',
    orders: 'cs_orders',
    requests: 'cs_requests',
    seeded: 'cs_seeded_v5'
  };

  // Clean all old seed keys
  ['chinaShopSeeded','chinaShopSeeded_v2','chinaShopSeeded_v3','chinaShopSeeded_v4',
   'chinaShopShops','chinaShopProducts','chinaShopCart','chinaShopOrders','chinaShopRequests']
    .forEach(k => { if (!localStorage.getItem('cs_seeded_v5')) localStorage.removeItem(k); });

  // Using placehold.co for reliable, labeled product images
  const IMG = {
    earbuds:    'https://placehold.co/800x600/1a1a2e/ffffff?text=Earbuds+Pro',
    lamp:       'https://placehold.co/800x600/2d2d44/ffffff?text=Smart+Desk+Lamp',
    charger:    'https://placehold.co/800x600/1e3a5f/ffffff?text=USB-C+Hub',
    projector:  'https://placehold.co/800x600/0d0d0d/ffffff?text=Mini+Projector',
    powerbank:  'https://placehold.co/800x600/1a1a2e/ffffff?text=Power+Bank',
    camera:     'https://placehold.co/800x600/1a1a1a/ffffff?text=4K+Camera',
    keyboard:   'https://placehold.co/800x600/2c2c3e/ffffff?text=Foldable+Keyboard',
    smartwatch: 'https://placehold.co/800x600/111827/ffffff?text=Smartwatch',
    bonnet:     'https://placehold.co/800x600/6b2737/ffffff?text=Silk+Bonnet',
    waist:      'https://placehold.co/800x600/1a1a1a/ffffff?text=Waist+Trainer',
    brush:      'https://placehold.co/800x600/4a1942/ffffff?text=Facial+Brush',
    bag:        'https://placehold.co/800x600/2c1810/ffffff?text=Fashion+Bag',
    straighten: 'https://placehold.co/800x600/2d1b2e/ffffff?text=Hair+Straightener',
    nails:      'https://placehold.co/800x600/5c1a3a/ffffff?text=Press-On+Nails',
    blender:    'https://placehold.co/800x600/1a3a2a/ffffff?text=Portable+Blender',
    cookware:   'https://placehold.co/800x600/1a1a1a/ffffff?text=Cookware+Set',
    vacuum:     'https://placehold.co/800x600/1a2a3a/ffffff?text=Robot+Vacuum',
    kettle:     'https://placehold.co/800x600/1a1a1a/ffffff?text=Electric+Kettle',
    basket:     'https://placehold.co/800x600/2a1a0a/ffffff?text=Storage+Basket',
    airfryer:   'https://placehold.co/800x600/1a1a1a/ffffff?text=Air+Fryer+XL',
    bedlamp:    'https://placehold.co/800x600/1a1a2e/ffffff?text=Bedside+Lamp',
    // Shop banners
    techBanner:   'https://placehold.co/1200x400/0d1117/ffffff?text=ShenzhenTech+Store',
    beautyBanner: 'https://placehold.co/1200x400/1a0a14/ffffff?text=BeautyHaus+China',
    homeBanner:   'https://placehold.co/1200x400/0a1a10/ffffff?text=HomePlus+Guangzhou',
    heroBg:       'https://placehold.co/900x700/111827/ffffff?text=China+Shop',
  };

  const shopSeeds = [
    {
      id: 'shenzhentech', name: 'ShenzhenTech Store',
      categories: ['Electronics', 'Gadgets'], rating: 4.7,
      about: 'Reliable devices and smart accessories for everyday performance and value.',
      banner: IMG.techBanner, commissionRate: 12
    },
    {
      id: 'beautyhaus', name: 'BeautyHaus China',
      categories: ['Beauty', 'Fashion'], rating: 4.5,
      about: 'Beauty, wellness, and fashion essentials with premium presentation.',
      banner: IMG.beautyBanner, commissionRate: 12
    },
    {
      id: 'homeplus', name: 'HomePlus Guangzhou',
      categories: ['Kitchen', 'Home & Living'], rating: 4.8,
      about: 'Practical home upgrades and kitchen tools designed for real life.',
      banner: IMG.homeBanner, commissionRate: 12
    }
  ];

  const productSeeds = [
    { id:'p1',  shopId:'shenzhentech', category:'Electronics',   name:'Wireless Bluetooth Earbuds Pro',      price:45000,  rating:4.7, image:IMG.earbuds,    description:'Compact wireless earbuds with crisp sound, charging case, and touch controls.', specs:{Connectivity:'Bluetooth 5.3',Battery:'24hrs with case',Charging:'USB-C',Color:'Black'} },
    { id:'p2',  shopId:'shenzhentech', category:'Gadgets',        name:'Smart LED Desk Lamp',                 price:28000,  rating:4.6, image:IMG.lamp,       description:'Dimmable desk lamp with touch panel, USB charging port, and adjustable arm.', specs:{Lighting:'3 tone modes',Power:'12W',Charging:'USB output',Material:'ABS + aluminum'} },
    { id:'p3',  shopId:'shenzhentech', category:'Electronics',   name:'USB-C Fast Charger Hub',              price:22000,  rating:4.4, image:IMG.charger,    description:'Multi-port fast charging hub for phones, tablets, and accessories.', specs:{Ports:'4',Output:'65W max',Plug:'Universal',Safety:'Overheat protection'} },
    { id:'p4',  shopId:'shenzhentech', category:'Electronics',   name:'Mini Projector Home Cinema',          price:175000, rating:4.8, image:IMG.projector,  description:'Portable projector for movies, presentations, and streaming on the go.', specs:{Resolution:'1080p supported',Brightness:'320 ANSI lumens',Input:'HDMI/USB',Weight:'1.2kg'} },
    { id:'p5',  shopId:'shenzhentech', category:'Gadgets',        name:'Magnetic Wireless Power Bank',        price:32000,  rating:4.5, image:IMG.powerbank,  description:'Slim magnetic power bank with fast wireless charging.', specs:{Capacity:'10000mAh',Charging:'Wireless + USB-C',Finish:'Matte',Weight:'220g'} },
    { id:'p6',  shopId:'shenzhentech', category:'Electronics',   name:'4K Action Camera Kit',                price:118000, rating:4.6, image:IMG.camera,     description:'High-resolution action camera with waterproof housing and accessories.', specs:{Video:'4K/60fps',Screen:'2-inch',Waterproof:'30m case',Battery:'2 included'} },
    { id:'p7',  shopId:'shenzhentech', category:'Gadgets',        name:'Portable Foldable Keyboard',          price:39000,  rating:4.3, image:IMG.keyboard,   description:'Compact foldable Bluetooth keyboard for mobile work and travel.', specs:{Layout:'Full QWERTY',Connectivity:'Bluetooth 5.0',Battery:'Rechargeable',Size:'Pocket-size'} },
    { id:'p8',  shopId:'shenzhentech', category:'Electronics',   name:'Smartwatch Fitness Edition',          price:68000,  rating:4.5, image:IMG.smartwatch, description:'Fitness smartwatch with heart-rate tracking, notifications, and long battery life.', specs:{Display:'AMOLED',Battery:'10 days',Water:'IP68',Features:'Health tracking'} },
    { id:'p9',  shopId:'beautyhaus',   category:'Beauty',         name:'Silk Hair Bonnet Premium',            price:9500,   rating:4.7, image:IMG.bonnet,     description:'Soft premium bonnet designed for hair protection and comfortable sleep.', specs:{Material:'Silk blend',Size:'Adjustable',Use:'Night care',Layers:'Double'} },
    { id:'p10', shopId:'beautyhaus',   category:'Fashion',        name:'Waist Trainer Sculpt Fit',            price:18500,  rating:4.4, image:IMG.waist,      description:'Structured waist trainer with breathable fabric and adjustable compression.', specs:{Material:'Latex blend',Closure:'Hook & zip',Sizes:'S–XXL',Color:'Black'} },
    { id:'p11', shopId:'beautyhaus',   category:'Beauty',         name:'LED Facial Cleansing Brush',          price:34000,  rating:4.5, image:IMG.brush,      description:'Water-resistant facial cleansing tool with gentle vibration modes.', specs:{Modes:'5',Charging:'USB',Water:'IPX6',Material:'Medical silicone'} },
    { id:'p12', shopId:'beautyhaus',   category:'Fashion',        name:'Minimalist Crossbody Fashion Bag',    price:25500,  rating:4.6, image:IMG.bag,        description:'Elegant compact bag with structured finish for everyday styling.', specs:{Material:'PU leather',Strap:'Adjustable',Closure:'Zipper',Pockets:'3'} },
    { id:'p13', shopId:'beautyhaus',   category:'Beauty',         name:'Rechargeable Hair Straightener Brush',price:42000,  rating:4.3, image:IMG.straighten, description:'Cordless straightening brush for quick touch-ups and travel.', specs:{Heat:'3 levels',Charging:'USB-C','Run Time':'35 min',Safety:'Auto shutoff'} },
    { id:'p14', shopId:'beautyhaus',   category:'Fashion',        name:'Luxury Press-On Nail Set',            price:8000,   rating:4.2, image:IMG.nails,      description:'Salon-style reusable nail set with adhesive tabs and glossy finish.', specs:{Pieces:'24',Finish:'Glossy',Reusable:'Yes',Sizes:'Mixed'} },
    { id:'p15', shopId:'homeplus',     category:'Kitchen',        name:'Portable Blender Smoothie Cup',       price:29000,  rating:4.5, image:IMG.blender,    description:'Personal blender cup for juices, shakes, and quick blends.', specs:{Capacity:'450ml',Charging:'USB-C',Blades:'6 stainless steel',Use:'Portable'} },
    { id:'p16', shopId:'homeplus',     category:'Kitchen',        name:'Stainless Steel Cookware Set',        price:126000, rating:4.8, image:IMG.cookware,   description:'Durable 10-piece cookware set with matching lids and polished finish.', specs:{Pieces:'10',Material:'Stainless steel',Stove:'Gas + electric',Finish:'Mirror polish'} },
    { id:'p17', shopId:'homeplus',     category:'Home & Living',  name:'Robot Vacuum Cleaner Smart Sweep',    price:280000, rating:4.9, image:IMG.vacuum,     description:'Smart robot vacuum with mapping, scheduled cleaning, and auto-navigation.', specs:{'Run Time':'120 min',Navigation:'Smart mapping','Dust Bin':'600ml',Control:'App + button'} },
    { id:'p18', shopId:'homeplus',     category:'Kitchen',        name:'Electric Kettle Quick Boil',          price:21000,  rating:4.4, image:IMG.kettle,     description:'Fast boiling kettle with automatic shut-off and sleek countertop design.', specs:{Capacity:'1.8L',Power:'1500W',Safety:'Auto shutoff',Body:'Stainless steel'} },
    { id:'p19', shopId:'homeplus',     category:'Home & Living',  name:'Foldable Laundry Storage Basket',     price:12000,  rating:4.3, image:IMG.basket,     description:'Space-saving foldable basket for laundry and home organization.', specs:{Material:'Fabric + frame',Capacity:'Large',Feature:'Foldable',Handles:'Reinforced'} },
    { id:'p20', shopId:'homeplus',     category:'Kitchen',        name:'Digital Air Fryer XL',                price:98000,  rating:4.7, image:IMG.airfryer,   description:'Large-capacity air fryer with digital presets for healthier meals.', specs:{Capacity:'6L',Controls:'Digital touch',Presets:'8',Power:'1700W'} },
    { id:'p21', shopId:'homeplus',     category:'Home & Living',  name:'Minimalist Bedside Storage Lamp',     price:26000,  rating:4.5, image:IMG.bedlamp,    description:'Bedside lamp with storage tray base for modern living spaces.', specs:{Material:'ABS + wood finish',Light:'Warm LED',Feature:'Tray base',Power:'AC'} }
  ];

  function read(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function seedData() {
    if (localStorage.getItem(STORAGE_KEYS.seeded)) return;
    const shops = shopSeeds.map(s => ({
      ...s,
      initials: s.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(),
      productCount: productSeeds.filter(p => p.shopId === s.id).length
    }));
    write(STORAGE_KEYS.shops, shops);
    write(STORAGE_KEYS.products, productSeeds);
    write(STORAGE_KEYS.cart, []);
    write(STORAGE_KEYS.requests, []);
    write(STORAGE_KEYS.orders, [
      {
        id:'o1001', buyerName:'Ada Okon', phone:'08030001111',
        address:'12 Oron Road, Uyo', city:'Uyo', state:'Akwa Ibom',
        paymentMethod:'Bank Transfer',
        items:[
          {productId:'p1',quantity:1,price:45000,shopId:'shenzhentech',name:'Wireless Bluetooth Earbuds Pro'},
          {productId:'p9',quantity:2,price:9500,shopId:'beautyhaus',name:'Silk Hair Bonnet Premium'}
        ],
        subtotal:64000, deliveryFee:2500, total:66500,
        status:'Processing', createdAt: new Date().toISOString()
      },
      {
        id:'o1002', buyerName:'Tunde Bello', phone:'08045552222',
        address:'8 Admiralty Way, Lekki', city:'Lagos', state:'Lagos',
        paymentMethod:'Card',
        items:[{productId:'p16',quantity:1,price:126000,shopId:'homeplus',name:'Stainless Steel Cookware Set'}],
        subtotal:126000, deliveryFee:2500, total:128500,
        status:'New', createdAt: new Date().toISOString()
      }
    ]);
    localStorage.setItem(STORAGE_KEYS.seeded, 'true');
  }

  function getShops()    { return read(STORAGE_KEYS.shops, []); }
  function setShops(v)   { write(STORAGE_KEYS.shops, v); }
  function getProducts() { return read(STORAGE_KEYS.products, []); }
  function setProducts(v){ write(STORAGE_KEYS.products, v); }
  function getCart()     { return read(STORAGE_KEYS.cart, []); }
  function setCart(v)    { write(STORAGE_KEYS.cart, v); }
  function getOrders()   { return read(STORAGE_KEYS.orders, []); }
  function setOrders(v)  { write(STORAGE_KEYS.orders, v); }
  function getRequests() { return read(STORAGE_KEYS.requests, []); }
  function setRequests(v){ write(STORAGE_KEYS.requests, v); }

  window.ChinaShopData = {
    STORAGE_KEYS, seedData,
    getShops, setShops, getProducts, setProducts,
    getCart, setCart, getOrders, setOrders,
    getRequests, setRequests,
    IMG
  };
})();
