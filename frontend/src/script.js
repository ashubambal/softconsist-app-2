/* Updated script.js
   - Consolidated product, cart, explore, hire, jobs, community logic
   - Safe DOM injection, event delegation, persistence, accessibility
   - Save as script.js (UTF-8)
*/

/* -------------------------
   Data and storage keys
   ------------------------- */
const PRODUCTS = [
  { id:1, title:"Minimal Wallet", price:799, img:"https://images.unsplash.com/photo-1526178616913-3f3b6f6b3b2b?q=80&w=800&auto=format&fit=crop", desc:"Slim leather wallet" },
  { id:2, title:"Wireless Earbuds", price:2499, img:"https://images.unsplash.com/photo-1585386959984-a415522b3d4b?q=80&w=800&auto=format&fit=crop", desc:"Noise cancelling" },
  { id:3, title:"Smart Bottle", price:1299, img:"https://images.unsplash.com/photo-1542293787938-c9e299b880b3?q=80&w=800&auto=format&fit=crop", desc:"Keeps drinks cold" },
  { id:4, title:"Sleek Backpack", price:3499, img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", desc:"Everyday carry" },
  { id:5, title:"Daily Sneakers", price:3999, img:"https://images.unsplash.com/photo-1528701800489-476f6f3f0b1b?q=80&w=800&auto=format&fit=crop", desc:"Comfort first" },
  { id:6, title:"Desk Lamp", price:1599, img:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop", desc:"Warm LED light" }
];

const TALENT = [
  { id:101, name:"Aisha Kapoor", role:"Frontend Engineer", skills:["React","TypeScript"], location:"Pune", rate:"₹80/hr", avatar:"AK" },
  { id:102, name:"Rohit Sharma", role:"Product Designer", skills:["Figma","UX"], location:"Mumbai", rate:"₹120/hr", avatar:"RS" },
  { id:103, name:"Meera Iyer", role:"Backend Engineer", skills:["Node","Postgres"], location:"Bengaluru", rate:"₹90/hr", avatar:"MI" }
];

const JOBS = [
  { id:201, title:"Frontend Developer", company:"Nova Labs", type:"Full-time", location:"Remote", salary:"₹8-12 LPA", desc:"Build delightful UIs." },
  { id:202, title:"Product Designer", company:"PixelWorks", type:"Contract", location:"Mumbai", salary:"₹40k/month", desc:"Design product flows." }
];

const CART_KEY = 'softconsist_cart_v2';
const SHORTLIST_KEY = 'softconsist_shortlist_v1';
const FEED_KEY = 'softconsist_feed_v1';
const USER_KEY = 'softconsist_user';

/* -------------------------
   State
   ------------------------- */
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
let shortlist = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
let feed = JSON.parse(localStorage.getItem(FEED_KEY) || '[]');

/* -------------------------
   Utilities
   ------------------------- */
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function persistShortlist(){ localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist)); }
function persistFeed(){ localStorage.setItem(FEED_KEY, JSON.stringify(feed)); }
function formatINR(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* -------------------------
   Cart functions
   ------------------------- */
function addToCart(id, qty = 1){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  if(!cart[id]) cart[id] = { ...p, qty: 0 };
  cart[id].qty += qty;
  saveCart();
  flashCart();
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

function updateCartCount(){
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function flashCart(){
  const el = document.getElementById('cart-link');
  if(!el) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 260 });
}

/* -------------------------
   Rendering functions
   ------------------------- */
function renderProducts(){
  const grid = document.getElementById('products') || document.querySelector('.products-grid') || document.getElementById('explore-grid');
  if(!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <div>
        <div class="meta">
          <div>
            <div style="font-weight:800">${escapeHtml(p.title)}</div>
            <div class="muted" style="font-size:0.9rem">${escapeHtml(p.desc || 'Popular item')}</div>
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

/* Cart page rendering */
function renderCartPage(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  container.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length === 0){
    container.innerHTML = `<div class="muted">Your cart is empty. Add something delightful.</div>`;
    updateSummary();
    return;
  }
  ids.forEach(id => {
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
      const id = Number(e.currentTarget.getAttribute('data-change'));
      const delta = Number(e.currentTarget.getAttribute('data-delta'));
      changeQty(id, delta);
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

function updateSummary(){
  const subtotalEl = document.getElementById('subtotal');
  const deliveryEl = document.getElementById('delivery');
  const totalEl = document.getElementById('total');
  const subtotal = Object.values(cart).reduce((s,i)=>s + i.price * i.qty, 0);
  const delivery = subtotal > 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + delivery;
  if(subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if(deliveryEl) deliveryEl.textContent = formatINR(delivery);
  if(totalEl) totalEl.textContent = formatINR(total);
}

/* -------------------------
   Modal functions
   ------------------------- */
function openModal(id){
  const p = PRODUCTS.find(x => x.id === id);
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

/* -------------------------
   Explore / Hire / Jobs / Community
   ------------------------- */
function openTab(name){
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => {
    const id = p.id.replace('panel-','');
    const show = id === name;
    p.classList.toggle('hidden', !show);
    p.setAttribute('aria-hidden', String(!show));
  });
  setTimeout(()=> {
    const panel = document.getElementById('panel-' + name);
    if(panel) {
      const input = panel.querySelector('input, textarea, select');
      if(input) input.focus();
    }
  }, 120);
}

/* Explore rendering uses renderProducts or renderExplore */
function renderExplore(){
  const grid = document.getElementById('explore-grid');
  if(!grid) return renderProducts();
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <div>
        <div class="meta">
          <div>
            <div style="font-weight:800">${escapeHtml(p.title)}</div>
            <div class="muted" style="font-size:0.9rem">${escapeHtml(p.desc || '')}</div>
          </div>
          <div style="text-align:right">
            <div class="price">${formatINR(p.price)}</div>
            <div class="badge">Explore</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn primary" data-add="${p.id}">Add</button>
          <button class="btn ghost" data-view="${p.id}">Quick view</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });
}

/* Talent list and shortlist */
function renderTalent(filter = ''){
  const list = document.getElementById('talent-list');
  if(!list) return;
  list.innerHTML = '';
  const q = (filter || '').toLowerCase();
  TALENT.filter(t => !q || (t.name + ' ' + t.role + ' ' + t.skills.join(' ')).toLowerCase().includes(q))
    .forEach(t => {
      const el = document.createElement('div');
      el.className = 'talent-card';
      el.innerHTML = `
        <div class="talent-avatar">${escapeHtml(t.avatar)}</div>
        <div class="talent-meta">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:800">${escapeHtml(t.name)}</div>
              <div class="muted">${escapeHtml(t.role)} • ${escapeHtml(t.location)}</div>
              <div class="muted" style="font-size:0.85rem">Skills: ${escapeHtml(t.skills.join(', '))}</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:800">${escapeHtml(t.rate)}</div>
            </div>
          </div>
        </div>
        <div class="talent-actions">
          <button class="btn primary" data-hire="${t.id}">Hire</button>
          <button class="btn ghost" data-shortlist="${t.id}">${shortlist.includes(t.id) ? 'Shortlisted' : 'Shortlist'}</button>
        </div>
      `;
      list.appendChild(el);
    });

  // attach handlers
  list.querySelectorAll('[data-hire]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-hire'));
      openHireModal(id);
    });
  });
  list.querySelectorAll('[data-shortlist]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-shortlist'));
      toggleShortlist(id);
      renderTalent(document.getElementById('hire-search') ? document.getElementById('hire-search').value : '');
      renderShortlist();
    });
  });
}

