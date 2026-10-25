const CART_KEY = "velouraCart";

function readCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
}

function addToCart(id) {
    const cart = readCart();
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity = Math.min(99, existing.quantity + 1);
    } else {
        cart.push({ id, quantity: 1 });
    }

    saveCart(cart);
    window.showToast("Added to your bag!");
}

function changeQuantity(id, change) {
    const cart = readCart();
    const item = cart.find(entry => entry.id === id);

    if (!item) return;

    item.quantity += change;

    const updated = cart.filter(entry =>
        entry.id !== id && entry.quantity > 0
    );

    if (item.quantity > 0) updated.push(item);
    saveCart(updated);
}

function removeFromCart(id) {
    saveCart(readCart().filter(item => item.id !== id));
    window.showToast("Item removed from your bag.");
}

function renderCart() {
    const products = window.velouraProducts();
    const cart = readCart();

    const validCart = cart.filter(item =>
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );

    document.getElementById("cartCount").textContent =
        validCart.reduce((sum, item) => sum + item.quantity, 0);

    const itemsElement = document.getElementById("cartItems");

    itemsElement.innerHTML = validCart.length
        ? validCart.map(item => {
            const product = products.find(p => p.id === item.id);

            return `
          <article class="drawer-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p>${window.money(product.price)}</p>
              <div class="quantity-control">
                <button data-cart-action="minus" data-id="${item.id}"
                        aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button data-cart-action="plus" data-id="${item.id}"
                        aria-label="Increase quantity"
                        ${item.quantity >= 99 ? "disabled" : ""}>+</button>
              </div>
              <button data-cart-action="remove" data-id="${item.id}">Remove</button>
            </div>
            <strong>${window.money(product.price * item.quantity)}</strong>
          </article>`;
        }).join("")
        : '<div class="drawer-empty">Your bag is waiting for something lovely.</div>';

    const total = validCart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + product.price * item.quantity;
    }, 0);

    document.getElementById("cartSubtotal").textContent = window.money(total);

    if (JSON.stringify(cart) !== JSON.stringify(validCart)) {
        localStorage.setItem(CART_KEY, JSON.stringify(validCart));
    }
}

document.getElementById("productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-action='add']");
    if (button) addToCart(Number(button.dataset.id));
});

document.getElementById("cartItems").addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.cartAction;

    if (action === "minus") changeQuantity(id, -1);
    if (action === "plus") changeQuantity(id, 1);
    if (action === "remove") removeFromCart(id);
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
    const cart = readCart();

    if (!cart.length) {
        window.showToast("Your bag is empty.");
        return;
    }

    if (!localStorage.getItem("velouraToken")) {
        window.showToast("Please sign in before checkout.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 700);
        return;
    }

    window.showToast("Demo only: payment and order placement are not connected.");
});

window.renderCart = renderCart;
window.readCart = readCart;
window.addToCart = addToCart;

document.getElementById("cartToggle").addEventListener("click", () => {
    window.openDrawer("cartDrawer");
});

document.querySelectorAll("[data-close-drawer]").forEach(button => {
    button.addEventListener("click", window.closeDrawers);
});

document.getElementById("drawerBackdrop").addEventListener(
    "click", window.closeDrawers
);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") window.closeDrawers();
});

renderCart();