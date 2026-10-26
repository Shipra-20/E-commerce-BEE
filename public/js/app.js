(() => {
    const grid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const filterButtons = document.getElementById('filter-buttons');
    const countLabel = document.getElementById('product-total');
    let products = [], activeCategory = 'all', searchTerm = '';
    const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const imageFor = p => p.image || p.imageUrl || p.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80';
    const idFor = p => String(p.id ?? p._id ?? p.name);
    const categoryFor = p => String(p.category || 'Accessories');
    function notify(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message; toast.classList.add('show');
        clearTimeout(window.velouraToastTimer);
        window.velouraToastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }
    window.velouraNotify = notify;
    function filteredProducts() {
        let result = products.filter(p => {
            const category = categoryFor(p).toLowerCase();
            const matchesCategory = activeCategory === 'all' || category.includes(activeCategory.toLowerCase()) ||
                (activeCategory === 'Fashion' && /fashion|clothing|apparel|wear|style/.test(category)) ||
                (activeCategory === 'Home' && /home|living|decor/.test(category)) ||
                (activeCategory === 'Accessories' && /accessor|bag|tech|jewel/.test(category));
            const haystack = `${p.name || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase();
            return matchesCategory && haystack.includes(searchTerm);
        });
        const sort = sortSelect.value;
        if (sort === 'low') result.sort((a, b) => (+a.price || 0) - (+b.price || 0));
        if (sort === 'high') result.sort((a, b) => (+b.price || 0) - (+a.price || 0));
        if (sort === 'name') result.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        return result;
    }
    function render() {
        const list = filteredProducts();
        countLabel.textContent = `CURATED FINDS / ${String(list.length).padStart(2, '0')}`;
        if (!list.length) {
            grid.innerHTML = '<div class="empty-state">Nothing in this edit yet.<br>Try another search or category.</div>';
            return;
        }
        const saved = window.VelouraWishlist?.getItems?.() || JSON.parse(localStorage.getItem('velouraWishlist') || '[]');
        grid.innerHTML = list.map((p, i) => {
            const id = idFor(p), isSaved = saved.some(x => String(x.id ?? x._id ?? x.name) === id);
            return `<article class="product-card">
        <div class="product-image-wrap"><img loading="lazy" src="${safe(imageFor(p))}" alt="${safe(p.name || 'Product')}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'">
        <span class="product-index">${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}</span>
        <button class="save-btn ${isSaved ? 'saved' : ''}" data-save="${safe(id)}" aria-label="Save ${safe(p.name)}">${isSaved ? '♥' : '♡'}</button>
        <button class="quick-add" data-add="${safe(id)}">ADD TO BAG ＋</button></div>
        <div class="product-info"><div class="product-meta"><h3 class="product-name">${safe(p.name || 'Untitled find')}</h3><span class="product-price">${money(p.price)}</span></div><div class="product-category">${safe(categoryFor(p))}</div></div>
      </article>`;
        }).join('');
    }
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error(`Products request failed (${response.status})`);
            const data = await response.json();
            products = Array.isArray(data) ? data : (data.products || data.data || []);
            render();
        } catch (error) {
            console.error(error);
            grid.innerHTML = '<div class="empty-state">Could not load products from <code>/api/products</code>.<br>Check that your Node.js server is running.</div>';
            countLabel.textContent = 'PRODUCT FEED / OFFLINE';
        }
    }
    searchInput.addEventListener('input', e => { searchTerm = e.target.value.trim().toLowerCase(); render(); });
    sortSelect.addEventListener('change', render);
    filterButtons.addEventListener('click', e => {
        const button = e.target.closest('[data-filter]'); if (!button) return;
        activeCategory = button.dataset.filter;
        filterButtons.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
        render();
    });
    document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
        activeCategory = button.dataset.category;
        filterButtons.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.filter === activeCategory));
        document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
        render();
    }));
    grid.addEventListener('click', e => {
        const add = e.target.closest('[data-add]');
        const save = e.target.closest('[data-save]');
        if (add) {
            const p = products.find(item => idFor(item) === add.dataset.add);
            if (p) { window.VelouraCart?.addItem(p); notify('Added to your bag ✳'); }
        }
        if (save) {
            const p = products.find(item => idFor(item) === save.dataset.save);
            if (p) { window.VelouraWishlist?.toggleItem(p); render(); notify('Saved for later ♡'); }
        }
    });
    document.getElementById('search-focus').addEventListener('click', () => { document.getElementById('shop').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => searchInput.focus(), 350); });
    document.getElementById('open-cart').addEventListener('click', () => window.VelouraCart?.open());
    document.getElementById('open-wishlist').addEventListener('click', () => window.VelouraWishlist?.open());
    document.getElementById('checkout-btn').addEventListener('click', () => notify('Checkout demo — payment is not connected yet.'));
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open')); document.getElementById('panel-scrim').classList.remove('open'); }));
    document.getElementById('panel-scrim').addEventListener('click', () => { document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open')); document.getElementById('panel-scrim').classList.remove('open'); });
    window.VelouraUI = { money, notify, render };
    // Reflect common auth storage conventions without changing the backend.
    const token = localStorage.getItem('velouraToken') || localStorage.getItem('token');
    const userRaw = localStorage.getItem('velouraUser') || localStorage.getItem('user');
    if (token && userRaw) {
        try { const user = JSON.parse(userRaw); const name = user.name || user.username || 'Account'; const link = document.getElementById('account-link'); link.textContent = `${name} ↗`; link.href = '#'; link.addEventListener('click', e => { e.preventDefault(); if (confirm('Log out of Veloura?')) { localStorage.removeItem('velouraToken'); localStorage.removeItem('velouraUser'); localStorage.removeItem('token'); localStorage.removeItem('user'); location.reload(); } }); } catch { }
    }
    loadProducts();
})();