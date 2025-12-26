const API = "http://BACKEND_SERVICE/api/products";

function loadProducts() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = "<p class='empty'>No products available</p>";
        return;
      }

      data.forEach(p => {
        list.innerHTML += `
          <div class="product-card">
            <h3>${p.name}</h3>
            <p class="price">₹${p.price}</p>
            <button class="btn-danger" onclick="deleteProduct(${p.id})">
              Delete
            </button>
          </div>
        `;
      });
    });
}

function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  if (!name || !price) {
    alert("Please enter product name and price");
    return;
  }

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  }).then(() => {
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    loadProducts();
  });
}

function deleteProduct(id) {
  fetch(`${API}/${id}`, { method: "DELETE" })
    .then(loadProducts);
}

loadProducts();


