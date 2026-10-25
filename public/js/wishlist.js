const WISHLIST_KEY = "velouraWishlist";

function getSavedItems() {
    try {
        const value = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(items)]));
    renderWishlist();

    if (window.renderProducts) window.renderProducts();
}

function toggleWishlist(id) {
    const items = getSavedItems();

    if (items.includes(id)) {
        saveWishlist(items.filter(item => item !== id));
        window.showToast("Removed from your wishlist.");
    } else {
        saveWishlist([...items, id]);
        window.showToast("Saved to your wishlist ♥");
    }
}

function renderWishlist() {
    const products = window.velouraProducts();
    const items = getSavedItems().filter(id =>
        products.some(product => product.id === id)
    );

    document.getElementById("wishlistCount").textContent = items.length;

    document.getElementById("wishlistItems").innerHTML = items.length
        ? items.map(id => {
            const product = products.find(p => p.id === id);

            return `
          <article class="drawer-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p>${window.money(product.price)}</p>
              <button data-wish-action="add" data-id="${id}">Move to bag</button>
              <br>
              <button data-wish-action="remove" data-id="${id}">Remove</button>
            </div>
          </article>`;
        }).join("")
        : '<div class="drawer-empty">Your wishlist is a little empty. Save something you love!</div>';

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

document.getElementById("productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-action='wishlist']");
    if (button) toggleWishlist(Number(button.dataset.id));
});

document.getElementById("wishlistItems").addEventListener("click", event => {
    const button = event.target.closest("[data-wish-action]");
    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.wishAction === "remove") {
        toggleWishlist(id);
    } else if (button.dataset.wishAction === "add") {
        window.addToCart(id);
        saveWishlist(getSavedItems().filter(item => item !== id));
    }
});

document.getElementById("wishlistToggle").addEventListener("click", () => {
    window.openDrawer("wishlistDrawer");
});

document.getElementById("wishlistShopBtn").addEventListener("click", () => {
    window.closeDrawers();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

window.renderWishlist = renderWishlist;

// Shared drawer controls for both panels.
window.openDrawer = function (id) {
    document.querySelectorAll(".drawer").forEach(drawer => {
        const isActive = drawer.id === id;
        drawer.classList.toggle("open", isActive);
        drawer.setAttribute("aria-hidden", String(!isActive));
    });

    document.body.classList.add("drawer-open");
};

window.closeDrawers = function () {
    document.querySelectorAll(".drawer").forEach(drawer => {
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
    });

    document.body.classList.remove("drawer-open");
};

renderWishlist();