function toggleShortlist(id){
  if(shortlist.includes(id)) shortlist = shortlist.filter(x => x !== id);
  else shortlist.push(id);
  persistShortlist();
}

/* Shortlist render */
function renderShortlist(){
  const el = document.getElementById('shortlist');
  if(!el) return;
  if(shortlist.length === 0) { el.textContent = 'No candidates yet'; return; }
  const names = shortlist.map(id => (TALENT.find(t => t.id === id) || {}).name).filter(Boolean);
  el.innerHTML = names.map(n => `<div>${escapeHtml(n)}</div>`).join('');
}

/* Hire modal */
function openHireModal(id){
  const t = TALENT.find(x => x.id === id);
  if(!t) return;
  const modal = document.getElementById('hire-modal');
  const body = document.getElementById('hire-modal-body');
  if(!modal || !body) return;
  body.innerHTML = `
    <h3 id="hire-title">${escapeHtml(t.name)}</h3>
    <p class="muted">${escapeHtml(t.role)} • ${escapeHtml(t.location)}</p>
    <p style="margin-top:8px">${escapeHtml(t.skills.join(', '))}</p>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn primary" id="confirm-hire">Send offer</button>
      <button class="btn ghost" id="close-hire">Close</button>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');

  document.getElementById('confirm-hire').addEventListener('click', ()=>{
    alert('Offer sent to ' + t.name + ' (demo).');
    modal.setAttribute('aria-hidden','true');
  });
  document.getElementById('close-hire').addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
}

/* Jobs */
function renderJobs(filter = ''){
  const list = document.getElementById('jobs-list');
  if(!list) return;
  list.innerHTML = '';
  const q = (filter || '').toLowerCase();
  JOBS.filter(j => !q || (j.title + ' ' + j.company + ' ' + j.desc).toLowerCase().includes(q))
    .forEach(j => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:800">${escapeHtml(j.title)}</div>
            <div class="muted">${escapeHtml(j.company)} • ${escapeHtml(j.location)} • ${escapeHtml(j.type)}</div>
            <div class="muted" style="font-size:0.9rem">${escapeHtml(j.desc)}</div>
          </div>
          <div style="text-align:right">
            <div class="font-bold">${escapeHtml(j.salary)}</div>
            <div style="margin-top:8px">
              <button class="btn primary" data-apply="${j.id}">Apply</button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(el);
    });

  list.querySelectorAll('[data-apply]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-apply'));
      applyJob(id);
    });
  });
}

function applyJob(id){
  const job = JOBS.find(j => j.id === id);
  if(!job) return;
  const applied = JSON.parse(localStorage.getItem('softconsist_applied_v1') || '[]');
  if(applied.includes(id)) { alert('You already applied to this job (demo).'); return; }
  applied.push(id);
  localStorage.setItem('softconsist_applied_v1', JSON.stringify(applied));
  alert('Application submitted for ' + job.title + ' (demo).');
}

/* Community feed */
function renderFeed(){
  const container = document.getElementById('feed');
  if(!container) return;
  container.innerHTML = '';
  if(feed.length === 0) { container.innerHTML = '<div class="muted">No posts yet — be the first to share.</div>'; return; }
  feed.slice().reverse().forEach(post => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <div style="font-weight:800">${escapeHtml(post.author || 'You')}</div>
          <div class="muted" style="font-size:0.9rem">${new Date(post.ts).toLocaleString()}</div>
        </div>
        <div style="text-align:right">
          <button class="btn ghost" data-like="${post.id}">Like (${post.likes||0})</button>
        </div>
      </div>
      <div style="margin-top:10px">${escapeHtml(post.text)}</div>
      <div style="margin-top:10px" id="comments-${post.id}">
        ${ (post.comments || []).map(c => `<div class="muted" style="font-size:0.9rem">• ${escapeHtml(c)}</div>`).join('') }
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <input class="comment-input" data-for="${post.id}" placeholder="Add a comment..." />
        <button class="btn primary" data-comment="${post.id}">Comment</button>
      </div>
    `;
    container.appendChild(el);
  });

  // like handlers
  container.querySelectorAll('[data-like]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-like'));
      const p = feed.find(x => x.id === id);
      if(!p) return;
      p.likes = (p.likes || 0) + 1;
      persistFeed();
      renderFeed();
    });
  });

  // comment handlers
  container.querySelectorAll('[data-comment]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.getAttribute('data-comment'));
      const input = document.querySelector(`.comment-input[data-for="${id}"]`);
      if(!input || !input.value.trim()) return;
      const p = feed.find(x => x.id === id);
      if(!p) return;
      p.comments = p.comments || [];
      p.comments.push(input.value.trim());
      input.value = '';
      persistFeed();
      renderFeed();
    });
  });
}

