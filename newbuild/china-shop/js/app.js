(function () {
  const { seedData, getShops, setShops, getProducts, setProducts, getCart, setCart, getOrders, setOrders, getRequests, setRequests } = window.ChinaShopData;
  const { getRoute, navigate } = window.ChinaShopRouter;

  seedData();

  const state = {
    searchText: '',
    marketplaceFilter: { category: 'All', maxPrice: 500000, minRating: 0, shop: 'All' },
    cartPulse: false,
    shopTabs: {}
  };

  const DELIVERY_FEE = 2500;

  function formatNaira(value) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value).replace('NGN', '₦');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getProductById(id) { return getProducts().find((product) => product.id === id); }
  function getShopById(id) { return getShops().find((shop) => shop.id === id); }

  function withProductMeta(cartItems) {
    return cartItems.map((item) => {
      const product = getProductById(item.productId);
      return { ...item, product };
    }).filter((item) => item.product);
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function cartSubtotal() {
    return withProductMeta(getCart()).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  function addToCart(productId, quantity = 1) {
    const cart = [...getCart()];
    const existing = cart.find((item) => item.productId === productId);
    if (existing) existing.quantity += quantity;
    else cart.push({ productId, quantity });
    setCart(cart);
    state.cartPulse = true;
    renderNavbar();
    setTimeout(() => {
      state.cartPulse = false;
      renderNavbar();
    }, 450);
  }

  function updateCartQuantity(productId, delta) {
    const cart = [...getCart()];
    const item = cart.find((entry) => entry.productId === productId);
    if (!item) return;
    item.quantity += delta;
    const filtered = cart.filter((entry) => entry.quantity > 0);
    setCart(filtered);
    renderApp();
    renderNavbar();
  }

  function removeFromCart(productId) {
    setCart(getCart().filter((item) => item.productId !== productId));
    renderApp();
    renderNavbar();
  }

  function ratingStars(rating) {
    const full = Math.round(rating);
    return `${'★'.repeat(full)}${'☆'.repeat(5 - full)} <span class="small">${rating.toFixed(1)}</span>`;
  }

  function parseQuerySearch() {
    const route = getRoute();
    return route.query.q || state.searchText || '';
  }

  function navbarLinkClass(page) {
    return getRoute().page === page ? 'nav-link active' : 'nav-link';
  }

  function renderNavbar() {
    const navbar = document.getElementById('navbar');
    const count = cartCount();
    const pulseClass = state.cartPulse ? 'pulse' : '';
    const query = parseQuerySearch();
    navbar.className = 'navbar';
    navbar.innerHTML = `
      <div class="container">
        <div class="navbar-inner">
          <a href="#home" class="logo" aria-label="China Shop home">
            <span class="logo-mark">中</span>
            <span>China Shop</span>
          </a>

          <form class="nav-search desktop-only" id="global-search-form">
            <input class="input" id="global-search-input" type="search" placeholder="Search products, categories, shops" value="${escapeHtml(query)}" />
            <button class="btn btn-primary" type="submit">Search</button>
          </form>

          <div class="nav-links desktop-only">
            <a class="${navbarLinkClass('home')}" href="#home">Home</a>
            <a class="${navbarLinkClass('marketplace')}" href="#marketplace">Marketplace</a>
            <a class="${navbarLinkClass('shops')}" href="#shops">Shops</a>
            <a class="${navbarLinkClass('request')}" href="#request">Special Request</a>
            <a class="icon-btn" href="#cart" aria-label="Cart">
              🛒
              <span class="badge ${pulseClass}">${count}</span>
            </a>
            <a class="btn btn-outline" href="#checkout">Account</a>
          </div>

          <button class="icon-btn hamburger" id="mobile-menu-toggle" aria-label="Menu">☰</button>
        </div>

        <div class="mobile-menu" id="mobile-menu">
          <form class="nav-search mb-2" id="global-search-form-mobile">
            <input class="input" id="global-search-input-mobile" type="search" placeholder="Search products, categories, shops" value="${escapeHtml(query)}" />
            <button class="btn btn-primary" type="submit">Search</button>
          </form>
          <div class="grid">
            <a class="nav-link ${getRoute().page === 'home' ? 'active' : ''}" href="#home">Home</a>
            <a class="nav-link ${getRoute().page === 'marketplace' ? 'active' : ''}" href="#marketplace">Marketplace</a>
            <a class="nav-link ${getRoute().page === 'shops' ? 'active' : ''}" href="#shops">Shops</a>
            <a class="nav-link ${getRoute().page === 'request' ? 'active' : ''}" href="#request">Special Request</a>
            <a class="nav-link ${getRoute().page === 'cart' ? 'active' : ''}" href="#cart">Cart (${count})</a>
            <a class="nav-link" href="#checkout">Account</a>
          </div>
        </div>
      </div>
    `;

    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
      toggle.onclick = () => menu.classList.toggle('open');
    }

    ['global-search-form', 'global-search-form-mobile'].forEach((id) => {
      const form = document.getElementById(id);
      if (!form) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input');
        state.searchText = input.value.trim();
        const queryString = state.searchText ? `?q=${encodeURIComponent(state.searchText)}` : '';
        navigate(`marketplace${queryString}`);
      });
    });
  }

  function productCard(product) {
    const shop = getShopById(product.shopId);
    return `
      <article class="card product-card">
        <a class="product-image-wrap" href="#product/${product.id}">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
        </a>
        <div class="product-body">
          <span class="shop-badge">${escapeHtml(shop?.name || 'China Shop')}</span>
          <a href="#product/${product.id}"><h3 class="product-name">${escapeHtml(product.name)}</h3></a>
          <div class="price">${formatNaira(product.price)}</div>
          <div class="rating mt-2">${ratingStars(product.rating)}</div>
          <div class="actions">
            <a class="btn btn-ghost" href="#product/${product.id}">View</a>
            <button class="btn btn-primary add-cart-btn" data-product-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function shopCard(shop) {
    return `
      <article class="card shop-card">
        <div class="shop-banner"><img src="${shop.banner}" alt="${escapeHtml(shop.name)} banner" /></div>
        <div class="shop-body">
          <div class="shop-header">
            <div class="shop-avatar">${escapeHtml(shop.initials)}</div>
            <div>
              <h3 class="mb-0">${escapeHtml(shop.name)}</h3>
              <div class="small muted">${shop.productCount} products • ${shop.categories.join(' & ')}</div>
            </div>
          </div>
          <p class="muted">${escapeHtml(shop.about)}</p>
          <div class="flex justify-between items-center gap-2">
            <span class="rating">${ratingStars(shop.rating)}</span>
            <a class="btn btn-primary" href="#shop/${shop.id}">Visit Shop</a>
          </div>
        </div>
      </article>
    `;
  }

  function homePage() {
    const products = [...getProducts()].sort((a, b) => b.rating - a.rating).slice(0, 6);
    const categories = [
      ['Electronics', '💻'], ['Gadgets', '📱'], ['Kitchen', '🍳'], ['Fashion', '👗'], ['Home & Living', '🛋️'], ['Beauty', '✨']
    ];
    return `
      <section class="hero">
        <div class="container">
          <div class="hero-card">
            <div>
              <h1>Buy from China. Delivered to you. No hassle.</h1>
              <p>Discover trusted products across electronics, fashion, beauty, kitchen, and home essentials. China Shop handles the process from purchase to delivery — simply shop and relax.</p>
              <form id="hero-search-form" class="hero-search">
                <input id="hero-search-input" class="input" type="search" placeholder="Search for gadgets, home items, beauty products" />
                <button class="btn btn-primary" type="submit">Search</button>
              </form>
              <div class="hero-actions">
                <a href="#marketplace" class="btn btn-primary">Shop Now</a>
                <a href="#request" class="btn btn-outline">Special Request</a>
              </div>
            </div>
            <div class="hero-art">
              <img src="https://picsum.photos/seed/china-shop-hero/900/700" alt="China Shop hero" />
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section-title">Shop by Category</h2>
          <p class="section-subtitle">Find what you need quickly from curated collections.</p>
          <div class="grid category-grid">
            ${categories.map(([name, icon]) => `
              <a class="category-tile" href="#marketplace?category=${encodeURIComponent(name)}">
                <span class="category-icon">${icon}</span>
                <span>${name}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section-title">Trending Products</h2>
          <p class="section-subtitle">Popular picks buyers are loving right now.</p>
          <div class="grid product-grid">
            ${products.map(productCard).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section-title">How it works</h2>
          <div class="grid how-grid">
            <div class="card feature-card"><div class="feature-number">1</div><h3>Browse</h3><p class="muted">Explore products and partner shops across key categories.</p></div>
            <div class="card feature-card"><div class="feature-number">2</div><h3>Order</h3><p class="muted">Add items to your cart or send a special request with your budget and quantity.</p></div>
            <div class="card feature-card"><div class="feature-number">3</div><h3>Delivered</h3><p class="muted">China Shop handles the fulfillment process and delivers to your location.</p></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="grid trust-grid">
            <div class="card trust-card"><h3>🔒 Secure Checkout</h3><p class="muted">Smooth payment flow with trusted checkout options.</p></div>
            <div class="card trust-card"><h3>🚚 Fast Delivery</h3><p class="muted">Clear order handling from checkout to doorstep.</p></div>
            <div class="card trust-card"><h3>✅ Verified Products</h3><p class="muted">Carefully listed items from approved partner shops.</p></div>
          </div>
        </div>
      </section>
    `;
  }

  function marketplacePage(query) {
    const products = getProducts();
    const shops = getShops();
    const urlCategory = query.category || 'All';
    if (urlCategory && state.marketplaceFilter.category === 'All' && urlCategory !== 'All') state.marketplaceFilter.category = urlCategory;

    const searchQ = (query.q || '').trim().toLowerCase();
    const filtered = products.filter((product) => {
      const shop = getShopById(product.shopId);
      const matchesSearch = !searchQ || [product.name, product.description, product.category, shop?.name || ''].join(' ').toLowerCase().includes(searchQ);
      const matchesCategory = state.marketplaceFilter.category === 'All' || product.category === state.marketplaceFilter.category;
      const matchesPrice = product.price <= state.marketplaceFilter.maxPrice;
      const matchesRating = product.rating >= Number(state.marketplaceFilter.minRating || 0);
      const matchesShop = state.marketplaceFilter.shop === 'All' || product.shopId === state.marketplaceFilter.shop;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesShop;
    });

    return `
      <section class="section">
        <div class="container">
          <h1 class="section-title">Marketplace</h1>
          <p class="section-subtitle">Browse all available products with filters for category, price, rating, and shop.</p>
          <div class="filters-layout">
            <aside class="card sidebar">
              <div class="filter-group">
                <label class="label">Category</label>
                <select id="filter-category" class="select">
                  ${['All', 'Electronics', 'Gadgets', 'Kitchen', 'Fashion', 'Home & Living', 'Beauty'].map((item) => `<option value="${item}" ${state.marketplaceFilter.category === item ? 'selected' : ''}>${item}</option>`).join('')}
                </select>
              </div>
              <div class="filter-group">
                <div class="filter-row mb-1"><span class="label mb-0">Price range</span><span class="range-value">Up to ${formatNaira(state.marketplaceFilter.maxPrice)}</span></div>
                <input id="filter-price" type="range" min="0" max="500000" step="5000" value="${state.marketplaceFilter.maxPrice}" />
              </div>
              <div class="filter-group">
                <label class="label">Minimum rating</label>
                <select id="filter-rating" class="select">
                  ${[0, 3, 4, 4.5].map((val) => `<option value="${val}" ${Number(state.marketplaceFilter.minRating) === val ? 'selected' : ''}>${val === 0 ? 'Any rating' : `${val}+`}</option>`).join('')}
                </select>
              </div>
              <div class="filter-group">
                <label class="label">Shop</label>
                <select id="filter-shop" class="select">
                  <option value="All">All shops</option>
                  ${shops.map((shop) => `<option value="${shop.id}" ${state.marketplaceFilter.shop === shop.id ? 'selected' : ''}>${shop.name}</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-ghost" id="reset-filters">Reset Filters</button>
            </aside>
            <div>
              <div class="small muted mb-2">Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}</div>
              <div class="grid product-grid">
                ${filtered.length ? filtered.map(productCard).join('') : `<div class="card empty-state">No products match your current filters.</div>`}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function shopsPage() {
    return `
      <section class="section">
        <div class="container">
          <h1 class="section-title">Partner Shops</h1>
          <p class="section-subtitle">Browse curated partner stores with products managed through China Shop.</p>
          <div class="grid shops-grid">
            ${getShops().map(shopCard).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function shopPage(id) {
    const shop = getShopById(id);
    if (!shop) return notFoundPage();
    const allProducts = getProducts().filter((product) => product.shopId === shop.id);
    const categories = ['All', ...new Set(allProducts.map((product) => product.category))];
    const activeTab = state.shopTabs[shop.id] || 'All';
    const visibleProducts = activeTab === 'All' ? allProducts : allProducts.filter((product) => product.category === activeTab);

    return `
      <section class="section">
        <div class="container">
          <div class="banner-panel card">
            <img src="${shop.banner}" alt="${escapeHtml(shop.name)}" />
            <div class="banner-overlay">
              <div>
                <div class="shop-badge">${shop.categories.join(' • ')}</div>
                <h1 class="section-title" style="color:white;margin:0;">${escapeHtml(shop.name)}</h1>
                <p class="mb-0">${escapeHtml(shop.about)}</p>
              </div>
            </div>
          </div>
          <div class="tabs">
            ${categories.map((category) => `<button class="tab ${activeTab === category ? 'active' : ''}" data-shop-tab="${shop.id}" data-category="${category}">${category}</button>`).join('')}
          </div>
          <div class="grid product-grid">
            ${visibleProducts.map(productCard).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function productPage(id) {
    const product = getProductById(id);
    if (!product) return notFoundPage();
    const shop = getShopById(product.shopId);
    const related = getProducts().filter((item) => item.shopId === product.shopId && item.id !== product.id).slice(0, 4);

    return `
      <section class="section">
        <div class="container">
          <div class="product-detail">
            <div class="product-gallery card">
              <img src="${product.image}" alt="${escapeHtml(product.name)}" />
            </div>
            <div class="card detail-card">
              <span class="shop-badge">${escapeHtml(shop?.name || 'China Shop')}</span>
              <h1 class="section-title">${escapeHtml(product.name)}</h1>
              <div class="price mb-2">${formatNaira(product.price)}</div>
              <div class="rating mb-3">${ratingStars(product.rating)}</div>
              <p class="muted">${escapeHtml(product.description)}</p>
              <table class="spec-table">
                ${Object.entries(product.specs).map(([key, val]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(val)}</td></tr>`).join('')}
              </table>
              <div class="mt-3 flex items-center gap-2" style="flex-wrap:wrap;">
                <div class="qty-wrap">
                  <button type="button" id="qty-minus">−</button>
                  <span id="qty-value">1</span>
                  <button type="button" id="qty-plus">+</button>
                </div>
                <button class="btn btn-primary" id="add-to-cart-detail" data-product-id="${product.id}">Add to Cart</button>
                <button class="btn btn-secondary" id="buy-now-btn" data-product-id="${product.id}">Buy Now</button>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Related Products</h2>
            <div class="grid product-grid">
              ${related.map(productCard).join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function requestPage() {
    return `
      <section class="section">
        <div class="container" style="max-width: 840px;">
          <div class="card form-card">
            <h1 class="section-title">Special Request</h1>
            <p class="section-subtitle">Tell us what you want — we'll handle the rest.</p>
            <form id="special-request-form" class="form-grid">
              <div class="full">
                <label class="label">Item description</label>
                <textarea class="textarea" name="description" required placeholder="Describe the item, preferred features, color, size, or model"></textarea>
              </div>
              <div class="full">
                <label class="label">Reference image upload</label>
                <div class="upload-ui">
                  <input class="input" type="file" name="referenceImage" accept="image/*" />
                  <div class="footer-note">UI only. Your request details will still be submitted even without an image.</div>
                </div>
              </div>
              <div>
                <label class="label">Budget range (₦)</label>
                <input class="input" type="number" min="0" name="budget" placeholder="e.g. 50000" required />
              </div>
              <div>
                <label class="label">Quantity</label>
                <input class="input" type="number" min="1" name="quantity" value="1" required />
              </div>
              <div class="full">
                <label class="label">Delivery urgency</label>
                <select class="select" name="urgency" required>
                  <option value="Not urgent">Not urgent</option>
                  <option value="Within 2 weeks">Within 2 weeks</option>
                  <option value="ASAP">ASAP</option>
                </select>
              </div>
              <div class="full">
                <button class="btn btn-primary" type="submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  function cartPage() {
    const items = withProductMeta(getCart());
    if (!items.length) {
      return `
        <section class="section"><div class="container"><div class="card empty-state">Your cart is empty. <a href="#marketplace" style="color:var(--primary);font-weight:700;">Start shopping</a>.</div></div></section>
      `;
    }
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + DELIVERY_FEE;
    return `
      <section class="section">
        <div class="container">
          <h1 class="section-title">Your Cart</h1>
          <div class="cart-layout">
            <div class="card">
              ${items.map((item) => `
                <div class="cart-item">
                  <img class="cart-thumb" src="${item.product.image}" alt="${escapeHtml(item.product.name)}" />
                  <div>
                    <h3 class="mb-1">${escapeHtml(item.product.name)}</h3>
                    <div class="muted">${formatNaira(item.product.price)} each</div>
                    <div class="mt-2 qty-wrap">
                      <button data-cart-action="decrease" data-product-id="${item.product.id}">−</button>
                      <span>${item.quantity}</span>
                      <button data-cart-action="increase" data-product-id="${item.product.id}">+</button>
                    </div>
                  </div>
                  <div>
                    <div class="price mb-2">${formatNaira(item.product.price * item.quantity)}</div>
                    <button class="btn btn-ghost" data-cart-action="remove" data-product-id="${item.product.id}">Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <aside class="card summary-card">
              <h3>Order Summary</h3>
              <div class="summary-row"><span>Subtotal</span><strong>${formatNaira(subtotal)}</strong></div>
              <div class="summary-row"><span>Delivery Fee</span><strong>${formatNaira(DELIVERY_FEE)}</strong></div>
              <div class="summary-row total"><span>Total</span><span>${formatNaira(total)}</span></div>
              <a class="btn btn-primary mt-3" href="#checkout">Proceed to Checkout</a>
            </aside>
          </div>
        </div>
      </section>
    `;
  }

  function checkoutPage() {
    const items = withProductMeta(getCart());
    if (!items.length) return `
      <section class="section"><div class="container"><div class="card empty-state">No items available for checkout. <a href="#marketplace" style="color:var(--primary);font-weight:700;">Browse products</a>.</div></div></section>
    `;
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return `
      <section class="section">
        <div class="container">
          <h1 class="section-title">Checkout</h1>
          <div class="checkout-layout">
            <div class="card form-card">
              <form id="checkout-form" class="form-grid">
                <div>
                  <label class="label">Full Name</label>
                  <input class="input" name="fullName" required />
                </div>
                <div>
                  <label class="label">Phone</label>
                  <input class="input" name="phone" required />
                </div>
                <div class="full">
                  <label class="label">Delivery Address</label>
                  <textarea class="textarea" name="address" required></textarea>
                </div>
                <div>
                  <label class="label">City</label>
                  <input class="input" name="city" required />
                </div>
                <div>
                  <label class="label">State</label>
                  <input class="input" name="state" required />
                </div>
                <div class="full">
                  <label class="label">Payment Method</label>
                  <select class="select" name="paymentMethod" required>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Pay on Delivery">Pay on Delivery</option>
                  </select>
                </div>
                <div class="full">
                  <button class="btn btn-primary" type="submit">Place Order</button>
                </div>
              </form>
            </div>
            <aside class="card summary-card">
              <h3>Order Summary</h3>
              ${items.map((item) => `<div class="summary-row"><span>${escapeHtml(item.product.name)} × ${item.quantity}</span><strong>${formatNaira(item.product.price * item.quantity)}</strong></div>`).join('')}
              <div class="summary-row"><span>Subtotal</span><strong>${formatNaira(subtotal)}</strong></div>
              <div class="summary-row"><span>Delivery Fee</span><strong>${formatNaira(DELIVERY_FEE)}</strong></div>
              <div class="summary-row total"><span>Total</span><span>${formatNaira(subtotal + DELIVERY_FEE)}</span></div>
            </aside>
          </div>
        </div>
      </section>
    `;
  }

  function successPage() {
    return `
      <section class="success">
        <div class="container">
          <div class="card success-card">
            <div class="success-mark">✓</div>
            <h1 class="section-title">Order placed successfully</h1>
            <p class="section-subtitle">Your order has been received and is now visible in the vendor and admin dashboards.</p>
            <a class="btn btn-primary" href="#marketplace">Continue Shopping</a>
          </div>
        </div>
      </section>
    `;
  }

  function gatePage(type) {
    const title = type === 'vendor' ? 'Vendor Dashboard' : 'Admin Dashboard';
    const pinHint = type === 'vendor' ? 'Enter vendor PIN' : 'Enter admin PIN';
    return `
      <section class="centered">
        <div class="container">
          <div class="card pin-card">
            <h1 class="section-title">${title}</h1>
            <p class="section-subtitle">${pinHint}</p>
            <form id="${type}-pin-form">
              <input class="input" type="password" name="pin" placeholder="Enter PIN" required />
              <div class="pin-actions">
                <button class="btn btn-primary" type="submit">Unlock</button>
                <a class="btn btn-ghost" href="#home">Back</a>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  function vendorPage() {
    if (sessionStorage.getItem('chinaShopVendorAccess') !== 'true') return gatePage('vendor');
    const products = getProducts();
    const orders = getOrders();
    const vendorProducts = products.filter((product) => product.shopId === 'shenzhentech');
    const vendorOrders = orders.filter((order) => order.items.some((item) => item.shopId === 'shenzhentech'));
    const activeTab = sessionStorage.getItem('chinaShopVendorTab') || 'products';
    return `
      <section class="section">
        <div class="container">
          <div class="flex justify-between items-center gap-2 mb-3" style="flex-wrap:wrap;">
            <div>
              <h1 class="section-title mb-0">Vendor Dashboard</h1>
              <p class="section-subtitle">Manage products and view incoming orders.</p>
            </div>
            <button class="btn btn-ghost" id="vendor-logout">Lock</button>
          </div>
          <div class="tabs">
            <button class="tab ${activeTab === 'products' ? 'active' : ''}" data-vendor-tab="products">Products</button>
            <button class="tab ${activeTab === 'orders' ? 'active' : ''}" data-vendor-tab="orders">Orders</button>
          </div>
          ${activeTab === 'products' ? `
            <div class="card form-card mb-3">
              <h3 class="mb-2">Add / Edit Product</h3>
              <form id="vendor-product-form" class="form-grid">
                <input type="hidden" name="id" />
                <div><label class="label">Product name</label><input class="input" name="name" required /></div>
                <div><label class="label">Price (₦)</label><input class="input" type="number" name="price" min="0" required /></div>
                <div><label class="label">Category</label><select class="select" name="category" required><option>Electronics</option><option>Gadgets</option><option>Kitchen</option><option>Fashion</option><option>Home & Living</option><option>Beauty</option></select></div>
                <div><label class="label">Rating</label><input class="input" type="number" min="1" max="5" step="0.1" name="rating" required /></div>
                <div class="full"><label class="label">Image URL</label><input class="input" name="image" required /></div>
                <div class="full"><label class="label">Description</label><textarea class="textarea" name="description" required></textarea></div>
                <div class="full"><button class="btn btn-primary" type="submit">Save Product</button></div>
              </form>
            </div>
            <div class="card table-card">
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead>
                  <tbody>
                    ${vendorProducts.map((product) => `
                      <tr>
                        <td>${escapeHtml(product.name)}</td>
                        <td>${escapeHtml(product.category)}</td>
                        <td>${formatNaira(product.price)}</td>
                        <td>${product.rating.toFixed(1)}</td>
                        <td>
                          <button class="btn btn-ghost vendor-edit-product" data-product-id="${product.id}">Edit</button>
                          <button class="btn btn-outline vendor-delete-product" data-product-id="${product.id}">Delete</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : `
            <div class="card table-card">
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    ${vendorOrders.map((order) => `
                      <tr>
                        <td>${escapeHtml(order.buyerName)}</td>
                        <td>${escapeHtml(order.items.filter((item) => item.shopId === 'shenzhentech').map((item) => `${item.name} × ${item.quantity}`).join(', '))}</td>
                        <td>${formatNaira(order.total)}</td>
                        <td>
                          <select class="select vendor-order-status" data-order-id="${order.id}">
                            ${['New', 'Processing', 'Shipped', 'Delivered'].map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                          </select>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `}
        </div>
      </section>
    `;
  }

  function adminPage() {
    if (sessionStorage.getItem('chinaShopAdminAccess') !== 'true') return gatePage('admin');
    const orders = getOrders();
    const products = getProducts();
    const shops = getShops();
    const requests = getRequests();
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const commission = orders.reduce((sum, order) => sum + order.total * 0.12, 0);
    const openOrders = orders.filter((order) => order.status !== 'Delivered').length;

    return `
      <section class="section">
        <div class="container">
          <div class="flex justify-between items-center gap-2 mb-3" style="flex-wrap:wrap;">
            <div>
              <h1 class="section-title mb-0">Admin Dashboard</h1>
              <p class="section-subtitle">Platform overview, orders, vendor settings, and request management.</p>
            </div>
            <button class="btn btn-ghost" id="admin-logout">Lock</button>
          </div>

          <div class="grid stats-grid mb-3">
            <div class="card stat-card"><div class="muted">Revenue Summary</div><div class="value">${formatNaira(revenue)}</div></div>
            <div class="card stat-card"><div class="muted">Commission Earned</div><div class="value">${formatNaira(commission)}</div><div class="footer-note">12% of all orders</div></div>
            <div class="card stat-card"><div class="muted">Open Orders / Total Products</div><div class="value">${openOrders} / ${products.length}</div></div>
          </div>

          <div class="card table-card mb-3">
            <h3 class="mb-2">All Orders</h3>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  ${orders.map((order) => `
                    <tr>
                      <td>${escapeHtml(order.buyerName)}</td>
                      <td>${escapeHtml(order.items.map((item) => `${item.name} × ${item.quantity}`).join(', '))}</td>
                      <td>${formatNaira(order.total)}</td>
                      <td>${escapeHtml(order.status)}</td>
                      <td>${escapeHtml(order.paymentMethod)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card table-card mb-3">
            <h3 class="mb-2">Special Request Queue</h3>
            ${requests.length ? `
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Description</th><th>Budget</th><th>Quantity</th><th>Urgency</th><th>Status</th></tr></thead>
                  <tbody>
                    ${requests.map((request) => `
                      <tr>
                        <td>${escapeHtml(request.description)}</td>
                        <td>${formatNaira(request.budget)}</td>
                        <td>${request.quantity}</td>
                        <td>${escapeHtml(request.urgency)}</td>
                        <td>${escapeHtml(request.status)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `<div class="empty-state">No special requests yet.</div>`}
          </div>

          <div class="card table-card">
            <h3 class="mb-2">Vendor List</h3>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Vendor</th><th>Categories</th><th>Rating</th><th>Commission Rate</th></tr></thead>
                <tbody>
                  ${shops.map((shop) => `
                    <tr>
                      <td>${escapeHtml(shop.name)}</td>
                      <td>${escapeHtml(shop.categories.join(', '))}</td>
                      <td>${shop.rating.toFixed(1)}</td>
                      <td>${shop.commissionRate}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function notFoundPage() {
    return `
      <section class="centered"><div class="container"><div class="card empty-state">Page not found. <a href="#home" style="color:var(--primary);font-weight:700;">Go home</a>.</div></div></section>
    `;
  }

  function renderApp() {
    const route = getRoute();
    const app = document.getElementById('app');

    switch (route.page) {
      case 'home': app.innerHTML = homePage(); break;
      case 'marketplace': app.innerHTML = marketplacePage(route.query); break;
      case 'shops': app.innerHTML = shopsPage(); break;
      case 'shop': app.innerHTML = shopPage(route.params.id); break;
      case 'product': app.innerHTML = productPage(route.params.id); break;
      case 'request': app.innerHTML = requestPage(); break;
      case 'cart': app.innerHTML = cartPage(); break;
      case 'checkout': app.innerHTML = checkoutPage(); break;
      case 'success': app.innerHTML = successPage(); break;
      case 'vendor': app.innerHTML = vendorPage(); break;
      case 'admin': app.innerHTML = adminPage(); break;
      default: app.innerHTML = notFoundPage();
    }

    bindPageEvents(route);
  }

  function bindAddCartButtons(root = document) {
    root.querySelectorAll('.add-cart-btn').forEach((button) => {
      button.addEventListener('click', () => addToCart(button.dataset.productId, 1));
    });
  }

  function bindPageEvents(route) {
    bindAddCartButtons();

    if (route.page === 'home') {
      const form = document.getElementById('hero-search-form');
      if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        const q = document.getElementById('hero-search-input').value.trim();
        navigate(`marketplace${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      });
    }

    if (route.page === 'marketplace') {
      const category = document.getElementById('filter-category');
      const price = document.getElementById('filter-price');
      const rating = document.getElementById('filter-rating');
      const shop = document.getElementById('filter-shop');
      const reset = document.getElementById('reset-filters');
      if (category) category.onchange = () => { state.marketplaceFilter.category = category.value; renderApp(); };
      if (price) price.oninput = () => { state.marketplaceFilter.maxPrice = Number(price.value); renderApp(); };
      if (rating) rating.onchange = () => { state.marketplaceFilter.minRating = Number(rating.value); renderApp(); };
      if (shop) shop.onchange = () => { state.marketplaceFilter.shop = shop.value; renderApp(); };
      if (reset) reset.onclick = () => {
        state.marketplaceFilter = { category: 'All', maxPrice: 500000, minRating: 0, shop: 'All' };
        navigate('marketplace');
      };
    }

    if (route.page === 'shop') {
      document.querySelectorAll('[data-shop-tab]').forEach((button) => {
        button.onclick = () => {
          state.shopTabs[button.dataset.shopTab] = button.dataset.category;
          renderApp();
        };
      });
    }

    if (route.page === 'product') {
      let qty = 1;
      const value = document.getElementById('qty-value');
      const updateQty = (next) => { qty = Math.max(1, next); value.textContent = qty; };
      const minus = document.getElementById('qty-minus');
      const plus = document.getElementById('qty-plus');
      const addBtn = document.getElementById('add-to-cart-detail');
      const buyNow = document.getElementById('buy-now-btn');
      if (minus) minus.onclick = () => updateQty(qty - 1);
      if (plus) plus.onclick = () => updateQty(qty + 1);
      if (addBtn) addBtn.onclick = () => addToCart(addBtn.dataset.productId, qty);
      if (buyNow) buyNow.onclick = () => {
        addToCart(buyNow.dataset.productId, qty);
        navigate('checkout');
      };
    }

    if (route.page === 'request') {
      const form = document.getElementById('special-request-form');
      if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const requests = getRequests();
        requests.unshift({
          id: `r${Date.now()}`,
          description: formData.get('description'),
          budget: Number(formData.get('budget')),
          quantity: Number(formData.get('quantity')),
          urgency: formData.get('urgency'),
          status: 'New',
          createdAt: new Date().toISOString()
        });
        setRequests(requests);
        form.reset();
        alert('Your special request has been submitted. China Shop will handle the rest.');
      });
    }

    if (route.page === 'cart') {
      document.querySelectorAll('[data-cart-action]').forEach((button) => {
        button.onclick = () => {
          const { cartAction, productId } = button.dataset;
          if (cartAction === 'increase') updateCartQuantity(productId, 1);
          if (cartAction === 'decrease') updateCartQuantity(productId, -1);
          if (cartAction === 'remove') removeFromCart(productId);
        };
      });
    }

    if (route.page === 'checkout') {
      const form = document.getElementById('checkout-form');
      if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const cartItems = withProductMeta(getCart());
        const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const order = {
          id: `o${Date.now()}`,
          buyerName: formData.get('fullName'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          paymentMethod: formData.get('paymentMethod'),
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            shopId: item.product.shopId,
            name: item.product.name
          })),
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total: subtotal + DELIVERY_FEE,
          status: 'New',
          createdAt: new Date().toISOString()
        };
        const orders = getOrders();
        orders.unshift(order);
        setOrders(orders);
        setCart([]);
        renderNavbar();
        navigate('success');
      });
    }

    if (route.page === 'vendor') {
      const pinForm = document.getElementById('vendor-pin-form');
      if (pinForm) pinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const pin = new FormData(pinForm).get('pin');
        if (pin === '1234') {
          sessionStorage.setItem('chinaShopVendorAccess', 'true');
          renderApp();
        } else {
          alert('Incorrect vendor PIN.');
        }
      });

      document.getElementById('vendor-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('chinaShopVendorAccess');
        renderApp();
      });

      document.querySelectorAll('[data-vendor-tab]').forEach((button) => {
        button.onclick = () => {
          sessionStorage.setItem('chinaShopVendorTab', button.dataset.vendorTab);
          renderApp();
        };
      });

      const form = document.getElementById('vendor-product-form');
      if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fd = new FormData(form);
        const products = getProducts();
        const existingIndex = products.findIndex((product) => product.id === fd.get('id'));
        const payload = {
          id: fd.get('id') || `p${Date.now()}`,
          shopId: 'shenzhentech',
          category: fd.get('category'),
          name: fd.get('name'),
          price: Number(fd.get('price')),
          rating: Number(fd.get('rating')),
          image: fd.get('image'),
          description: fd.get('description'),
          specs: { Category: fd.get('category'), Condition: 'New', Delivery: 'Handled by China Shop', Warranty: 'Store policy applies' }
        };
        if (existingIndex >= 0) products[existingIndex] = payload;
        else products.unshift(payload);
        setProducts(products);
        refreshShopCounts();
        form.reset();
        renderApp();
      });

      document.querySelectorAll('.vendor-edit-product').forEach((button) => {
        button.onclick = () => {
          const product = getProductById(button.dataset.productId);
          const form = document.getElementById('vendor-product-form');
          if (!product || !form) return;
          form.elements.id.value = product.id;
          form.elements.name.value = product.name;
          form.elements.price.value = product.price;
          form.elements.category.value = product.category;
          form.elements.rating.value = product.rating;
          form.elements.image.value = product.image;
          form.elements.description.value = product.description;
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      });

      document.querySelectorAll('.vendor-delete-product').forEach((button) => {
        button.onclick = () => {
          const products = getProducts().filter((product) => product.id !== button.dataset.productId);
          setProducts(products);
          refreshShopCounts();
          renderApp();
        };
      });

      document.querySelectorAll('.vendor-order-status').forEach((select) => {
        select.onchange = () => {
          const orders = getOrders();
          const order = orders.find((entry) => entry.id === select.dataset.orderId);
          if (!order) return;
          order.status = select.value;
          setOrders(orders);
        };
      });
    }

    if (route.page === 'admin') {
      const pinForm = document.getElementById('admin-pin-form');
      if (pinForm) pinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const pin = new FormData(pinForm).get('pin');
        if (pin === '9999') {
          sessionStorage.setItem('chinaShopAdminAccess', 'true');
          renderApp();
        } else {
          alert('Incorrect admin PIN.');
        }
      });

      document.getElementById('admin-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('chinaShopAdminAccess');
        renderApp();
      });
    }
  }

  function refreshShopCounts() {
    const shops = getShops().map((shop) => ({
      ...shop,
      productCount: getProducts().filter((product) => product.shopId === shop.id).length
    }));
    setShops(shops);
  }

  function init() {
    renderNavbar();
    renderApp();
  }

  window.addEventListener('hashchange', () => {
    renderNavbar();
    renderApp();
  });
  window.addEventListener('load', init);
})();
