import './style.css';
import { api, getToken, getUser, setToken, setUser, removeToken } from './api.js';

const app = document.getElementById('app');
const navLinks = document.getElementById('nav-links');

let cart = []; // Array of { food_id, name, price, quantity }

// ─── ROUTER & STATE ─────────────────────────────────────────────────────────

function updateNav() {
  const user = getUser();
  if (user) {
    navLinks.innerHTML = `
      <span class="nav-link">Chào, ${user.full_name || 'Bạn'}</span>
      <a href="#/" class="nav-link">Trang Chủ</a>
      <a href="#/menu" class="nav-link">Thực Đơn</a>
      <a href="#/cart" class="nav-link">Giỏ Hàng (<span id="cart-count">${cart.reduce((a,c) => a + c.quantity, 0)}</span>)</a>
      <a href="#/orders" class="nav-link">Đơn Hàng</a>
      <a href="#" id="logout-btn" class="nav-link">Đăng Xuất</a>
    `;
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      removeToken();
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    });
  } else {
    navLinks.innerHTML = `
      <a href="#/" class="nav-link">Trang Chủ</a>
      <a href="#/menu" class="nav-link">Thực Đơn</a>
      <a href="#/login" class="nav-link">Đăng Nhập</a>
      <a href="#/register" class="nav-link">Đăng Ký</a>
    `;
  }
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (el) el.innerText = cart.reduce((a,c) => a + c.quantity, 0);
}

// ─── VIEWS ──────────────────────────────────────────────────────────────────

function renderLanding() {
  app.innerHTML = `
    <div class="view">
      <div class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Đặt Đồ Ăn Trực Tuyến Nhanh Chóng & Tiện Lợi</h1>
          <p class="hero-subtitle">Khám phá hơn 50+ món ăn đặc sản Việt Nam. Giao hàng tận nơi, nóng hổi và thơm ngon. Trải nghiệm dịch vụ tuyệt vời ngay hôm nay!</p>
          <a href="#/menu" class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;">Khám Phá Thực Đơn</a>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Vietnamese Food" />
        </div>
      </div>
      
      <div class="features-grid">
        <div class="glass glass-panel feature-card">
          <div class="feature-icon">🛵</div>
          <h3>Giao Hàng Siêu Tốc</h3>
          <p class="text-muted">Đồ ăn được giao nóng hổi đến tận cửa nhà bạn chỉ trong vòng 30 phút.</p>
        </div>
        <div class="glass glass-panel feature-card">
          <div class="feature-icon">🍲</div>
          <h3>Đa Dạng Món Ăn</h3>
          <p class="text-muted">Từ Phở, Bún Chả đến Cơm Tấm. Tất cả các hương vị đặc trưng của Việt Nam.</p>
        </div>
        <div class="glass glass-panel feature-card">
          <div class="feature-icon">⭐</div>
          <h3>Chất Lượng Hàng Đầu</h3>
          <p class="text-muted">Các nhà hàng đối tác được tuyển chọn kỹ lưỡng, đảm bảo vệ sinh an toàn thực phẩm.</p>
        </div>
      </div>
    </div>
  `;
}

function renderLogin() {
  app.innerHTML = `
    <div class="glass auth-container view">
      <h2 class="text-center">Đăng Nhập</h2>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mật Khẩu</label>
          <input type="password" id="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Đăng Nhập</button>
        <p class="text-center mt-2" id="login-error" style="color: red;"></p>
        <p class="text-center mt-2">Chưa có tài khoản? <a href="#/register">Đăng ký ngay</a></p>
      </form>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');
    try {
      errEl.innerText = 'Đang đăng nhập...';
      const res = await api.login(email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      window.location.hash = '#/';
    } catch (err) {
      errEl.innerText = err.message;
    }
  });
}

function renderRegister() {
  app.innerHTML = `
    <div class="glass auth-container view">
      <h2 class="text-center">Đăng Ký Tài Khoản</h2>
      <form id="register-form">
        <div class="form-group">
          <label class="form-label">Họ Tên</label>
          <input type="text" id="name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mật Khẩu</label>
          <input type="password" id="password" class="form-control" required minlength="6"/>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Đăng Ký</button>
        <p class="text-center mt-2" id="reg-error" style="color: red;"></p>
      </form>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('reg-error');
    try {
      errEl.innerText = 'Đang đăng ký...';
      const res = await api.register(name, email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      window.location.hash = '#/';
    } catch (err) {
      errEl.innerText = err.message;
    }
  });
}

