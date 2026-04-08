(function () {
  const STORAGE_KEYS = {
    shops: 'chinaShopShops',
    products: 'chinaShopProducts',
    cart: 'chinaShopCart',
    orders: 'chinaShopOrders',
    requests: 'chinaShopRequests',
    seeded: 'chinaShopSeeded'
  };

  const shopSeeds = [
    {
      id: 'shenzhentech',
      name: 'ShenzhenTech Store',
      categories: ['Electronics', 'Gadgets'],
      rating: 4.7,
      about: 'Reliable devices and smart accessories selected for everyday performance and value.',
      banner: 'https://picsum.photos/seed/shenzhentech-banner/1200/400',
      commissionRate: 12
    },
    {
      id: 'beautyhaus',
      name: 'BeautyHaus China',
      categories: ['Beauty', 'Fashion'],
      rating: 4.5,
      about: 'Beauty, wellness, and fashion essentials with premium presentation and consistent quality.',
      banner: 'https://picsum.photos/seed/beautyhaus-banner/1200/400',
      commissionRate: 12
    },
    {
      id: 'homeplus',
      name: 'HomePlus Guangzhou',
      categories: ['Kitchen', 'Home & Living'],
      rating: 4.8,
      about: 'Practical home upgrades, kitchen tools, and living solutions designed for comfort and convenience.',
      banner: 'https://picsum.photos/seed/homeplus-banner/1200/400',
      commissionRate: 12
    }
  ];

  const productSeeds = [
    // ShenzhenTech - 8
    {
      id: 'p1', shopId: 'shenzhentech', category: 'Electronics', name: 'Wireless Bluetooth Earbuds Pro', price: 45000, rating: 4.7,
      image: 'https://picsum.photos/seed/earbuds-pro/800/450',
      description: 'Compact wireless earbuds with crisp sound, charging case, and touch controls.',
      specs: { Connectivity: 'Bluetooth 5.3', Battery: '24 hours with case', Charging: 'USB-C', Color: 'Black' }
    },
    {
      id: 'p2', shopId: 'shenzhentech', category: 'Gadgets', name: 'Smart LED Desk Lamp', price: 28000, rating: 4.6,
      image: 'https://picsum.photos/seed/desk-lamp/800/450',
      description: 'Dimmable desk lamp with touch panel, USB charging port, and adjustable arm.',
      specs: { Lighting: '3 tone modes', Power: '12W', Charging: 'USB output', Material: 'ABS + aluminum' }
    },
    {
      id: 'p3', shopId: 'shenzhentech', category: 'Electronics', name: 'USB-C Fast Charger Hub', price: 22000, rating: 4.4,
      image: 'https://picsum.photos/seed/charger-hub/800/450',
      description: 'Multi-port fast charging hub for phones, tablets, and accessories.',
      specs: { Ports: '4', Output: '65W max', Plug: 'Universal', Safety: 'Overheat protection' }
    },
    {
      id: 'p4', shopId: 'shenzhentech', category: 'Electronics', name: 'Mini Projector Home Cinema', price: 175000, rating: 4.8,
      image: 'https://picsum.photos/seed/projector-mini/800/450',
      description: 'Portable projector for movies, presentations, and streaming on the go.',
      specs: { Resolution: '1080p supported', Brightness: '320 ANSI lumens', Input: 'HDMI/USB', Weight: '1.2kg' }
    },
    {
      id: 'p5', shopId: 'shenzhentech', category: 'Gadgets', name: 'Magnetic Wireless Power Bank', price: 32000, rating: 4.5,
      image: 'https://picsum.photos/seed/power-bank/800/450',
      description: 'Slim magnetic power bank with fast wireless charging for daily convenience.',
      specs: { Capacity: '10000mAh', Charging: 'Wireless + USB-C', Finish: 'Matte', Weight: '220g' }
    },
    {
      id: 'p6', shopId: 'shenzhentech', category: 'Electronics', name: '4K Action Camera Kit', price: 118000, rating: 4.6,
      image: 'https://picsum.photos/seed/action-camera/800/450',
      description: 'High-resolution action camera with waterproof housing and accessories.',
      specs: { Video: '4K', Screen: '2-inch', Waterproof: '30m case', Battery: '2 included' }
    },
    {
      id: 'p7', shopId: 'shenzhentech', category: 'Gadgets', name: 'Portable Foldable Keyboard', price: 39000, rating: 4.3,
      image: 'https://picsum.photos/seed/foldable-keyboard/800/450',
      description: 'Compact foldable keyboard for mobile work and travel productivity.',
      specs: { Layout: 'Compact', Connectivity: 'Bluetooth', Battery: 'Rechargeable', Folded: 'Pocket-size' }
    },
    {
      id: 'p8', shopId: 'shenzhentech', category: 'Electronics', name: 'Smartwatch Fitness Edition', price: 68000, rating: 4.5,
      image: 'https://picsum.photos/seed/smart-watch/800/450',
      description: 'Fitness smartwatch with heart-rate tracking, notifications, and long battery life.',
      specs: { Display: 'AMOLED', Battery: '10 days', Water: 'IP68', Features: 'Health tracking' }
    },

    // BeautyHaus - 6
    {
      id: 'p9', shopId: 'beautyhaus', category: 'Beauty', name: 'Silk Hair Bonnet Premium', price: 9500, rating: 4.7,
      image: 'https://picsum.photos/seed/silk-bonnet/800/450',
      description: 'Soft premium bonnet designed for hair protection and comfortable sleep.',
      specs: { Material: 'Silk blend', Size: 'Adjustable', Use: 'Night care', Finish: 'Double layer' }
    },
    {
      id: 'p10', shopId: 'beautyhaus', category: 'Fashion', name: 'Waist Trainer Sculpt Fit', price: 18500, rating: 4.4,
      image: 'https://picsum.photos/seed/waist-trainer/800/450',
      description: 'Structured waist trainer with breathable fabric and adjustable compression.',
      specs: { Material: 'Latex blend', Closure: 'Hook & zip', Sizes: 'S-XXL', Color: 'Black' }
    },
    {
      id: 'p11', shopId: 'beautyhaus', category: 'Beauty', name: 'LED Facial Cleansing Brush', price: 34000, rating: 4.5,
      image: 'https://picsum.photos/seed/facial-brush/800/450',
      description: 'Water-resistant facial cleansing tool with gentle vibration modes.',
      specs: { Modes: '5', Charging: 'USB', Water: 'IPX6', Material: 'Silicone' }
    },
    {
      id: 'p12', shopId: 'beautyhaus', category: 'Fashion', name: 'Minimalist Crossbody Fashion Bag', price: 25500, rating: 4.6,
      image: 'https://picsum.photos/seed/crossbody-bag/800/450',
      description: 'Elegant compact bag with structured finish for everyday styling.',
      specs: { Material: 'PU leather', Strap: 'Adjustable', Closure: 'Zipper', Pockets: '3 compartments' }
    },
    {
      id: 'p13', shopId: 'beautyhaus', category: 'Beauty', name: 'Rechargeable Hair Straightener Brush', price: 42000, rating: 4.3,
      image: 'https://picsum.photos/seed/straightener-brush/800/450',
      description: 'Cordless straightening brush for quick touch-ups and travel use.',
      specs: { Heat: '3 levels', Charging: 'USB-C', "Run Time": '35 min', Safety: 'Auto shutoff' }
    },
    {
      id: 'p14', shopId: 'beautyhaus', category: 'Fashion', name: 'Luxury Press-On Nail Set', price: 8000, rating: 4.2,
      image: 'https://picsum.photos/seed/press-on-nails/800/450',
      description: 'Salon-style reusable nail set with adhesive tabs and glossy finish.',
      specs: { Pieces: '24', Finish: 'Glossy', Use: 'Reusable', Style: 'Mixed sizes' }
    },

    // HomePlus - 7
    {
      id: 'p15', shopId: 'homeplus', category: 'Kitchen', name: 'Portable Blender Smoothie Cup', price: 29000, rating: 4.5,
      image: 'https://picsum.photos/seed/portable-blender/800/450',
      description: 'Personal blender with cup design for juices, shakes, and quick blends.',
      specs: { Capacity: '450ml', Charging: 'USB-C', Blades: '6 stainless steel', Use: 'Portable' }
    },
    {
      id: 'p16', shopId: 'homeplus', category: 'Kitchen', name: 'Stainless Steel Cookware Set', price: 126000, rating: 4.8,
      image: 'https://picsum.photos/seed/cookware-set/800/450',
      description: 'Durable cookware set for daily cooking with matching lids and polished finish.',
      specs: { Pieces: '10', Material: 'Stainless steel', Use: 'Gas + electric', Finish: 'Mirror polish' }
    },
    {
      id: 'p17', shopId: 'homeplus', category: 'Home & Living', name: 'Robot Vacuum Cleaner Smart Sweep', price: 280000, rating: 4.9,
      image: 'https://picsum.photos/seed/robot-vacuum/800/450',
      description: 'Smart robot vacuum with scheduled cleaning, mapping, and auto-navigation.',
      specs: { "Run Time": '120 min', Navigation: 'Smart mapping', "Dust Bin": '600ml', Control: 'App + button' }
    },
    {
      id: 'p18', shopId: 'homeplus', category: 'Kitchen', name: 'Electric Kettle Quick Boil', price: 21000, rating: 4.4,
      image: 'https://picsum.photos/seed/electric-kettle/800/450',
      description: 'Fast boiling kettle with automatic shut-off and sleek countertop design.',
      specs: { Capacity: '1.8L', Power: '1500W', Safety: 'Auto shutoff', Body: 'Stainless steel' }
    },
    {
      id: 'p19', shopId: 'homeplus', category: 'Home & Living', name: 'Foldable Laundry Storage Basket', price: 12000, rating: 4.3,
      image: 'https://picsum.photos/seed/laundry-basket/800/450',
      description: 'Space-saving foldable basket for laundry and general home organization.',
      specs: { Material: 'Fabric + frame', Capacity: 'Large', Feature: 'Foldable', Handles: 'Reinforced' }
    },
    {
      id: 'p20', shopId: 'homeplus', category: 'Kitchen', name: 'Digital Air Fryer XL', price: 98000, rating: 4.7,
      image: 'https://picsum.photos/seed/air-fryer/800/450',
      description: 'Large-capacity air fryer with digital presets for healthier meals.',
      specs: { Capacity: '6L', Controls: 'Digital touch', Presets: '8', Power: '1700W' }
    },
    {
      id: 'p21', shopId: 'homeplus', category: 'Home & Living', name: 'Minimalist Bedside Storage Lamp', price: 26000, rating: 4.5,
      image: 'https://picsum.photos/seed/bedside-lamp/800/450',
      description: 'Bedside lamp with storage tray base for modern, functional living spaces.',
      specs: { Material: 'ABS + wood finish', Light: 'Warm LED', Feature: 'Tray base', Power: 'AC' }
    }
  ];

  function read(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function seedData() {
    if (localStorage.getItem(STORAGE_KEYS.seeded)) return;
    const shops = shopSeeds.map((shop) => ({
      ...shop,
      initials: shop.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
      productCount: productSeeds.filter((p) => p.shopId === shop.id).length
    }));
    write(STORAGE_KEYS.shops, shops);
    write(STORAGE_KEYS.products, productSeeds);
    write(STORAGE_KEYS.cart, []);
    write(STORAGE_KEYS.requests, []);
    write(STORAGE_KEYS.orders, [
      {
        id: 'o1001',
        buyerName: 'Ada Okon',
        phone: '08030001111',
        address: '12 Oron Road, Uyo',
        city: 'Uyo',
        state: 'Akwa Ibom',
        paymentMethod: 'Bank Transfer',
        items: [
          { productId: 'p1', quantity: 1, price: 45000, shopId: 'shenzhentech', name: 'Wireless Bluetooth Earbuds Pro' },
          { productId: 'p9', quantity: 2, price: 9500, shopId: 'beautyhaus', name: 'Silk Hair Bonnet Premium' }
        ],
        subtotal: 64000,
        deliveryFee: 2500,
        total: 66500,
        status: 'Processing',
        createdAt: new Date().toISOString()
      },
      {
        id: 'o1002',
        buyerName: 'Tunde Bello',
        phone: '08045552222',
        address: '8 Admiralty Way, Lekki',
        city: 'Lagos',
        state: 'Lagos',
        paymentMethod: 'Card',
        items: [
          { productId: 'p16', quantity: 1, price: 126000, shopId: 'homeplus', name: 'Stainless Steel Cookware Set' }
        ],
        subtotal: 126000,
        deliveryFee: 2500,
        total: 128500,
        status: 'New',
        createdAt: new Date().toISOString()
      }
    ]);
    localStorage.setItem(STORAGE_KEYS.seeded, 'true');
  }

  function getShops() { return read(STORAGE_KEYS.shops, []); }
  function setShops(value) { write(STORAGE_KEYS.shops, value); }
  function getProducts() { return read(STORAGE_KEYS.products, []); }
  function setProducts(value) { write(STORAGE_KEYS.products, value); }
  function getCart() { return read(STORAGE_KEYS.cart, []); }
  function setCart(value) { write(STORAGE_KEYS.cart, value); }
  function getOrders() { return read(STORAGE_KEYS.orders, []); }
  function setOrders(value) { write(STORAGE_KEYS.orders, value); }
  function getRequests() { return read(STORAGE_KEYS.requests, []); }
  function setRequests(value) { write(STORAGE_KEYS.requests, value); }

  window.ChinaShopData = {
    STORAGE_KEYS,
    seedData,
    getShops,
    setShops,
    getProducts,
    setProducts,
    getCart,
    setCart,
    getOrders,
    setOrders,
    getRequests,
    setRequests
  };
})();
