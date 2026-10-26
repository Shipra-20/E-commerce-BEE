(() => {
    const KEY = 'velouraCart';
    const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
    const write = items => { localStorage.setItem(KEY, JSON.stringify(items)); render(); };
    const id = p => String(p.id ?? p._id ?? p.name);
    const money = n => window.VelouraUI?.money ? window.VelouraUI.money(n) : `₹${Number(n) || 0}`;
    function render() {
        const items = read();
        const count = items.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
        document.getElementById('cart-count').textContent = count;
        document.getElementById('cart-panel-count').textContent = `(${count})`;
        document.getElementById('cart-subtotal').textContent = money(items.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0));
        const host = document.getElementById('cart-items');
        host.innerHTML = items.length ? items.map(p => `<div class="panel-row"><img src="${p.image || p.imageUrl || p.img || ''}" alt=""><div><h3>${p.name || 'Product'}</h3><p>${money(p.price)}${(Number(p.quantity) || 1) > 1 ? ` × ${p.quantity}` : ''}</p><button data-cart-remove="${id(p)}">Remove</button></div><div><button data-cart-plus="${id(p)}" aria-label="Increase quantity">＋</button><button data-cart-minus="${id(p)}" aria-label="Decrease quantity">−</button></div></div>`).join('') : '<div class="empty-state">Your bag is taking a breather.<br>Add something good to get started.</div>';
    }
    function addItem(product) {
        const items = read(), found = items.find(p => id(p) === id(product));
        if (found) found.quantity = (Number(found.quantity) || 1) + 1; else items.push({ ...product, quantity: 1 });
        write(items);
    }
    function open() { document.getElementById('cart-panel').classList.add('open'); document.getElementById('panel-scrim').classList.add('open'); }
    document.getElementById('cart-items').addEventListener('click', e => {
        const remove = e.target.closest('[data-cart-remove]'), plus = e.target.closest('[data-cart-plus]'), minus = e.target.closest('[data-cart-minus]');
        let items = read();
        if (remove) items = items.filter(p => id(p) !== remove.dataset.cartRemove);
        if (plus) items = items.map(p => id(p) === plus.dataset.cartPlus ? { ...p, quantity: (Number(p.quantity) || 1) + 1 } : p);
        if (minus) items = items.map(p => id(p) === minus.dataset.cartMinus ? { ...p, quantity: (Number(p.quantity) || 1) - 1 } : p).filter(p => (Number(p.quantity) || 0) > 0);
        write(items);
    });
    window.VelouraCart = { addItem, open, getItems: read, render };
    render();
})();