async function renderMenu() {
  app.innerHTML = `<div class="text-center mt-4"><h2>Đang tải thực đơn...</h2></div>`;
  try {
    const res = await api.getFoods();
    const foods = res.data.data || res.data;

    let html = `
      <div class="view">
        <div class="flex-between mb-2">
          <h2>Khám Phá Các Món Ăn Ngon</h2>
        </div>
        <div class="grid">
    `;

    foods.forEach(f => {
      const imgHtml = f.image_url 
        ? `<img src="${f.image_url}" alt="${f.name}" style="width:100%; height:200px; object-fit:cover; border-radius:12px; margin-bottom:1rem;" />`
        : `<div class="food-img-placeholder">🍽️</div>`;
        
      html += `
        <div class="glass food-card">
          ${imgHtml}
          <h3 class="food-title">${f.name}</h3>
          <p class="food-price">${parseFloat(f.price).toLocaleString('vi-VN')} đ</p>
          <p class="food-desc">${f.description || 'Chưa có mô tả'}</p>
          <button class="btn btn-primary add-to-cart" data-id="${f.id}" data-name="${f.name}" data-price="${f.price}">Thêm vào giỏ</button>
        </div>
      `;
    });

    html += `</div></div>`;
    app.innerHTML = html;

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!getToken()) return window.location.hash = '#/login';
        const { id, name, price } = e.target.dataset;
        const existing = cart.find(c => c.food_id === id);
        if (existing) {
          existing.quantity++;
        } else {
          cart.push({ food_id: id, name, price: parseFloat(price), quantity: 1 });
        }
        updateCartCount();
        e.target.innerText = 'Đã Thêm!';
        setTimeout(() => e.target.innerText = 'Thêm vào giỏ', 1000);
      });
    });

  } catch (err) {
    app.innerHTML = `<div class="text-center mt-4" style="color:red">Không thể tải thực đơn: ${err.message}</div>`;
  }
}

