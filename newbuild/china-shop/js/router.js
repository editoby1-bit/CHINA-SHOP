(function () {
  function parseHash() {
    const raw = location.hash || '#home';
    const [pathPart, queryString] = raw.split('?');
    const path = pathPart.replace(/^#/, '') || 'home';
    const query = Object.fromEntries(new URLSearchParams(queryString || ''));
    return { path, query };
  }

  function getRoute() {
    const { path, query } = parseHash();
    const clean = path.replace(/^\//, '');
    const segments = clean.split('/').filter(Boolean);

    if (!segments.length || segments[0] === 'home') return { page: 'home', params: {}, query };
    if (segments[0] === 'marketplace') return { page: 'marketplace', params: {}, query };
    if (segments[0] === 'shops') return { page: 'shops', params: {}, query };
    if (segments[0] === 'shop' && segments[1]) return { page: 'shop', params: { id: segments[1] }, query };
    if (segments[0] === 'product' && segments[1]) return { page: 'product', params: { id: segments[1] }, query };
    if (segments[0] === 'request') return { page: 'request', params: {}, query };
    if (segments[0] === 'cart') return { page: 'cart', params: {}, query };
    if (segments[0] === 'checkout') return { page: 'checkout', params: {}, query };
    if (segments[0] === 'vendor') return { page: 'vendor', params: {}, query };
    if (segments[0] === 'admin') return { page: 'admin', params: {}, query };
    if (segments[0] === 'success') return { page: 'success', params: {}, query };
    return { page: 'notfound', params: {}, query };
  }

  function navigate(hash) {
    location.hash = hash.startsWith('#') ? hash : `#${hash}`;
  }

  window.ChinaShopRouter = { getRoute, navigate };
})();
