const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const sortSelect = document.getElementById("sortSelect");
const categoryFilters = document.getElementById("categoryFilters");
const resultCount = document.getElementById("resultCount");

let products = [];
let activeCategory = "All";
let toastTimer;

const money = amount =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) throw new Error("Product request failed");

        products = await response.json();
        renderProducts();
    } catch (error) {
        grid.innerHTML =
            '<p class="empty-state">Could not load products. Please refresh the page.</p>';
    }
}

function getWishlist() {
    try {
        const value = JSON.parse(localStorage.getItem("velouraWishlist") || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const sort = sortSelect.value;
    let filtered = products.filter(product => {
        const matchesCategory =
            activeCategory === "All" || product.category === activeCategory;

        const matchesSearch =
            `${product.name} ${product.category}`.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "find" : "finds"}`;
    clearSearch.hidden = !searchInput.value;

    if (!filtered.length) {
        grid.innerHTML = `
      <div class="empty-state">
        <h3>Nothing here just yet.</h3>
        <p>Try another search or category.</p>
      </div>`;
        return;
    }

    const wishlist = getWishlist();

    grid.innerHTML = filtered.map(product => {
        const saved = wishlist.includes(product.id);

        return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img class="product-image"
               src="${product.image}"
               alt="${product.name}"
               loading="lazy">
          ${product.badge
                ? `<span class="product-badge">${product.badge}</span>`
                : ""}
          <button class="heart-btn ${saved ? "active" : ""}"
                  data-action="wishlist"
                  data-id="${product.id}"
                  aria-label="${saved ? "Remove from" : "Add to"} wishlist"
                  aria-pressed="${saved}">
            ${saved ? "♥" : "♡"}
          </button>
          <button class="quick-add" data-action="add" data-id="${product.id}">
            Add to bag — ${money(product.price)}
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-name">${product.name}</h3>
          <span class="product-rating">★ ${product.rating.toFixed(1)}</span>
          <div class="product-price">
            ${money(product.price)}
            <span class="old-price">${money(product.oldPrice)}</span>
          </div>
        </div>
      </article>`;
    }).join("");
}

function setCategory(category) {
    activeCategory = category;

    categoryFilters.querySelectorAll("[data-category]").forEach(button => {
        const active = button.dataset.category === category;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    renderProducts();
}

categoryFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
});

document.querySelectorAll("[data-nav-category]").forEach(link => {
    link.addEventListener("click", () => {
        setCategory(link.dataset.navCategory);
    });
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderProducts();
    searchInput.focus();
});

document.getElementById("searchToggle").addEventListener("click", () => {
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    searchInput.focus({ preventScroll: true });
});

document.getElementById("newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("newsletterMessage").textContent =
        "Thanks for your interest! Newsletter signup is a demo feature.";
    event.target.reset();
});

document.getElementById("accountLink").addEventListener("click", event => {
    if (localStorage.getItem("velouraToken")) {
        event.preventDefault();

        if (confirm("Sign out of Veloura?")) {
            localStorage.removeItem("velouraToken");
            localStorage.removeItem("velouraUser");
            updateAccountLink();
            showToast("You have signed out.");
        }
    }
});

function updateAccountLink() {
    const link = document.getElementById("accountLink");
    const user = JSON.parse(localStorage.getItem("velouraUser") || "null");

    if (localStorage.getItem("velouraToken") && user) {
        link.textContent = "Hi, " + user.name.split(" ")[0];
        link.href = "#";
    } else {
        link.textContent = "Sign in";
        link.href = "login.html";
    }
}

window.renderProducts = renderProducts;
window.showToast = showToast;
window.money = money;
window.velouraProducts = () => products;

updateAccountLink();
loadProducts();