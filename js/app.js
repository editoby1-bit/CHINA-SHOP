(function () {
  const D = window.ChinaShopData;
  const R = window.ChinaShopRouter;

  D.seedData();

  const state = {
    search: '',
    filter: { category: 'All', maxPrice: 500000, minRating: 0, shop: 'All' },
    cartPulse: false,
    shopTab: {}
  };

  const DELIVERY = 2500;
  const CATEGORIES = ['Electronics','Gadgets','Kitchen','Fashion','Home & Living','Beauty'];
  const CAT_ICONS  = { Electronics:'💻', Gadgets:'📱', Kitchen:'🍳', Fashion:'👗', 'Home & Living':'🛋️', Beauty:'✨' };

  function ₦(n) {
    return '₦' + new Intl.NumberFormat('en-NG').format(n);
  }
  function esc(s) {
    return String(s).replace(/[&<>'"]/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function stars(r) {
    const f = Math.round(r);
    return '★'.repeat(f) + '☆'.repeat(5-f) + ` <span class="rating-num">${r.toFixed(1)}</span>`;
  }
  function shopById(id) { return D.getShops().find(s => s.id === id); }
  function prodById(id) { return D.getProducts().find(p => p.id === id); }
  function cartCount()  { return D.getCart().reduce((s,i) => s+i.quantity, 0); }

  function enrichCart() {
    return D.getCart().map(i => ({...i, product: prodById(i.productId)})).filter(i => i.product);
  }

  // ─── NAVBAR ──────────────────────────────────
  function renderNavbar() {
    const nav = document.getElementById('navbar');
    const count = cartCount();
    const page = R.getRoute().page;
    const q = R.getRoute().query.q || state.search;
    nav.className = 'navbar';
    nav.innerHTML = `
      <div class="container">
        <div class="navbar-inner">
          <a href="#home" class="logo">
            <span class="logo-mark">中</span>
            <span>China Shop</span>
          </a>
          <form class="nav-search desktop-only" id="nsf">
            <input id="nsi" type="search" placeholder="Search products, shops…" value="${esc(q)}" />
            <button type="submit">Search</button>
          </form>
          <nav class="nav-links desktop-only">
            <a href="#home"        class="nav-link ${page==='home'?'active':''}">Home</a>
            <a href="#marketplace" class="nav-link ${page==='marketplace'?'active':''}">Marketplace</a>
            <a href="#shops"       class="nav-link ${page==='shops'?'active':''}">Shops</a>
            <a href="#request"     class="nav-link ${page==='request'?'active':''}">Special Request</a>
          </nav>
          <a href="#cart" class="nav-cart desktop-only" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            ${count > 0 ? `<span class="cart-badge ${state.cartPulse?'pulse':''}">${count}</span>` : ''}
          </a>
          <a href="#vendor" class="btn-account desktop-only">Vendor</a>
          <button class="hamburger" id="ham-btn" aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <div class="mobile-menu" id="mob-menu">
          <form class="nav-search mb-2" id="nsf-mob">
            <input id="nsi-mob" type="search" placeholder="Search…" value="${esc(q)}" />
            <button type="submit">Go</button>
          </form>
          <div class="mobile-nav-links">
            <a href="#home" class="${page==='home'?'active':''}">Home</a>
            <a href="#marketplace" class="${page==='marketplace'?'active':''}">Marketplace</a>
            <a href="#shops" class="${page==='shops'?'active':''}">Shops</a>
            <a href="#request" class="${page==='request'?'active':''}">Special Request</a>
            <a href="#cart">Cart (${count})</a>
            <a href="#vendor">Vendor</a>
          </div>
        </div>
      </div>`;

    document.getElementById('ham-btn').onclick = () =>
      document.getElementById('mob-menu').classList.toggle('open');

    ['nsf','nsf-mob'].forEach(id => {
      const f = document.getElementById(id);
      if (!f) return;
      f.onsubmit = e => {
        e.preventDefault();
        const val = f.querySelector('input').value.trim();
        state.search = val;
        R.navigate(`marketplace${val ? '?q='+encodeURIComponent(val) : ''}`);
      };
    });
  }

  // ─── ADD TO CART ──────────────────────────────
  function addToCart(id, qty=1) {
    const cart = [...D.getCart()];
    const ex = cart.find(i => i.productId===id);
    if (ex) ex.quantity += qty;
    else cart.push({productId:id, quantity:qty});
    D.setCart(cart);
    state.cartPulse = true;
    renderNavbar();
    setTimeout(() => { state.cartPulse = false; renderNavbar(); }, 500);
  }

  // ─── PRODUCT CARD ─────────────────────────────
  function productCard(p) {
    const shop = shopById(p.shopId);
    return `
      <article class="product-card">
        <a class="product-img" href="#product/${p.id}">
          <img src="${esc(p.image)}" alt="${esc(p.name)}"
            onerror="this.style.display='none';this.parentElement.innerHTML='<div class=product-img-fallback>${CAT_ICONS[p.category]||'📦'}</div>'" />
        </a>
        <div class="product-body">
          <span class="product-shop">${esc(shop?.name||'China Shop')}</span>
          <a href="#product/${p.id}">
            <h3 class="product-name">${esc(p.name)}</h3>
          </a>
          <div class="product-price">${₦(p.price)}</div>
          <div class="product-rating">${stars(p.rating)}</div>
          <div class="product-actions">
            <a class="btn btn-ghost btn-sm" href="#product/${p.id}">View</a>
            <button class="btn btn-primary btn-sm add-btn" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>`;
  }

  // ─── HOME PAGE ────────────────────────────────
  function homePage() {
    const trending = [...D.getProducts()].sort((a,b) => b.rating-a.rating).slice(0,8);
    const shops = D.getShops();
    return `
      <!-- HERO -->
      <section class="hero">
        <div class="container">
          <div class="hero-inner">
            <div class="hero-text">
              <span class="hero-eyebrow">🇨🇳 Trusted China Marketplace</span>
              <h1 class="hero-title">Buy from China.<br><span>Delivered</span> to you.</h1>
              <p class="hero-desc">Discover electronics, fashion, kitchen essentials and more. We handle sourcing, fulfilment, and delivery — you simply shop.</p>
              <form class="hero-search-bar" id="hero-sf">
                <input id="hero-si" type="search" placeholder="Search gadgets, home items, beauty products…" />
                <button type="submit">Search</button>
              </form>
              <div class="hero-actions">
                <a href="#marketplace" class="btn btn-primary btn-lg">Shop Now</a>
                <a href="#request" class="btn btn-lg" style="background:rgba(255,255,255,0.1);color:#fff;border:1.5px solid rgba(255,255,255,0.2);">Special Request</a>
              </div>
              <div class="hero-stats">
                <div class="hero-stat"><div class="stat-num">21+</div><div class="stat-label">Products</div></div>
                <div class="hero-stat"><div class="stat-num">3</div><div class="stat-label">Partner Shops</div></div>
                <div class="hero-stat"><div class="stat-num">100%</div><div class="stat-label">Discreet Sourcing</div></div>
              </div>
            </div>
            <div class="hero-image-wrap">
              <img src="https://placehold.co/800x600/1a1a2e/ffffff?text=China+Shop" alt="China Shop" />
              <div class="hero-image-badge">
                <div class="badge-icon">🚀</div>
                <div class="badge-text">
                  <strong>Fast Delivery</strong>
                  <span>Nationwide shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="section">
        <div class="container">
          <span class="section-label">Browse by type</span>
          <h2 class="section-heading">Shop by Category</h2>
          <p class="section-sub">Find exactly what you need from our curated product collections.</p>
          <div class="category-grid">
            ${CATEGORIES.map(c => `
              <a class="category-tile" href="#marketplace?category=${encodeURIComponent(c)}">
                <span class="tile-icon">${CAT_ICONS[c]}</span>
                <span class="tile-label">${c}</span>
              </a>`).join('')}
          </div>
        </div>
      </section>

      <!-- TRENDING -->
      <section class="section section-panel">
        <div class="container">
          <span class="section-label">Hot right now</span>
          <h2 class="section-heading">Trending Products</h2>
          <p class="section-sub">Popular picks buyers are loving right now.</p>
          <div class="product-grid">
            ${trending.map(productCard).join('')}
          </div>
          <div style="text-align:center;margin-top:2rem;">
            <a href="#marketplace" class="btn btn-dark btn-lg">View All Products</a>
          </div>
        </div>
      </section>

      <!-- SHOPS PREVIEW -->
      <section class="section">
        <div class="container">
          <span class="section-label">Our partners</span>
          <h2 class="section-heading">Partner Shops</h2>
          <p class="section-sub">Browse curated Chinese stores operating through China Shop.</p>
          <div class="shops-grid">
            ${shops.map(shopCard).join('')}
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="section section-panel">
        <div class="container">
          <span class="section-label">The process</span>
          <h2 class="section-heading">How it works</h2>
          <p class="section-sub">Three simple steps from product discovery to your doorstep.</p>
          <div class="how-grid">
            <div class="how-card">
              <div class="how-number">1</div>
              <div class="how-title">Browse & Select</div>
              <p class="how-desc">Explore products across our marketplace or partner shops. Filter by category, price, and rating.</p>
            </div>
            <div class="how-card">
              <div class="how-number">2</div>
              <div class="how-title">Place Your Order</div>
              <p class="how-desc">Add to cart and checkout, or submit a Special Request for items not listed. We handle sourcing discreetly.</p>
            </div>
            <div class="how-card">
              <div class="how-number">3</div>
              <div class="how-title">Delivered to You</div>
              <p class="how-desc">China Shop manages the entire fulfilment pipeline. Your order arrives at your door — no complexity on your end.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- TRUST SECTION -->
      <section class="section" style="background:var(--black);padding:3rem 0;">
        <div class="container">
          <div class="trust-strip">
            <div class="trust-card">
              <div class="trust-icon">🔒</div>
              <div>
                <div class="trust-title">Secure Checkout</div>
                <div class="trust-desc">Multiple payment methods with safe, smooth checkout flow.</div>
              </div>
            </div>
            <div class="trust-card">
              <div class="trust-icon">🚚</div>
              <div>
                <div class="trust-title">Reliable Delivery</div>
                <div class="trust-desc">Orders tracked from placement to your doorstep, nationwide.</div>
              </div>
            </div>
            <div class="trust-card">
              <div class="trust-icon">🤫</div>
              <div>
                <div class="trust-title">Discreet Sourcing</div>
                <div class="trust-desc">Our supplier network is private. You get the product, not the complexity.</div>
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  // ─── SHOP CARD ────────────────────────────────
  function shopCard(shop) {
    return `
      <article class="shop-card">
        <div class="shop-banner">
          <img src="${esc(shop.banner)}" alt="${esc(shop.name)}"
            onerror="this.style.display='none'" />
        </div>
        <div class="shop-body">
          <div class="shop-header">
            <div class="shop-avatar">${esc(shop.initials)}</div>
            <div>
              <div class="shop-name">${esc(shop.name)}</div>
              <div class="shop-meta">${shop.productCount} products · ${shop.categories.join(' & ')}</div>
            </div>
          </div>
          <p class="shop-about">${esc(shop.about)}</p>
          <div class="shop-footer">
            <span style="color:#F59E0B;font-size:0.82rem;">${stars(shop.rating)}</span>
            <a class="btn btn-primary btn-sm" href="#shop/${shop.id}">Visit Shop →</a>
          </div>
        </div>
      </article>`;
  }

  // ─── MARKETPLACE ──────────────────────────────
  function marketplacePage(query) {
    // Always sync category from URL — fixes the category filter bug
    state.filter.category = query.category || 'All';
    const searchQ = (query.q || '').trim().toLowerCase();
    const all = D.getProducts();
    const filtered = all.filter(p => {
      const shop = shopById(p.shopId);
      const matchSearch = !searchQ || [p.name,p.description,p.category,shop?.name||''].join(' ').toLowerCase().includes(searchQ);
      const matchCat   = state.filter.category==='All' || p.category===state.filter.category;
      const matchPrice = p.price <= state.filter.maxPrice;
      const matchRating= p.rating >= state.filter.minRating;
      const matchShop  = state.filter.shop==='All' || p.shopId===state.filter.shop;
      return matchSearch && matchCat && matchPrice && matchRating && matchShop;
    });

    return `
      <section class="section">
        <div class="container">
          <div class="page-title">Marketplace</div>
          <div class="page-subtitle">Browse all ${all.length} products across ${D.getShops().length} partner shops.</div>
          <div class="marketplace-layout">
            <aside class="card sidebar">
              <div class="sidebar-title">Filters</div>
              <div class="filter-group">
                <label class="label">Category</label>
                <div class="select-wrap">
                  <select id="fc" class="select">
                    ${['All',...CATEGORIES].map(c => `<option value="${c}" ${state.filter.category===c?'selected':''}>${c==='All'?'All Categories':c}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="filter-group">
                <div class="filter-row">
                  <label class="label" style="margin:0">Max Price</label>
                  <span class="filter-val" id="fp-val">${₦(state.filter.maxPrice)}</span>
                </div>
                <input id="fp" type="range" min="0" max="500000" step="5000" value="${state.filter.maxPrice}" />
              </div>
              <div class="filter-group">
                <label class="label">Min Rating</label>
                <div class="select-wrap">
                  <select id="fr" class="select">
                    ${[[0,'Any rating'],[3,'3.0+'],[4,'4.0+'],[4.5,'4.5+']].map(([v,l]) =>
                      `<option value="${v}" ${state.filter.minRating===v?'selected':''}>${l}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="filter-group">
                <label class="label">Shop</label>
                <div class="select-wrap">
                  <select id="fs" class="select">
                    <option value="All">All shops</option>
                    ${D.getShops().map(s => `<option value="${s.id}" ${state.filter.shop===s.id?'selected':''}>${s.name}</option>`).join('')}
                  </select>
                </div>
              </div>
              <button class="btn btn-ghost btn-full" id="reset-btn">Reset Filters</button>
            </aside>
            <div>
              <div class="results-bar">
                <span class="results-count">Showing <strong>${filtered.length}</strong> product${filtered.length!==1?'s':''}</span>
              </div>
              <div class="product-grid">
                ${filtered.length
                  ? filtered.map(productCard).join('')
                  : '<div class="empty-state" style="grid-column:1/-1">No products match your filters. <button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'reset-btn\').click()">Clear filters</button></div>'}
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  // ─── SHOPS PAGE ───────────────────────────────
  function shopsPage() {
    return `
      <section class="section">
        <div class="container">
          <div class="page-title">Partner Shops</div>
          <div class="page-subtitle">Curated Chinese stores operating directly through China Shop.</div>
          <div class="shops-grid">
            ${D.getShops().map(shopCard).join('')}
          </div>
        </div>
      </section>`;
  }

  // ─── SINGLE SHOP ──────────────────────────────
  function shopPage(id) {
    const shop = shopById(id);
    if (!shop) return notFound();
    const prods = D.getProducts().filter(p => p.shopId===shop.id);
    const cats = ['All', ...new Set(prods.map(p => p.category))];
    const active = state.shopTab[id] || 'All';
    const visible = active==='All' ? prods : prods.filter(p => p.category===active);
    return `
      <section class="section">
        <div class="container">
          <div class="shop-hero">
            <img src="${esc(shop.banner)}" alt="${esc(shop.name)}"
              onerror="this.style.background='var(--gray-900)';this.style.display='block'" />
            <div class="shop-hero-overlay">
              <div class="shop-avatar-lg">${esc(shop.initials)}</div>
              <div>
                <div class="shop-hero-title">${esc(shop.name)}</div>
                <div class="shop-hero-meta">${shop.productCount} products · ${shop.categories.join(' & ')} · ★ ${shop.rating.toFixed(1)}</div>
              </div>
            </div>
          </div>
          <div class="tabs">
            ${cats.map(c => `<button class="tab ${active===c?'active':''}" data-shop="${id}" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <div class="product-grid">
            ${visible.length ? visible.map(productCard).join('') : '<div class="empty-state">No products in this category.</div>'}
          </div>
        </div>
      </section>`;
  }

  // ─── PRODUCT DETAIL ───────────────────────────
  function productPage(id) {
    const p = prodById(id);
    if (!p) return notFound();
    const shop = shopById(p.shopId);
    const related = D.getProducts().filter(r => r.shopId===p.shopId && r.id!==p.id).slice(0,4);
    return `
      <section class="section">
        <div class="container">
          <div class="product-detail-grid">
            <div class="product-gallery card">
              <img src="${esc(p.image)}" alt="${esc(p.name)}"
                onerror="this.style.display='none';this.parentElement.innerHTML='<div style=height:100%;min-height:320px;display:flex;align-items:center;justify-content:center;font-size:4rem;background:var(--gray-100)>${CAT_ICONS[p.category]||'📦'}</div>'" />
            </div>
            <div class="product-detail-body">
              <span class="product-shop">${esc(shop?.name||'China Shop')}</span>
              <h1 class="product-detail-title">${esc(p.name)}</h1>
              <div class="product-detail-price">${₦(p.price)}</div>
              <div class="product-rating" style="font-size:0.92rem;margin-bottom:1rem">${stars(p.rating)}</div>
              <p class="product-detail-desc">${esc(p.description)}</p>
              <table class="spec-table">
                ${Object.entries(p.specs).map(([k,v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
              </table>
              <div class="flex items-center gap-2 mt-3" style="flex-wrap:wrap;">
                <div class="qty-control">
                  <button id="qty-minus" type="button">−</button>
                  <span id="qty-val">1</span>
                  <button id="qty-plus" type="button">+</button>
                </div>
                <button class="btn btn-primary" id="atc-btn" data-id="${p.id}">Add to Cart</button>
                <button class="btn btn-dark" id="buy-btn" data-id="${p.id}">Buy Now</button>
              </div>
            </div>
          </div>
          ${related.length ? `
            <div>
              <h2 class="section-heading mb-3">More from ${esc(shop?.name||'this shop')}</h2>
              <div class="product-grid">${related.map(productCard).join('')}</div>
            </div>` : ''}
        </div>
      </section>`;
  }

  // ─── REQUEST PAGE ─────────────────────────────
  function requestPage() {
    return `
      <section class="section">
        <div class="container">
          <div class="page-title">Special Request</div>
          <div class="page-subtitle">Can't find what you need? Tell us and we'll source it privately.</div>
          <div class="request-layout">
            <div class="card form-card">
              <form id="req-form" class="form-grid">
                <div class="full field">
                  <label class="label">What do you want?</label>
                  <textarea class="textarea" name="description" required placeholder="Describe the item — model, color, size, features, quantity…"></textarea>
                </div>
                <div class="full field">
                  <label class="label">Reference image (optional)</label>
                  <div class="upload-zone">
                    <input type="file" name="refImage" accept="image/*" />
                    <div class="upload-hint">Upload a reference photo to help us find exactly what you want.</div>
                  </div>
                </div>
                <div class="field">
                  <label class="label">Your budget (₦)</label>
                  <input class="input" type="number" min="0" name="budget" placeholder="e.g. 50000" required />
                </div>
                <div class="field">
                  <label class="label">Quantity</label>
                  <input class="input" type="number" min="1" name="quantity" value="1" required />
                </div>
                <div class="full field">
                  <label class="label">Delivery urgency</label>
                  <div class="select-wrap">
                    <select class="select" name="urgency" required>
                      <option value="Not urgent">Not urgent — take your time</option>
                      <option value="Within 2 weeks">Within 2 weeks</option>
                      <option value="ASAP">ASAP — urgent</option>
                    </select>
                  </div>
                </div>
                <div class="full">
                  <button class="btn btn-primary btn-lg btn-full" type="submit">Submit Request</button>
                </div>
              </form>
            </div>
            <div class="request-info-card card">
              <h3>How it works</h3>
              <div class="request-step">
                <div class="request-step-num">1</div>
                <div class="request-step-text"><strong>You describe it</strong>Tell us what you want, your budget, and how fast you need it.</div>
              </div>
              <div class="request-step">
                <div class="request-step-num">2</div>
                <div class="request-step-text"><strong>We source it</strong>Our team finds it through our private supplier network. You never see where it comes from.</div>
              </div>
              <div class="request-step">
                <div class="request-step-num">3</div>
                <div class="request-step-text"><strong>We deliver it</strong>Once sourced and confirmed, your item ships directly to you.</div>
              </div>
              <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,0.08);font-size:0.8rem;color:rgba(255,255,255,0.35);line-height:1.6;">
                Our sourcing channels are confidential. That's how we protect our trade operation and keep prices competitive for you.
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  // ─── CART PAGE ────────────────────────────────
  function cartPage() {
    const items = enrichCart();
    if (!items.length) return `
      <section class="section"><div class="container">
        <div class="empty-state" style="padding:5rem">
          <div style="font-size:3rem;margin-bottom:1rem">🛒</div>
          <div style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;color:var(--gray-900)">Your cart is empty</div>
          <div style="margin-bottom:1.5rem">Add some products and come back here.</div>
          <a href="#marketplace" class="btn btn-primary">Browse Products</a>
        </div>
      </div></section>`;

    const subtotal = items.reduce((s,i) => s + i.product.price*i.quantity, 0);
    return `
      <section class="section">
        <div class="container">
          <div class="page-title">Your Cart</div>
          <div class="page-subtitle">${items.length} item${items.length!==1?'s':''} in your cart</div>
          <div class="cart-layout">
            <div class="card">
              ${items.map(i => `
                <div class="cart-item">
                  <img class="cart-thumb" src="${esc(i.product.image)}" alt="${esc(i.product.name)}"
                    onerror="this.style.background='var(--gray-100)';this.src=''" />
                  <div>
                    <div class="cart-item-name">${esc(i.product.name)}</div>
                    <div class="cart-item-shop">${esc(shopById(i.product.shopId)?.name||'China Shop')}</div>
                    <div class="cart-item-price">${₦(i.product.price)} each</div>
                    <div class="cart-qty">
                      <button data-action="dec" data-id="${i.product.id}">−</button>
                      <span>${i.quantity}</span>
                      <button data-action="inc" data-id="${i.product.id}">+</button>
                    </div>
                  </div>
                  <div>
                    <div class="cart-item-total">${₦(i.product.price*i.quantity)}</div>
                    <button class="remove-btn" data-action="rm" data-id="${i.product.id}">Remove</button>
                  </div>
                </div>`).join('')}
            </div>
            <aside class="card order-summary">
              <h3>Order Summary</h3>
              <div class="summary-row"><span>Subtotal</span><strong>${₦(subtotal)}</strong></div>
              <div class="summary-row"><span>Delivery fee</span><strong>${₦(DELIVERY)}</strong></div>
              <div class="summary-row total"><span>Total</span><span>${₦(subtotal+DELIVERY)}</span></div>
              <a class="btn btn-primary btn-full mt-3" href="#checkout">Proceed to Checkout →</a>
              <a class="btn btn-ghost btn-full mt-2" href="#marketplace">Continue Shopping</a>
            </aside>
          </div>
        </div>
      </section>`;
  }

  // ─── CHECKOUT PAGE ────────────────────────────
  function checkoutPage() {
    const items = enrichCart();
    if (!items.length) return `<section class="section"><div class="container"><div class="empty-state">No items to checkout. <a href="#marketplace">Browse products</a>.</div></div></section>`;
    const subtotal = items.reduce((s,i) => s + i.product.price*i.quantity, 0);
    return `
      <section class="section">
        <div class="container">
          <div class="page-title">Checkout</div>
          <div class="page-subtitle">Complete your order below.</div>
          <div class="checkout-layout">
            <div class="card form-card">
              <form id="co-form" class="form-grid">
                <div class="field"><label class="label">Full Name</label><input class="input" name="fullName" required placeholder="Your full name" /></div>
                <div class="field"><label class="label">Phone / WhatsApp</label><input class="input" name="phone" required placeholder="080xxxxxxxx" /></div>
                <div class="full field"><label class="label">Delivery Address</label><textarea class="textarea" name="address" required placeholder="Street, area, landmark…"></textarea></div>
                <div class="field"><label class="label">City</label><input class="input" name="city" required /></div>
                <div class="field"><label class="label">State</label><input class="input" name="state" required /></div>
                <div class="full field">
                  <label class="label">Payment Method</label>
                  <div class="payment-opts">
                    <label class="payment-opt"><input type="radio" name="paymentMethod" value="Card" checked /> 💳 Pay by Card</label>
                    <label class="payment-opt"><input type="radio" name="paymentMethod" value="Bank Transfer" /> 🏦 Bank Transfer</label>
                    <label class="payment-opt"><input type="radio" name="paymentMethod" value="Pay on Delivery" /> 🤝 Pay on Delivery</label>
                  </div>
                </div>
                <div class="full"><button class="btn btn-primary btn-lg btn-full" type="submit">Place Order →</button></div>
              </form>
            </div>
            <aside class="card order-summary">
              <h3>Your Order</h3>
              ${items.map(i => `<div class="summary-row"><span>${esc(i.product.name)} × ${i.quantity}</span><strong>${₦(i.product.price*i.quantity)}</strong></div>`).join('')}
              <div class="summary-row"><span>Subtotal</span><strong>${₦(subtotal)}</strong></div>
              <div class="summary-row"><span>Delivery</span><strong>${₦(DELIVERY)}</strong></div>
              <div class="summary-row total"><span>Total</span><span>${₦(subtotal+DELIVERY)}</span></div>
            </aside>
          </div>
        </div>
      </section>`;
  }

  // ─── SUCCESS PAGE ─────────────────────────────
  function successPage() {
    return `
      <div class="success-wrap">
        <div class="card success-card">
          <div class="success-icon">✅</div>
          <div class="success-title">Order Placed!</div>
          <p class="success-sub">Your order has been received and is being processed. The vendor and admin dashboards have been updated.</p>
          <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
            <a class="btn btn-primary" href="#marketplace">Continue Shopping</a>
            <a class="btn btn-ghost" href="#admin">View Admin Panel</a>
          </div>
        </div>
      </div>`;
  }

  // ─── VENDOR PAGE ──────────────────────────────
  function vendorPage() {
    if (sessionStorage.getItem('cs_vendor') !== 'true') {
      return `<div class="pin-gate"><div class="card pin-card">
        <div class="pin-lock">🏪</div>
        <h2>Vendor Portal</h2>
        <p>Enter your vendor PIN to access your dashboard and manage products and orders.</p>
        <form id="vpin-form" class="form-grid" style="max-width:280px;margin:0 auto;">
          <div class="full field"><label class="label">Vendor PIN</label><input class="input" name="pin" type="password" placeholder="Enter PIN" autocomplete="off" /></div>
          <div class="full"><button class="btn btn-primary btn-full" type="submit">Access Dashboard</button></div>
        </form>
        <p style="font-size:0.75rem;color:var(--gray-400);margin-top:1rem;">Hint: 1234</p>
      </div></div>`;
    }

    const tab = sessionStorage.getItem('cs_vtab') || 'products';
    const prods = D.getProducts().filter(p => p.shopId==='shenzhentech');
    const orders = D.getOrders().filter(o => o.items.some(i => i.shopId==='shenzhentech'));

    return `
      <section class="section">
        <div class="container">
          <div class="flex justify-between items-center mb-3">
            <div><div class="page-title">Vendor Dashboard</div><div class="page-subtitle">ShenzhenTech Store — manage your products and orders.</div></div>
            <button class="btn btn-ghost" id="vlogout-btn">Lock</button>
          </div>
          <div class="dashboard-layout">
            <aside class="card dash-nav">
              <div class="dash-nav-title">Dashboard</div>
              <button class="dash-nav-btn ${tab==='products'?'active':''}" data-vtab="products">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Products
              </button>
              <button class="dash-nav-btn ${tab==='orders'?'active':''}" data-vtab="orders">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Orders (${orders.length})
              </button>
            </aside>
            <div>
              ${tab==='products' ? `
                <div class="card dash-card">
                  <div class="dash-card-header">
                    <span class="dash-card-title">Add / Edit Product</span>
                  </div>
                  <div class="vendor-form">
                    <form id="vprod-form" class="form-grid">
                      <input type="hidden" name="id" />
                      <div class="field"><label class="label">Product Name</label><input class="input" name="name" required /></div>
                      <div class="field"><label class="label">Price (₦)</label><input class="input" type="number" name="price" min="0" required /></div>
                      <div class="field"><label class="label">Category</label><div class="select-wrap"><select class="select" name="category" required>${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div></div>
                      <div class="field"><label class="label">Rating (1–5)</label><input class="input" type="number" min="1" max="5" step="0.1" name="rating" value="4.5" required /></div>
                      <div class="full field"><label class="label">Image URL</label><input class="input" name="image" placeholder="https://…" required /></div>
                      <div class="full field"><label class="label">Description</label><textarea class="textarea" name="description" required></textarea></div>
                      <div class="full"><button class="btn btn-primary" type="submit">Save Product</button></div>
                    </form>
                  </div>
                </div>
                <div class="card dash-card">
                  <div class="dash-card-header"><span class="dash-card-title">My Products (${prods.length})</span></div>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead>
                      <tbody>
                        ${prods.length ? prods.map(p => `
                          <tr>
                            <td style="font-weight:600">${esc(p.name)}</td>
                            <td>${esc(p.category)}</td>
                            <td style="color:var(--red);font-weight:700">${₦(p.price)}</td>
                            <td>★ ${p.rating.toFixed(1)}</td>
                            <td style="display:flex;gap:0.4rem">
                              <button class="btn btn-ghost btn-sm vedit-btn" data-id="${p.id}">Edit</button>
                              <button class="btn btn-sm" style="background:var(--red-soft);color:var(--red);border:1px solid var(--red-border)" data-delid="${p.id}">Delete</button>
                            </td>
                          </tr>`).join('') : '<tr><td colspan="5" class="empty-msg">No products yet.</td></tr>'}
                      </tbody>
                    </table>
                  </div>
                </div>` : `
                <div class="card dash-card">
                  <div class="dash-card-header"><span class="dash-card-title">Incoming Orders (${orders.length})</span></div>
                  <div class="table-wrap">
                    <table class="data-table">
                      <thead><tr><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                      <tbody>
                        ${orders.length ? orders.map(o => `
                          <tr>
                            <td style="font-weight:600">${esc(o.buyerName)}</td>
                            <td style="max-width:200px">${esc(o.items.filter(i=>i.shopId==='shenzhentech').map(i=>`${i.name} ×${i.quantity}`).join(', '))}</td>
                            <td style="color:var(--red);font-weight:700">${₦(o.total)}</td>
                            <td>
                              <select class="select" style="width:auto;padding:0.35rem 0.5rem;font-size:0.8rem" data-oid="${o.id}">
                                ${['New','Processing','Shipped','Delivered'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
                              </select>
                            </td>
                          </tr>`).join('') : '<tr><td colspan="4" class="empty-msg">No orders yet.</td></tr>'}
                      </tbody>
                    </table>
                  </div>
                </div>`}
            </div>
          </div>
        </div>
      </section>`;
  }

  // ─── ADMIN PAGE ───────────────────────────────
  function adminPage() {
    if (sessionStorage.getItem('cs_admin') !== 'true') {
      return `<div class="pin-gate"><div class="card pin-card">
        <div class="pin-lock">🔐</div>
        <h2>Admin Panel</h2>
        <p>Restricted access. Enter the admin PIN to view the operations dashboard.</p>
        <form id="apin-form" class="form-grid" style="max-width:280px;margin:0 auto;">
          <div class="full field"><label class="label">Admin PIN</label><input class="input" name="pin" type="password" placeholder="Enter PIN" autocomplete="off" /></div>
          <div class="full"><button class="btn btn-primary btn-full" type="submit">Access Admin Panel</button></div>
        </form>
        <p style="font-size:0.75rem;color:var(--gray-400);margin-top:1rem;">Hint: 9999</p>
      </div></div>`;
    }

    const orders = D.getOrders();
    const requests = D.getRequests();
    const shops = D.getShops();
    const products = D.getProducts();
    const revenue = orders.reduce((s,o) => s+o.total, 0);
    const commission = revenue * 0.12;
    const open = orders.filter(o => o.status!=='Delivered').length;

    return `
      <section class="section">
        <div class="container">
          <div class="flex justify-between items-center mb-3">
            <div><div class="page-title">Operations Dashboard</div><div class="page-subtitle">Platform overview — revenue, orders, requests, vendors.</div></div>
            <button class="btn btn-ghost" id="alogout-btn">Lock</button>
          </div>
          <div class="stats-grid mb-3">
            <div class="card stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value red">${₦(revenue)}</div>
              <div class="stat-note">All orders combined</div>
            </div>
            <div class="card stat-card">
              <div class="stat-label">Commission Earned</div>
              <div class="stat-value">${₦(Math.round(commission))}</div>
              <div class="stat-note">12% of order value</div>
            </div>
            <div class="card stat-card">
              <div class="stat-label">Open Orders / Products</div>
              <div class="stat-value">${open} <span style="font-size:1rem;color:var(--gray-400)">/ ${products.length}</span></div>
              <div class="stat-note">Active orders pending delivery</div>
            </div>
          </div>

          <div class="card dash-card mb-3">
            <div class="dash-card-header"><span class="dash-card-title">All Orders</span></div>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  ${orders.map(o => `
                    <tr>
                      <td style="font-weight:600">${esc(o.buyerName)}</td>
                      <td style="max-width:220px;color:var(--gray-500)">${esc(o.items.map(i=>`${i.name} ×${i.quantity}`).join(', '))}</td>
                      <td style="color:var(--red);font-weight:700">${₦(o.total)}</td>
                      <td><span class="status-pill ${o.status==='New'?'s-new':o.status==='Processing'?'s-processing':o.status==='Shipped'?'s-shipped':'s-delivered'}">${o.status}</span></td>
                      <td>${esc(o.paymentMethod)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card dash-card mb-3">
            <div class="dash-card-header"><span class="dash-card-title">Special Request Queue (${requests.length})</span></div>
            ${requests.length ? `
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Description</th><th>Budget</th><th>Qty</th><th>Urgency</th><th>Status</th></tr></thead>
                  <tbody>
                    ${requests.map(r => `
                      <tr>
                        <td style="max-width:200px">${esc(r.description)}</td>
                        <td style="color:var(--red);font-weight:600">${₦(r.budget)}</td>
                        <td>${r.quantity}</td>
                        <td>${esc(r.urgency)}</td>
                        <td><span class="status-pill s-new">${esc(r.status)}</span></td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>` : '<div class="empty-msg">No special requests yet.</div>'}
          </div>

          <div class="card dash-card">
            <div class="dash-card-header"><span class="dash-card-title">Vendor List</span></div>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Shop</th><th>Categories</th><th>Rating</th><th>Commission</th><th>Products</th></tr></thead>
                <tbody>
                  ${shops.map(s => `
                    <tr>
                      <td style="font-weight:700">${esc(s.name)}</td>
                      <td>${esc(s.categories.join(', '))}</td>
                      <td>★ ${s.rating.toFixed(1)}</td>
                      <td style="color:var(--red);font-weight:700">${s.commissionRate}%</td>
                      <td>${s.productCount}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>`;
  }

  function notFound() {
    return `<div class="not-found"><div style="font-size:3rem;margin-bottom:1rem">🔍</div><div style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem">Page not found</div><a href="#home" class="btn btn-primary">Go Home</a></div>`;
  }

  // ─── RENDER APP ───────────────────────────────
  function renderApp() {
    window.scrollTo(0, 0);
    const route = R.getRoute();
    const app = document.getElementById('app');
    switch (route.page) {
      case 'home':        app.innerHTML = homePage(); break;
      case 'marketplace': app.innerHTML = marketplacePage(route.query); break;
      case 'shops':       app.innerHTML = shopsPage(); break;
      case 'shop':        app.innerHTML = shopPage(route.params.id); break;
      case 'product':     app.innerHTML = productPage(route.params.id); break;
      case 'request':     app.innerHTML = requestPage(); break;
      case 'cart':        app.innerHTML = cartPage(); break;
      case 'checkout':    app.innerHTML = checkoutPage(); break;
      case 'success':     app.innerHTML = successPage(); break;
      case 'vendor':      app.innerHTML = vendorPage(); break;
      case 'admin':       app.innerHTML = adminPage(); break;
      default:            app.innerHTML = notFound();
    }
    bindEvents(route);
  }

  // ─── BIND EVENTS ──────────────────────────────
  function bindEvents(route) {
    // Add to cart buttons everywhere
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.onclick = () => addToCart(btn.dataset.id);
    });

    // Marketplace filters
    if (route.page === 'marketplace') {
      const fc = document.getElementById('fc');
      const fp = document.getElementById('fp');
      const fr = document.getElementById('fr');
      const fs = document.getElementById('fs');
      const reset = document.getElementById('reset-btn');
      if (fc) fc.onchange = () => { state.filter.category = fc.value; renderApp(); };
      if (fp) {
        fp.oninput = () => {
          state.filter.maxPrice = Number(fp.value);
          document.getElementById('fp-val').textContent = ₦(state.filter.maxPrice);
        };
        fp.onchange = () => { state.filter.maxPrice = Number(fp.value); renderApp(); };
      }
      if (fr) fr.onchange = () => { state.filter.minRating = Number(fr.value); renderApp(); };
      if (fs) fs.onchange = () => { state.filter.shop = fs.value; renderApp(); };
      if (reset) reset.onclick = () => {
        state.filter = { category: 'All', maxPrice: 500000, minRating: 0, shop: 'All' };
        R.navigate('marketplace');
      };
    }

    // Shop tabs
    document.querySelectorAll('.tab[data-shop]').forEach(btn => {
      btn.onclick = () => {
        state.shopTab[btn.dataset.shop] = btn.dataset.cat;
        renderApp();
      };
    });

    // Product detail qty
    if (route.page === 'product') {
      let qty = 1;
      const val = document.getElementById('qty-val');
      const minus = document.getElementById('qty-minus');
      const plus  = document.getElementById('qty-plus');
      const atcBtn = document.getElementById('atc-btn');
      const buyBtn = document.getElementById('buy-btn');
      if (minus) minus.onclick = () => { qty = Math.max(1, qty-1); val.textContent = qty; };
      if (plus)  plus.onclick  = () => { qty++; val.textContent = qty; };
      if (atcBtn) atcBtn.onclick = () => addToCart(atcBtn.dataset.id, qty);
      if (buyBtn) buyBtn.onclick = () => { addToCart(buyBtn.dataset.id, qty); R.navigate('checkout'); };
    }

    // Hero search
    const hsf = document.getElementById('hero-sf');
    if (hsf) hsf.onsubmit = e => {
      e.preventDefault();
      const val = document.getElementById('hero-si').value.trim();
      state.search = val;
      R.navigate(`marketplace${val ? '?q='+encodeURIComponent(val) : ''}`);
    };

    // Request form
    const reqForm = document.getElementById('req-form');
    if (reqForm) reqForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(reqForm);
      const reqs = D.getRequests();
      reqs.unshift({
        id: `r${Date.now()}`,
        description: fd.get('description'),
        budget: Number(fd.get('budget')),
        quantity: Number(fd.get('quantity')),
        urgency: fd.get('urgency'),
        status: 'New',
        createdAt: new Date().toISOString()
      });
      D.setRequests(reqs);
      reqForm.reset();
      alert('Request submitted! Our team will review it and reach out to you.');
    };

    // Cart actions
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const cart = [...D.getCart()];
        const item = cart.find(i => i.productId===id);
        if (action === 'inc') { if(item) item.quantity++; }
        else if (action === 'dec') { if(item) item.quantity--; }
        else if (action === 'rm') { D.setCart(cart.filter(i=>i.productId!==id)); renderApp(); renderNavbar(); return; }
        D.setCart(cart.filter(i=>i.quantity>0));
        renderApp(); renderNavbar();
      };
    });

    // Checkout form
    const coForm = document.getElementById('co-form');
    if (coForm) coForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(coForm);
      const items = enrichCart();
      const subtotal = items.reduce((s,i) => s+i.product.price*i.quantity, 0);
      const order = {
        id: `o${Date.now()}`,
        buyerName: fd.get('fullName'),
        phone: fd.get('phone'),
        address: fd.get('address'),
        city: fd.get('city'),
        state: fd.get('state'),
        paymentMethod: fd.get('paymentMethod'),
        items: items.map(i => ({productId:i.product.id, quantity:i.quantity, price:i.product.price, shopId:i.product.shopId, name:i.product.name})),
        subtotal, deliveryFee: DELIVERY,
        total: subtotal + DELIVERY,
        status: 'New',
        createdAt: new Date().toISOString()
      };
      D.setOrders([order, ...D.getOrders()]);
      D.setCart([]);
      renderNavbar();
      R.navigate('success');
    };

    // Vendor PIN
    const vpinForm = document.getElementById('vpin-form');
    if (vpinForm) vpinForm.onsubmit = e => {
      e.preventDefault();
      const pin = new FormData(vpinForm).get('pin');
      if (pin === '1234') { sessionStorage.setItem('cs_vendor','true'); renderApp(); }
      else alert('Incorrect PIN.');
    };

    // Vendor logout
    document.getElementById('vlogout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('cs_vendor');
      renderApp();
    });

    // Vendor tab switch
    document.querySelectorAll('[data-vtab]').forEach(btn => {
      btn.onclick = () => { sessionStorage.setItem('cs_vtab', btn.dataset.vtab); renderApp(); };
    });

    // Vendor product form
    const vprodForm = document.getElementById('vprod-form');
    if (vprodForm) vprodForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(vprodForm);
      const prods = D.getProducts();
      const idx = prods.findIndex(p => p.id === fd.get('id'));
      const payload = {
        id: fd.get('id') || `p${Date.now()}`,
        shopId: 'shenzhentech',
        category: fd.get('category'),
        name: fd.get('name'),
        price: Number(fd.get('price')),
        rating: Number(fd.get('rating')),
        image: fd.get('image'),
        description: fd.get('description'),
        specs: { Category: fd.get('category'), Condition: 'New', Delivery: 'China Shop', Warranty: 'Store policy' }
      };
      if (idx >= 0) prods[idx] = payload;
      else prods.unshift(payload);
      D.setProducts(prods);
      refreshShopCounts();
      vprodForm.reset();
      renderApp();
    };

    // Vendor edit/delete
    document.querySelectorAll('.vedit-btn').forEach(btn => {
      btn.onclick = () => {
        const p = prodById(btn.dataset.id);
        const f = document.getElementById('vprod-form');
        if (!p || !f) return;
        f.elements.id.value = p.id;
        f.elements.name.value = p.name;
        f.elements.price.value = p.price;
        f.elements.category.value = p.category;
        f.elements.rating.value = p.rating;
        f.elements.image.value = p.image;
        f.elements.description.value = p.description;
        f.scrollIntoView({ behavior:'smooth', block:'start' });
      };
    });
    document.querySelectorAll('[data-delid]').forEach(btn => {
      btn.onclick = () => {
        if (!confirm('Delete this product?')) return;
        D.setProducts(D.getProducts().filter(p => p.id !== btn.dataset.delid));
        refreshShopCounts();
        renderApp();
      };
    });

    // Vendor order status
    document.querySelectorAll('[data-oid]').forEach(sel => {
      sel.onchange = () => {
        const orders = D.getOrders();
        const o = orders.find(x => x.id === sel.dataset.oid);
        if (o) { o.status = sel.value; D.setOrders(orders); }
      };
    });

    // Admin PIN
    const apinForm = document.getElementById('apin-form');
    if (apinForm) apinForm.onsubmit = e => {
      e.preventDefault();
      const pin = new FormData(apinForm).get('pin');
      if (pin === '9999') { sessionStorage.setItem('cs_admin','true'); renderApp(); }
      else alert('Incorrect PIN.');
    };

    // Admin logout
    document.getElementById('alogout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('cs_admin');
      renderApp();
    });
  }

  function refreshShopCounts() {
    const shops = D.getShops().map(s => ({
      ...s, productCount: D.getProducts().filter(p => p.shopId===s.id).length
    }));
    D.setShops(shops);
  }

  window.addEventListener('hashchange', () => { renderNavbar(); renderApp(); });
  window.addEventListener('load', () => { renderNavbar(); renderApp(); });
})();
