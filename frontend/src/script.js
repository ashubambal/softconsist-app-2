// Lightweight product demo and cart logic
const products = [
  { id:1, title:"Minimal Wallet", price:799, img:"https://images.unsplash.com/photo-1526178616913-3f3b6f6b3b2b?q=80&w=800&auto=format&fit=crop" },
  { id:2, title:"Wireless Earbuds", price:2499, img:"https://images.unsplash.com/photo-1585386959984-a415522b3d4b?q=80&w=800&auto=format&fit=crop" },
  { id:3, title:"Smart Bottle", price:1299, img:"https://images.unsplash.com/photo-1542293787938-c9e299b880b3?q=80&w=800&auto=format&fit=crop" },
  { id:4, title:"Sleek Backpack", price:3499, img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop" },
  { id:5, title:"Daily Sneakers", price:3999, img:"https://images.unsplash.com/photo-1528701800489-476f6f3f0b1b?q=80&w=800&auto=format&fit=crop" },
  { id:6, title:"Desk Lamp", price:1599, img:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop" }
];

const CART_KEY = 'shoply_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cart-count');
  if(el) el.textContent = count;
}

function formatINR(n){ return '₹' + n.toLocaleString('en-IN'); }

function renderProducts(){
  const grid = document.querySelector('.products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" loading="lazy" />
      <div>
        <div class="meta">
          <div>
            <div style="font-weight:800">${p.title}</div>
            <div class="muted" style="font-size:0.9rem">Fast delivery • 4.7 ★</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatINR(p.price)}</div>
            <div class="badge">Limited</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn primary" onclick="addToCart(${p.id})">Add</button>
          <button class="btn ghost" onclick="openModal(${p.id})">Quick view</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addToCart(id, qty=1){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  if(!cart[id]) cart[id] = { ...p, qty:0 };
  cart[id].qty += qty;
  saveCart();
  animateAdd();
}

function animateAdd(){
  const link = document.getElementById('cart-link');
  if(!link) return;
  link.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:300});
}

function openModal(id){
  const p = products.find(x=>x.id===id);
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('modal-body');
  if(!p || !modal || !body) return;
  body.innerHTML = `
    <div style="display:flex;gap:18px;align-items:center">
      <img src="${p.img}" style="width:320px;height:220px;object-fit:cover;border-radius:12px" />
      <div style="flex:1">
        <h3>${p.title}</h3>
        <p class="muted">High quality, curated for everyday use.</p>
        <div style="font-weight:800;margin:12px 0">${formatINR(p.price)}</div>
        <div style="display:flex;gap:8px">
          <button class="btn primary" onclick="addToCart(${p.id});closeModal()">Add to cart</button>
          <button class="btn ghost" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = document.getElementById('product-modal');
  if(modal) modal.setAttribute('aria-hidden','true');
}

/* Cart page rendering */
function renderCartPage(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  container.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length===0){
    container.innerHTML = `<div class="muted">Your cart is empty. Add something delightful.</div>`;
    updateSummary();
    return;
  }
  ids.forEach(id=>{
    const item = cart[id];
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.img}" alt="${item.title}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:800">${item.title}</div>
            <div class="muted">Seller • 2 days</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:800">${formatINR(item.price)}</div>
            <button class="btn ghost" onclick="removeItem(${item.id})">Remove</button>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
          <div class="qty">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <div style="min-width:36px;text-align:center">${item.qty}</div>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
  updateSummary();
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart();
  renderCartPage();
}

function removeItem(id){
  delete cart[id];
  saveCart();
  renderCartPage();
}

function updateSummary(){
  const subtotalEl = document.getElementById('subtotal');
  const deliveryEl = document.getElementById('delivery');
  const totalEl = document.getElementById('total');
  const subtotal = Object.values(cart).reduce((s,i)=>s + i.price * i.qty, 0);
  const delivery = subtotal > 1999 || subtotal===0 ? 0 : 99;
  const total = subtotal + delivery;
  if(subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if(deliveryEl) deliveryEl.textContent = formatINR(delivery);
  if(totalEl) totalEl.textContent = formatINR(total);
}

/* Auth handlers (demo only) */
function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const name = email.split('@')[0] || 'User';
  localStorage.setItem('shoply_user', JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function handleSignup(e){
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const name = document.getElementById('signup-name').value || email.split('@')[0];
  localStorage.setItem('shoply_user', JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function social(provider){
  alert('Social login demo: ' + provider);
}

/* Profile rendering */
function renderProfile(){
  const user = JSON.parse(localStorage.getItem('shoply_user') || 'null');
  if(!user) return;
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatar = document.getElementById('avatar');
  if(nameEl) nameEl.textContent = user.name;
  if(emailEl) emailEl.textContent = user.email;
  if(avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
}

/* Utilities */
function logout(){
  localStorage.removeItem('shoply_user');
  window.location.href = 'index.html';
}

/* Init */
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartCount();
  renderCartPage();
  renderProfile();
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
});
