(() => {
    const KEY = 'velouraWishlist';
    const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } };
    const id = p => String(p.id ?? p._id ?? p.name);
    const money = n => window.VelouraUI?.money ? window.VelouraUI.money(n) : `₹${Number(n) || 0}`;
    function render() {
        const items = read();
        document.getElementById('wishlist-count').textContent = items.length;
        document.getElementById('wishlist-panel-count').textContent = `(${items.length})`;
        const host = document.getElementById('wishlist-items');
        host.innerHTML = items.length ? items.map(p => `<div class="panel-row"><img src="${p.image || p.imageUrl || p.img || ''}" alt=""><div><h3>${p.name || 'Product'}</h3><p>${money(p.price)}</p><button data-wish-remove="${id(p)}">Remove from saved</button></div><button data-wish-add="${id(p)}" aria-label="Add to bag">＋</button></div>`).join('') : '<div class="empty-state">Nothing saved yet.<br>Keep the things you love close.</div>';
    }
    function toggleItem(product) { const items = read(), exists = items.some(p => id(p) === id(product)); localStorage.setItem(KEY, JSON.stringify(exists ? items.filter(p => id(p) !== id(product)) : [...items, product])); render(); }
    function open() { document.getElementById('wishlist-panel').classList.add('open'); document.getElementById('panel-scrim').classList.add('open'); }
    document.getElementById('wishlist-items').addEventListener('click', e => {
        const remove = e.target.closest('[data-wish-remove]'), add = e.target.closest('[data-wish-add]');
        if (remove) { localStorage.setItem(KEY, JSON.stringify(read().filter(p => id(p) !== remove.dataset.wishRemove))); render(); window.VelouraUI?.render(); }
        if (add) { const p = read().find(p => id(p) === add.dataset.wishAdd); if (p) { window.VelouraCart?.addItem(p); window.VelouraUI?.notify('Added to your bag ✳'); } }
    });
    window.VelouraWishlist = { toggleItem, open, getItems: read, render };
    render();
})();