/* -------------------------
   Auth helpers
   ------------------------- */
function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const name = email.split('@')[0] || 'User';
  localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function handleSignup(e){
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const name = document.getElementById('signup-name').value.trim() || email.split('@')[0];
  localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
  window.location.href = 'profile.html';
}

function renderProfile(){
  const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  if(!user) return;
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatar = document.getElementById('avatar');
  if(nameEl) nameEl.textContent = user.name;
  if(emailEl) emailEl.textContent = user.email;
  if(avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
}

function logout(){
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

/* -------------------------
   Mobile nav and UI wiring
   ------------------------- */
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

function setupModalClose(){
  const close = document.getElementById('modal-close');
  if(close) close.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') {
      closeModal();
      const hireModal = document.getElementById('hire-modal');
      if(hireModal) hireModal.setAttribute('aria-hidden','true');
    }
  });
}

/* -------------------------
   Delegation and initialization
   ------------------------- */
function setupDelegation(){
  // Add / Quick view buttons (delegated)
  document.addEventListener('click', (e)=>{
    const add = e.target.closest('[data-add]');
    if(add){ addToCart(Number(add.getAttribute('data-add'))); return; }
    const view = e.target.closest('[data-view]');
    if(view){ openModal(Number(view.getAttribute('data-view'))); return; }
  });

  // Global search behavior
  const global = document.getElementById('global-search');
  if(global){
    global.addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      if(q.length > 0){
        openTab('explore');
        document.querySelectorAll('#explore-grid .card').forEach(card=>{
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? '' : 'none';
        });
      } else {
        renderExplore();
      }
    });
  }
}

