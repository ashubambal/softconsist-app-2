const API = "http://BACKEND_SERVICE/api/products";

function loadProducts() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.forEach(p => {
        list.innerHTML += `
          <div class="product-card">
            <h3>${p.name}</h3>
            <p class="price">₹${p.price}</p>
            <button onclick="addToCart('${p.name}', ${p.price})">
              Add to Cart
            </button>
          </div>
        `;
      });
    });
}

function addToCart(name, price) {
  alert(`${name} added to cart 🛒`);
}

loadProducts();

