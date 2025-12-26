/* Shared interactive behavior: products, cart, modal, auth, fixes for broken characters and cart sync */

/* Product data (sample) */
const products = [
  { id:1, title:"Minimal Wallet", price:799, img:"https://images.unsplash.com/photo-1526178616913-3f3b6f6b3b2b?q=80&w=800&auto=format&fit=crop", desc:"Slim leather wallet" },
  { id:2, title:"Wireless Earbuds", price:2499, img:"https://images.unsplash.com/photo-1585386959984-a415522b3d4b?q=80&w=800&auto=format&fit=crop", desc:"Noise cancelling" },
  { id:3, title:"Smart Bottle", price:1299, img:"https://images.unsplash.com/photo-1542293787938-c9e299b880b3?q=80&w=800&auto=format&fit=crop", desc:"Keeps drinks cold" },
  { id:4, title:"Sleek Backpack", price:3499, img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", desc:"Everyday carry" },
  { id:5, title:"Daily Sneakers", price:3999, img:"https://images.unsplash.com/photo-1528701800489-476f6f3f0b1b?q=80&w=800&auto=format&fit=crop", desc:"Comfort first" },
  { id:6, title:"Desk Lamp", price:1599, img:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop", desc:"Warm LED light" }
];

const CART_KEY = 'softconsist_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

/* Save cart and update UI */
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* Update cart count in header and mobile nav */
function updateCartCount(){
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cart-count');
  const elMobile = document.getElementById('cart-count-mobile');
  const elHeader = document.querySelectorAll('#cart-count');
  if(el) el.textContent = count;
  if(elMobile) elMobile.textContent = count;
  // update any duplicate cart-count elements
  elHeader.forEach(node => node.textContent = count);
}

/* Format INR */
function formatINR(n){ return '₹' + n.toLocaleString('en-IN'); }

/* Render product cards on index */
function renderProducts(){
  const grid = document.querySelector('.products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <div>
        <div class="meta">
          <div>
            <div style="font-weight:800">${escapeHtml(p.title)}</div>
            <div class="muted" style="font-size:0.9rem">Fast delivery • 4.7 ★</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatINR(p.price)}</div>
            <div class="badge">Limited</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn primary" data-add="${p.id}">Add</button>
          <button class="btn ghost" data-view="${p.id}">Quick view</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* Add to cart */
function addToCart(id, qty=1){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  if(!cart[id]) cart[id] = { ...p, qty:0 };
  cart[id].qty += qty;
  saveCart();
  animateAdd();
}

/* Small animation on add */
function animateAdd(){
  const link = document.getElementById('cart-link');
  if(!link) return;
  link.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:300});
}

/* Modal open/close */
function openModal(id){
  const p = products.find(x=>x.id===id);
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('modal-body');
  if(!p || !modal || !body) return;
  body.innerHTML = `
    <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
      <img src="${p.img}" style="width:320px;height:220px;object-fit:cover;border-radius:12px" alt="${escapeHtml(p.title)}" />
      <div style="flex:1;min-width:220px">
        <h3 id="modal-title">${escapeHtml(p.title)}</h3>
        <p class="muted">${escapeHtml(p.desc || '')}</p>
        <div style="font-weight:800;margin:12px 0">${formatINR(p.price)}</div>
        <div style="display:flex;gap:8px">
          <button class="btn primary" id="modal-add">Add to cart</button>
          <button class="btn ghost" id="modal-close-btn">Close</button>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');

  document.getElementById('modal-add').addEventListener('click', ()=>{
    addToCart(p.id);
    closeModal();
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
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
      <img src="${item.img}" alt="${escapeHtml(item.title)}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:800">${escapeHtml(item.title)}</div>
            <div class="muted">Seller • 2 days</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:800">${formatINR(item.price)}</div>
            <button class="btn ghost remove-btn" data-remove="${item.id}">Remove</button>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
          <div class="qty">
            <button class="qty-btn" data-change="${item.id}" data-delta="-1">−</button>
            <div style="min-width:36px;text-align:center">${item.qty}</div>
            <button class="qty-btn" data-change="${item.id}" data-delta="1">+</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
  // attach handlers
  container.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-change');
      const delta = Number(e.currentTarget.getAttribute('data-delta'));
      changeQty(Number(id), delta);
    });
  });
  container.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-remove'));
      removeItem(id);
    });
  });
  updateSummary();
}

/* Change quantity */
function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart();
  renderCartPage();
}

/* Remove item */
function removeItem(id){
  delete cart[id];
  saveCart();
  renderCartPage();
}

/* Update summary */
function updateSummary(){
  const subtotalEl = document.getElementById('subtotal');
[O  const deliveryEl = document.getElementById('delivery');
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
  const email = document.getElementById('login-email').value.trim();
  const name = email.split('@')[0] || 'User';
  localStorage.setItem('softconsist_user', JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function handleSignup(e){
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const name = document.getElementById('signup-name').value.trim() || email.split('@')[0];
  localStorage.setItem('softconsist_user', JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function social(provider){
  alert('Social login demo: ' + provider);
}

/* Profile rendering */
function renderProfile(){
  const user = JSON.parse(localStorage.getItem('softconsist_user') || 'null');
  if(!user) return;
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatar = document.getElementById('avatar');
  if(nameEl) nameEl.textContent = user.name;
  if(emailEl) emailEl.textContent = user.email;
  if(avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
}

/* Logout */
function logout(){
  localStorage.removeItem('softconsist_user');
  window.location.href = 'index.html';
}

/* Escape HTML to avoid injection when inserting text */
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
  });
}

/* Mobile nav toggle */
function setupMobileNav(){
  const btn = document.getElementById('hamburger');
  const mobile = document.getElementById('mobile-nav');
  if(!btn || !mobile) return;
  btn.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    mobile.setAttribute('aria-hidden', String(expanded));
  });
}

/* Modal close button */
function setupModalClose(){
  const close = document.getElementById('modal-close');
  if(close) close.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });
}

/* Wire up product buttons (delegation) */
function setupProductDelegation(){
  document.addEventListener('click', (e)=>{
    const add = e.target.closest('[data-add]');
    if(add){
      const id = Number(add.getAttribute('data-add'));
      addToCart(id);
      return;
    }
    const view = e.target.closest('[data-view]');
    if(view){
      const id = Number(view.getAttribute('data-view'));
      openModal(id);
      return;
    }
  });
}

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', ()=>{
  // render where appropriate
  renderProducts();
  updateCartCount();
  renderCartPage();
  renderProfile();

  // year
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // setup UI helpers
  setupMobileNav();
  setupModalClose();
  setupProductDelegation();

  // attach checkout button (demo)
  const checkout = document.getElementById('checkout-btn');
  if(checkout) checkout.addEventListener('click', ()=> alert('Checkout demo — integrate your payment flow.'));

  // ensure cart-count elements on pages are synced
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = Object.values(cart).reduce((s,i)=>s+i.qty,0));
});