/* -------------------------
   Init
   ------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // render core pieces
  renderProducts();
  renderExplore();
  renderCartPage();
  renderProfile();
  renderTalent();
  renderShortlist();
  renderJobs();
  renderFeed();
  updateCartCount();

  // year
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // wire UI
  setupMobileNav();
  setupModalClose();
  setupDelegation();

  // product delegation for quick view and add handled above
  // attach checkout demo
  const checkout = document.getElementById('checkout-btn');
  if(checkout) checkout.addEventListener('click', ()=> alert('Checkout demo — integrate your payment flow.'));

  // composer actions
  const postBtn = document.getElementById('post-btn');
  if(postBtn) postBtn.addEventListener('click', ()=>{
    const txt = document.getElementById('post-text').value.trim();
    if(!txt) return alert('Write something first.');
    const post = { id: Date.now(), text: txt, ts: Date.now(), likes: 0, comments: [] };
    feed.push(post);
    persistFeed();
    document.getElementById('post-text').value = '';
    renderFeed();
    openTab('community');
  });
  const clearPost = document.getElementById('clear-post');
  if(clearPost) clearPost.addEventListener('click', ()=> { const t = document.getElementById('post-text'); if(t) t.value = ''; });

  // hire search
  const hireSearch = document.getElementById('hire-search');
  if(hireSearch) hireSearch.addEventListener('input', (e)=> renderTalent(e.target.value));

  // jobs search
  const jobsSearch = document.getElementById('jobs-search');
  if(jobsSearch) jobsSearch.addEventListener('input', (e)=> renderJobs(e.target.value));

  // shortlist actions
  const contactBtn = document.getElementById('contact-shortlist');
  if(contactBtn) contactBtn.addEventListener('click', ()=> {
    if(shortlist.length === 0) return alert('No candidates selected.');
    alert('Contacting shortlisted candidates (demo): ' + shortlist.join(', '));
  });
  const clearShort = document.getElementById('clear-shortlist');
  if(clearShort) clearShort.addEventListener('click', ()=> {
    shortlist = []; persistShortlist(); renderShortlist(); renderTalent();
  });

  // modal close for hire modal
  const hireClose = document.getElementById('hire-modal-close');
  if(hireClose) hireClose.addEventListener('click', ()=> document.getElementById('hire-modal').setAttribute('aria-hidden','true'));
});
