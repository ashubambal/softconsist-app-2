const API = "/api/products";

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
            <div class="price">₹${p.price}</div>
            <button>Add to Cart</button>
          </div>
        `;
      });
    });
}

loadProducts();