function renderCart() {
  if (cart.length === 0) {
    app.innerHTML = `
      <div class="glass auth-container view text-center">
        <h2>Giỏ Hàng Trống</h2>
        <a href="#/menu" class="btn btn-primary mt-2">Xem Thực Đơn</a>
      </div>
    `;
    return;
  }

  let total = cart.reduce((a,c) => a + (c.price * c.quantity), 0);
  
  let html = `
    <div class="glass glass-panel view" style="padding: 2rem; max-width: 800px; margin: 2rem auto;">
      <h2>Đơn Hàng Của Bạn</h2>
      <div class="mt-4">
  `;

  cart.forEach((c, index) => {
    html += `
      <div class="cart-item">
        <div>
          <h3>${c.name}</h3>
          <p class="text-muted">${c.price.toLocaleString('vi-VN')} đ x ${c.quantity}</p>
        </div>
        <div>
          <button class="btn btn-outline rm-btn" data-index="${index}">Xóa</button>
        </div>
      </div>
    `;
  });

  html += `
      <div class="cart-total">Tổng: ${total.toLocaleString('vi-VN')} đ</div>
      
      <div class="mt-4 form-group">
        <label class="form-label">Địa Chỉ Giao Hàng</label>
        <div id="map" style="height: 250px; border-radius: 8px; margin-bottom: 10px; z-index: 1;"></div>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="address" class="form-control" placeholder="Vd: 123 Nguyễn Văn Linh, Đà Nẵng" style="flex: 1;" />
          <button id="search-address-btn" class="btn btn-outline" type="button" style="white-space: nowrap;">Tìm Trên Bản Đồ</button>
        </div>
      </div>
      <div class="form-group mt-2">
        <label class="form-label">Ghi Chú</label>
        <input type="text" id="note" class="form-control" placeholder="Vd: Ít cay, thêm ớt..." />
      </div>
      
      <button class="btn btn-primary" id="checkout-btn" style="width: 100%; margin-top: 1rem;">Xác Nhận Đặt Hàng</button>
      <p id="checkout-msg" class="text-center mt-2"></p>
      </div>
    </div>
  `;
  
  app.innerHTML = html;

  setTimeout(() => {
    if (!document.getElementById('map') || !window.L) return;
    const lat = 16.0544; // Da Nang, Vietnam
    const lng = 108.2022;
    const map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    const addrInput = document.getElementById('address');
    
    async function reverseGeocode(l, g) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${l}&lon=${g}`);
        const data = await res.json();
        if (data && data.display_name) {
          addrInput.value = data.display_name;
        } else {
          addrInput.value = `Lat: ${l.toFixed(5)}, Lng: ${g.toFixed(5)}`;
        }
      } catch (err) {
        addrInput.value = `Lat: ${l.toFixed(5)}, Lng: ${g.toFixed(5)}`;
      }
    }
    
    reverseGeocode(lat, lng);

    marker.on('dragend', function () {
      const pos = marker.getLatLng();
      addrInput.value = "Đang tìm địa chỉ...";
      reverseGeocode(pos.lat, pos.lng);
    });

    document.getElementById('search-address-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      const q = addrInput.value;
      if (!q) return;
      const btn = e.target;
      btn.innerText = '...';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          map.setView([newLat, newLng], 15);
          marker.setLatLng([newLat, newLng]);
          addrInput.value = data[0].display_name;
        } else {
          alert('Không tìm thấy địa điểm! Hãy thử chi tiết hơn.');
        }
      } catch (err) {
        alert('Tìm kiếm thất bại.');
      }
      btn.innerText = 'Tìm Trên Bản Đồ';
    });
  }, 100);

  document.querySelectorAll('.rm-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      cart.splice(e.target.dataset.index, 1);
      updateNav();
      renderCart();
    });
  });

  document.getElementById('checkout-btn').addEventListener('click', async () => {
    const address = document.getElementById('address').value;
    const note = document.getElementById('note').value;
    const msg = document.getElementById('checkout-msg');
    
    if (!address) return msg.innerText = 'Vui lòng nhập địa chỉ';
    
    try {
      msg.style.color = 'black';
      msg.innerText = 'Đang xử lý...';
      await api.checkout(cart, address, note);
      cart = [];
      updateNav();
      app.innerHTML = `
        <div class="glass auth-container view text-center">
          <h2 style="color: green">Đặt Hàng Thành Công! 🎉</h2>
          <p class="mt-2">Đồ ăn của bạn đang được chuẩn bị.</p>
          <a href="#/orders" class="btn btn-primary mt-4">Xem Đơn Hàng</a>
        </div>
      `;
    } catch (err) {
      msg.style.color = 'red';
      msg.innerText = err.message;
    }
  });
}

async function renderOrders() {
  app.innerHTML = `<div class="text-center mt-4"><h2>Đang tải đơn hàng...</h2></div>`;
  try {
    const res = await api.getOrders();
    const orders = res.data;
    
    if (orders.length === 0) {
      app.innerHTML = `
        <div class="glass auth-container view text-center">
          <h2>Chưa Có Đơn Hàng Nào</h2>
          <a href="#/menu" class="btn btn-primary mt-2">Đặt Món Ngay</a>
        </div>
      `;
      return;
    }

    let html = `
      <div class="view" style="max-width: 800px; margin: 2rem auto;">
        <h2>Lịch Sử Đơn Hàng</h2>
        <div class="mt-4">
    `;

    orders.forEach(o => {
      html += `
        <div class="glass glass-panel cart-item" style="margin-bottom: 1rem; align-items: flex-start">
          <div>
            <h3>Đơn Hàng #${o.id.substring(0,8)}</h3>
            <p class="text-muted">Trạng thái: <strong>${o.status.toUpperCase()}</strong></p>
            <p class="text-muted">Ngày đặt: ${new Date(o.created_at).toLocaleString('vi-VN')}</p>
          </div>
          <div class="cart-total" style="margin-top: 0">
            ${parseFloat(o.total_price).toLocaleString('vi-VN')} đ
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    app.innerHTML = html;
  } catch(err) {
    app.innerHTML = `<div class="text-center mt-4" style="color:red">Lỗi tải đơn hàng: ${err.message}</div>`;
  }
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────

function router() {
  updateNav();
  const hash = window.location.hash;
  
  if (hash === '#/login') return renderLogin();
  if (hash === '#/register') return renderRegister();
  
  if (!getToken() && (hash === '#/cart' || hash === '#/orders')) {
    window.location.hash = '#/login';
    return;
  }
  
  if (hash === '#/menu') return renderMenu();
  if (hash === '#/cart') return renderCart();
  if (hash === '#/orders') return renderOrders();
  
  renderLanding();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
