import './style.css';
import { api, getToken, getUser, setToken, setUser, removeToken } from './api.js';

const app = document.getElementById('app');
const navLinks = document.getElementById('nav-links');
const CART_KEY = 'foodiego-cart';
const RECENT_ORDER_KEY = 'foodiego-recent-order';

const RESTAURANTS = [
  {
    id: 'pho-nong',
    name: 'Phố Nóng',
    district: 'Quận 1',
    area: 'Đường Nguyễn Huệ',
    eta: '20-25 phút',
    openLabel: 'Đang mở',
    description: 'Phở, bún và cơm trưa cho dân văn phòng.',
    categoryNames: ['Bún - Phở', 'Cơm'],
  },
  {
    id: 'com-nha',
    name: 'Cơm Nhà 24H',
    district: 'Quận 3',
    area: 'Đường Võ Văn Tần',
    eta: '15-20 phút',
    openLabel: 'Đang mở',
    description: 'Bữa ăn nhanh, nóng và phù hợp đặt buổi tối.',
    categoryNames: ['Cơm', 'Tráng miệng'],
  },
  {
    id: 'banh-mi-xanh',
    name: 'Bánh Mì Xanh',
    district: 'Quận 10',
    area: 'Đường Sư Vạn Hạnh',
    eta: '10-15 phút',
    openLabel: 'Đang mở',
    description: 'Bánh mì, đồ uống và đồ ăn sáng gọn nhẹ.',
    categoryNames: ['Bánh mì', 'Đồ uống'],
  },
  {
    id: 'che-sai-gon',
    name: 'Chè Sài Gòn',
    district: 'Quận 5',
    area: 'Đường Trần Hưng Đạo',
    eta: '25-30 phút',
    openLabel: 'Đang mở',
    description: 'Tráng miệng ngọt mát cho mọi khung giờ.',
    categoryNames: ['Tráng miệng', 'Đồ uống'],
  },
];

const state = {
  cart: loadCart(),
  restaurantId: localStorage.getItem('foodiego-restaurant') || RESTAURANTS[0].id,
  categoryId: 'all',
  search: '',
  orderPoll: null,
  recentOrderId: localStorage.getItem(RECENT_ORDER_KEY) || '',
  catalog: {
    menus: [],
    categories: [],
  },
};

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function setRecentOrder(id) {
  state.recentOrderId = id || '';
  if (id) {
    localStorage.setItem(RECENT_ORDER_KEY, id);
  } else {
    localStorage.removeItem(RECENT_ORDER_KEY);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value) {
  if (!value) return 'Mới đây';
  return new Date(value).toLocaleString('vi-VN');
}

function getCurrentUser() {
  return getUser();
}

function isAdminLike(role) {
  return role === 'admin' || role === 'merchant';
}

function updateNav() {
  const user = getCurrentUser();
  const cartCount = state.cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (user) {
    navLinks.innerHTML = `
      <span class="nav-link nav-link-static">Xin chào, ${escapeHtml(user.full_name || 'bạn')}</span>
      <a href="#/" class="nav-link">Trang chủ</a>
      <a href="#/restaurants" class="nav-link">Quán đang mở</a>
      <a href="#/menu" class="nav-link">Thực đơn</a>
      <a href="#/cart" class="nav-link">Giỏ hàng <span class="nav-pill">${cartCount}</span></a>
      <a href="#/orders" class="nav-link">Theo dõi đơn</a>
      <a href="#" id="logout-btn" class="nav-link">Đăng xuất</a>
    `;
    document.getElementById('logout-btn').addEventListener('click', (event) => {
      event.preventDefault();
      removeToken();
      localStorage.removeItem('user');
      window.location.hash = '#/';
    });
    return;
  }

  navLinks.innerHTML = `
    <a href="#/" class="nav-link">Trang chủ</a>
    <a href="#/restaurants" class="nav-link">Quán đang mở</a>
    <a href="#/menu" class="nav-link">Thực đơn</a>
    <a href="#/login" class="nav-link">Đăng nhập</a>
    <a href="#/register" class="nav-link">Đăng ký</a>
  `;
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (el) {
    el.innerText = state.cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }
}

async function loadCatalog(force = false) {
  if (!force && state.catalog.menus.length && state.catalog.categories.length) {
    return state.catalog;
  }

  const [menuRes, categoryRes] = await Promise.all([
    api.getMenus(),
    api.getCategories(),
  ]);

  state.catalog = {
    menus: menuRes?.data || [],
    categories: categoryRes?.data || [],
  };

  return state.catalog;
}

function getSelectedRestaurant(categories = []) {
  const restaurant = RESTAURANTS.find((item) => item.id === state.restaurantId) || RESTAURANTS[0];
  const focusCategoryIds = categories
    .filter((category) => restaurant.categoryNames.includes(category.name))
    .map((category) => category.id);

  return {
    ...restaurant,
    focusCategoryIds,
  };
}

function addToCart(menu) {
  if (!getToken()) {
    window.location.hash = '#/login';
    return;
  }

  const existing = state.cart.find((item) => item.food_id === menu.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      food_id: menu.id,
      name: menu.name,
      price: Number(menu.price),
      quantity: 1,
      image_url: menu.image_url || '',
      category_id: menu.category_id || '',
    });
  }

  saveCart();
  updateNav();
  renderToast('Đã thêm vào giỏ hàng');
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateNav();
  renderCart();
}

function changeQuantity(index, delta) {
  const item = state.cart[index];
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart.splice(index, 1);
  }

  saveCart();
  updateNav();
  renderCart();
}

function renderToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

function renderLanding() {
  const restaurantCards = RESTAURANTS.map((restaurant) => `
    <button class="restaurant-card ${restaurant.id === state.restaurantId ? 'is-active' : ''}" data-restaurant="${restaurant.id}">
      <span class="badge badge-success">${restaurant.openLabel}</span>
      <h3>${escapeHtml(restaurant.name)}</h3>
      <p class="text-muted">${escapeHtml(restaurant.district)} · ${escapeHtml(restaurant.area)}</p>
      <p>${escapeHtml(restaurant.description)}</p>
      <div class="restaurant-meta">
        <span>${escapeHtml(restaurant.eta)}</span>
        <span>${escapeHtml(restaurant.categoryNames.join(' · '))}</span>
      </div>
    </button>
  `).join('');

  app.innerHTML = `
    <div class="view">
      <section class="hero hero-grid">
        <div class="hero-content">
          <span class="eyebrow">FoodieGo MVP</span>
          <h1 class="hero-title">Đặt món nhanh, COD gọn, theo dõi đơn rõ ràng.</h1>
          <p class="hero-subtitle">
            MVP này tập trung vào điều quan trọng nhất: khách đặt được món, quán nhận được đơn,
            tài xế giao được hàng, và admin theo dõi được toàn bộ vòng đời.
          </p>
          <div class="hero-actions">
            <a href="#/menu" class="btn btn-primary">Bắt đầu đặt món</a>
            <a href="#/orders" class="btn btn-outline">Theo dõi đơn</a>
          </div>
          <div class="hero-stats">
            <div class="stat-mini">
              <strong>COD</strong>
              <span>Thanh toán khi nhận hàng</span>
            </div>
            <div class="stat-mini">
              <strong>Live</strong>
              <span>Trạng thái đơn cơ bản</span>
            </div>
            <div class="stat-mini">
              <strong>Fast</strong>
              <span>Đặt trong vài thao tác</span>
            </div>
          </div>
        </div>
        <div class="hero-panel glass">
          <h3>3 vai trò chính</h3>
          <div class="role-stack">
            <article class="role-card">
              <span class="badge">Người dùng</span>
              <p>Chọn quán, thêm món, thanh toán COD và xem trạng thái đơn.</p>
            </article>
            <article class="role-card">
              <span class="badge">Người bán</span>
              <p>Nhận đơn, xác nhận, báo chuẩn bị xong và bật/tắt món còn hàng.</p>
            </article>
            <article class="role-card">
              <span class="badge">Quản trị</span>
              <p>Quan sát dashboard, can thiệp trạng thái và theo dõi hiệu quả.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Quán đang mở</span>
            <h2>Chọn một quán trong khu vực trung tâm</h2>
          </div>
          <a href="#/restaurants" class="section-link">Xem tất cả</a>
        </div>
        <div class="restaurant-grid">
          ${restaurantCards}
        </div>
      </section>

      <section class="feature-grid">
        <article class="feature-card glass">
          <h3>Đơn giản hóa thanh toán</h3>
          <p>Chỉ cần COD, không bắt buộc tích hợp cổng thanh toán phức tạp ở giai đoạn đầu.</p>
        </article>
        <article class="feature-card glass">
          <h3>Tracking cơ bản</h3>
          <p>Khách nhìn thấy đơn đã được nhận, đang chuẩn bị, đang giao và hoàn thành.</p>
        </article>
        <article class="feature-card glass">
          <h3>Tiện lợi tức thì</h3>
          <p>Ngồi ở nhà hoặc văn phòng vẫn đặt được đồ ăn và nhận ngay tận nơi.</p>
        </article>
      </section>
    </div>
  `;

  document.querySelectorAll('[data-restaurant]').forEach((button) => {
    button.addEventListener('click', () => {
      state.restaurantId = button.dataset.restaurant;
      localStorage.setItem('foodiego-restaurant', state.restaurantId);
      renderLanding();
    });
  });
}

function renderLogin() {
  app.innerHTML = `
    <div class="auth-shell glass view">
      <span class="eyebrow">Người dùng</span>
      <h2>Đăng nhập</h2>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <input type="password" id="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary btn-full">Đăng nhập</button>
        <p class="form-feedback" id="login-error"></p>
        <p class="muted-link">Chưa có tài khoản? <a href="#/register">Đăng ký ngay</a></p>
      </form>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('login-error');

    try {
      feedback.innerText = 'Đang đăng nhập...';
      const response = await api.login(email, password);
      setToken(response.data.token);
      setUser(response.data.user);
      if (isAdminLike(response.data.user?.role)) {
        window.location.href = './admin.html';
        return;
      }
      updateNav();
      window.location.hash = '#/';
    } catch (error) {
      feedback.innerText = error.message;
    }
  });
}

function renderRegister() {
  app.innerHTML = `
    <div class="auth-shell glass view">
      <span class="eyebrow">Tạo tài khoản</span>
      <h2>Đăng ký</h2>
      <form id="register-form">
        <div class="form-group">
          <label class="form-label">Họ tên</label>
          <input type="text" id="name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <input type="password" id="password" class="form-control" minlength="6" required />
        </div>
        <button type="submit" class="btn btn-primary btn-full">Tạo tài khoản</button>
        <p class="form-feedback" id="reg-error"></p>
      </form>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('reg-error');

    try {
      feedback.innerText = 'Đang đăng ký...';
      const response = await api.register(name, email, password);
      setToken(response.data.token);
      setUser(response.data.user);
      if (isAdminLike(response.data.user?.role)) {
        window.location.href = './admin.html';
        return;
      }
      updateNav();
      window.location.hash = '#/';
    } catch (error) {
      feedback.innerText = error.message;
    }
  });
}

async function renderMenu() {
  app.innerHTML = `<div class="view text-center"><h2>Đang tải thực đơn...</h2></div>`;

  try {
    const catalog = await loadCatalog(true);
    const restaurant = getSelectedRestaurant(catalog.categories);
    const categoryOptions = [
      { id: 'all', name: 'Tất cả' },
      ...catalog.categories,
    ];

    const menus = catalog.menus.filter((menu) => {
      const matchesSearch = !state.search
        || menu.name?.toLowerCase().includes(state.search.toLowerCase())
        || (menu.description || '').toLowerCase().includes(state.search.toLowerCase());

      const matchesCategory = state.categoryId === 'all' || String(menu.category_id) === String(state.categoryId);
      const matchesRestaurant = restaurant.focusCategoryIds.length === 0
        || restaurant.focusCategoryIds.includes(menu.category_id)
        || state.categoryId !== 'all';

      return matchesSearch && matchesCategory && matchesRestaurant;
    });

    const menuCards = menus.map((menu) => `
      <article class="menu-card glass">
        <div class="menu-image">
          ${menu.image_url
            ? `<img src="${escapeHtml(menu.image_url)}" alt="${escapeHtml(menu.name)}" />`
            : '<span>🍽️</span>'}
        </div>
        <div class="menu-body">
          <div class="menu-head">
            <h3>${escapeHtml(menu.name)}</h3>
            <span class="badge ${menu.is_available ? 'badge-success' : 'badge-muted'}">
              ${menu.is_available ? 'Còn món' : 'Hết món'}
            </span>
          </div>
          <p class="menu-price">${formatMoney(menu.price)} đ</p>
          <p class="menu-desc">${escapeHtml(menu.description || 'Chưa có mô tả')}</p>
          <div class="menu-actions">
            <button class="btn btn-primary add-to-cart" data-id="${escapeHtml(menu.id)}">Thêm vào giỏ</button>
            <span class="menu-category">${escapeHtml((catalog.categories.find((item) => item.id === menu.category_id) || {}).name || 'Món chọn nhanh')}</span>
          </div>
        </div>
      </article>
    `).join('');

    app.innerHTML = `
      <div class="view">
        <section class="section-block">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Quán đang mở</span>
              <h2>${escapeHtml(restaurant.name)}</h2>
              <p class="text-muted">${escapeHtml(restaurant.description)}</p>
            </div>
            <div class="restaurant-chip">
              <span class="badge badge-success">${escapeHtml(restaurant.openLabel)}</span>
              <span>${escapeHtml(restaurant.eta)}</span>
            </div>
          </div>
          <div class="restaurant-grid restaurant-grid--compact">
            ${RESTAURANTS.map((item) => `
              <button class="restaurant-card ${item.id === restaurant.id ? 'is-active' : ''}" data-restaurant="${item.id}">
                <span class="badge badge-success">${escapeHtml(item.openLabel)}</span>
                <h3>${escapeHtml(item.name)}</h3>
                <p class="text-muted">${escapeHtml(item.district)}</p>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Thực đơn & đặt món</span>
              <h2>Menu cơ bản, nhanh và dễ chọn</h2>
            </div>
            <input id="menu-search" class="form-control search-input" placeholder="Tìm món, ví dụ: phở, cơm, trà..." value="${escapeHtml(state.search)}" />
          </div>
          <div class="filter-bar">
            ${categoryOptions.map((category) => `
              <button class="filter-chip ${String(category.id) === String(state.categoryId) ? 'is-active' : ''}" data-category="${escapeHtml(category.id)}">
                ${escapeHtml(category.name)}
              </button>
            `).join('')}
          </div>
          <div class="restaurant-note">
            Đang xem theo quán: <strong>${escapeHtml(restaurant.name)}</strong>. Thực đơn được lọc theo nhóm món phù hợp, nhưng vẫn cho phép tìm tất cả món khi cần.
          </div>
          <div class="menu-grid">
            ${menuCards || '<div class="empty-state glass">Chưa có món phù hợp.</div>'}
          </div>
        </section>
      </div>
    `;

    document.getElementById('menu-search').addEventListener('input', (event) => {
      state.search = event.target.value;
      renderMenu();
    });

    document.querySelectorAll('[data-category]').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.categoryId = chip.dataset.category;
        renderMenu();
      });
    });

    document.querySelectorAll('[data-restaurant]').forEach((button) => {
      button.addEventListener('click', () => {
        state.restaurantId = button.dataset.restaurant;
        localStorage.setItem('foodiego-restaurant', state.restaurantId);
        renderMenu();
      });
    });

    document.querySelectorAll('.add-to-cart').forEach((button) => {
      button.addEventListener('click', async () => {
        const menu = catalog.menus.find((item) => item.id === button.dataset.id);
        if (!menu) return;
        addToCart(menu);
        button.innerText = 'Đã thêm';
        window.setTimeout(() => {
          button.innerText = 'Thêm vào giỏ';
        }, 900);
      });
    });
  } catch (error) {
    app.innerHTML = `<div class="text-center view" style="color: #b91c1c">Không thể tải thực đơn: ${escapeHtml(error.message)}</div>`;
  }
}

function renderCart() {
  if (!getToken()) {
    window.location.hash = '#/login';
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const deliveryFee = state.cart.length ? 15000 : 0;
  const total = subtotal + deliveryFee;

  if (!state.cart.length) {
    app.innerHTML = `
      <div class="auth-shell glass view text-center">
        <span class="eyebrow">Giỏ hàng</span>
        <h2>Giỏ hàng đang trống</h2>
        <p class="text-muted">Hãy quay lại thực đơn để chọn món và đặt COD nhanh chóng.</p>
        <a href="#/menu" class="btn btn-primary">Xem thực đơn</a>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="view cart-layout">
      <section class="glass cart-panel">
        <span class="eyebrow">Thanh toán COD</span>
        <h2>Giỏ hàng của bạn</h2>
        <div class="cart-list">
          ${state.cart.map((item, index) => `
            <article class="cart-item">
              <div>
                <h3>${escapeHtml(item.name)}</h3>
                <p class="text-muted">${formatMoney(item.price)} đ x ${item.quantity}</p>
              </div>
              <div class="cart-controls">
                <button class="btn btn-icon" data-dec="${index}">−</button>
                <span>${item.quantity}</span>
                <button class="btn btn-icon" data-inc="${index}">+</button>
                <button class="btn btn-outline btn-sm" data-remove="${index}">Xóa</button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <aside class="glass checkout-panel">
        <span class="eyebrow">Đặt món</span>
        <h2>Thông tin giao hàng</h2>
        <div class="summary-row">
          <span>Tạm tính</span>
          <strong>${formatMoney(subtotal)} đ</strong>
        </div>
        <div class="summary-row">
          <span>Phí giao hàng</span>
          <strong>${formatMoney(deliveryFee)} đ</strong>
        </div>
        <div class="summary-row summary-total">
          <span>Tổng COD</span>
          <strong>${formatMoney(total)} đ</strong>
        </div>
        <form id="checkout-form">
          <div class="form-group">
            <label class="form-label">Địa chỉ giao hàng</label>
            <input type="text" id="address" class="form-control" placeholder="Ví dụ: 123 Nguyễn Văn Linh, Đà Nẵng" required />
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú cho quán</label>
            <input type="text" id="note" class="form-control" placeholder="Ít cay, nhiều rau,..." />
          </div>
          <div class="payment-box">
            <span class="badge badge-success">COD</span>
            <p>Thanh toán tiền mặt khi nhận hàng.</p>
          </div>
          <button class="btn btn-primary btn-full" type="submit">Xác nhận đặt COD</button>
          <p class="form-feedback" id="checkout-msg"></p>
        </form>
      </aside>
    </div>
  `;

  document.querySelectorAll('[data-inc]').forEach((button) => {
    button.addEventListener('click', () => changeQuantity(Number(button.dataset.inc), 1));
  });

  document.querySelectorAll('[data-dec]').forEach((button) => {
    button.addEventListener('click', () => changeQuantity(Number(button.dataset.dec), -1));
  });

  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(Number(button.dataset.remove)));
  });

  document.getElementById('checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const address = document.getElementById('address').value.trim();
    const note = document.getElementById('note').value.trim();
    const message = document.getElementById('checkout-msg');

    if (!address) {
      message.innerText = 'Vui lòng nhập địa chỉ giao hàng';
      return;
    }

    try {
      message.innerText = 'Đang tạo đơn...';
      const response = await api.checkout(state.cart, address, note, 'cod');
      state.cart = [];
      saveCart();
      updateNav();
      setRecentOrder(response?.data?.id || '');
      app.innerHTML = `
        <div class="auth-shell glass view text-center">
          <span class="eyebrow">Đặt hàng thành công</span>
          <h2>Đơn hàng đã được tạo</h2>
          <p class="text-muted">Quán đã nhận thông tin và hệ thống sẽ cập nhật trạng thái chuẩn bị, giao hàng và hoàn tất.</p>
          <div class="success-box">
            <div><strong>Mã đơn</strong><br />${escapeHtml(response?.data?.id || 'pending')}</div>
            <div><strong>Thanh toán</strong><br />COD</div>
          </div>
          <a href="#/orders" class="btn btn-primary">Theo dõi đơn</a>
        </div>
      `;
    } catch (error) {
      message.innerText = error.message;
    }
  });
}

function buildOrderSteps(order, delivery) {
  const orderStatus = order?.status || 'pending';
  const deliveryStatus = delivery?.status || 'waiting';

  const completed = (status) => {
    if (status === 'pending') return 0;
    if (status === 'confirmed') return 1;
    if (status === 'preparing') return 2;
    if (status === 'delivering' || deliveryStatus === 'accepted') return 3;
    if (status === 'completed' || deliveryStatus === 'delivered') return 4;
    return 0;
  };

  const activeIndex = completed(orderStatus);
  const labels = ['Khách đặt', 'Quán nhận', 'Chuẩn bị xong', 'Tài xế đang giao', 'Hoàn tất'];

  return labels.map((label, index) => `
    <div class="timeline-step ${index <= activeIndex ? 'is-active' : ''}">
      <span class="timeline-dot"></span>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');
}

async function renderOrders() {
  if (!getToken()) {
    window.location.hash = '#/login';
    return;
  }

  app.innerHTML = `<div class="view text-center"><h2>Đang tải đơn hàng...</h2></div>`;

  try {
    const response = await api.getOrders();
    const orders = response?.data || [];
    const trackedOrder = state.recentOrderId
      ? orders.find((order) => order.id === state.recentOrderId)
      : orders[0];

    let delivery = null;
    if (trackedOrder) {
      try {
        const deliveryResponse = await api.getDeliveryByOrder(trackedOrder.id);
        delivery = deliveryResponse?.data || null;
      } catch {
        delivery = null;
      }
    }

    app.innerHTML = `
      <div class="view">
        <section class="section-block">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Theo dõi đơn</span>
              <h2>Trạng thái giao hàng cơ bản</h2>
              <p class="text-muted">Bạn sẽ thấy đơn đã được quán nhận, đang chuẩn bị, tài xế đang giao và đã hoàn tất.</p>
            </div>
            <a href="#/menu" class="section-link">Đặt thêm món</a>
          </div>
          ${trackedOrder ? `
            <div class="tracking-card glass">
              <div class="tracking-header">
                <div>
                  <span class="badge badge-success">Đơn gần nhất</span>
                  <h3>#${escapeHtml(trackedOrder.id.slice(0, 8))}</h3>
                  <p class="text-muted">Đặt lúc ${formatDate(trackedOrder.created_at)}</p>
                </div>
                <div class="tracking-meta">
                  <strong>${formatMoney(trackedOrder.total_price)} đ</strong>
                  <span>${escapeHtml(trackedOrder.status)}</span>
                </div>
              </div>
              <div class="timeline">
                ${buildOrderSteps(trackedOrder, delivery)}
              </div>
              <div class="order-status-grid">
                <div class="status-pill">Quán: ${escapeHtml(trackedOrder.status)}</div>
                <div class="status-pill">Ship: ${escapeHtml(delivery?.status || 'waiting')}</div>
                <div class="status-pill">COD</div>
              </div>
            </div>
          ` : `
            <div class="empty-state glass">Bạn chưa có đơn hàng nào.</div>
          `}
        </section>

        <section class="section-block">
          <h2>Lịch sử đơn</h2>
          <div class="orders-list">
            ${orders.map((order) => `
              <article class="order-card glass">
                <div class="order-top">
                  <div>
                    <h3>Đơn #${escapeHtml(order.id.slice(0, 8))}</h3>
                    <p class="text-muted">${formatDate(order.created_at)}</p>
                  </div>
                  <div class="order-price">${formatMoney(order.total_price)} đ</div>
                </div>
                <div class="order-row">
                  <span>Trạng thái</span>
                  <strong>${escapeHtml(order.status)}</strong>
                </div>
                <div class="order-row">
                  <span>Địa chỉ</span>
                  <strong>${escapeHtml(order.address || 'Chưa cập nhật')}</strong>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    if (state.orderPoll) {
      clearInterval(state.orderPoll);
    }
    state.orderPoll = setInterval(() => {
      if (window.location.hash === '#/orders') {
        renderOrders();
      }
    }, 15000);
  } catch (error) {
    app.innerHTML = `<div class="view text-center" style="color: #b91c1c">Lỗi tải đơn hàng: ${escapeHtml(error.message)}</div>`;
  }
}

function stopOrderPolling() {
  if (state.orderPoll) {
    clearInterval(state.orderPoll);
    state.orderPoll = null;
  }
}

function renderRestaurantsOnly() {
  renderLanding();
}

function router() {
  updateNav();
  stopOrderPolling();

  const hash = window.location.hash || '#/';

  if (hash === '#/login') {
    renderLogin();
    return;
  }

  if (hash === '#/register') {
    renderRegister();
    return;
  }

  if (hash === '#/menu') {
    renderMenu();
    return;
  }

  if (hash === '#/cart') {
    renderCart();
    return;
  }

  if (hash === '#/orders') {
    renderOrders();
    return;
  }

  if (hash === '#/restaurants') {
    renderRestaurantsOnly();
    return;
  }

  if (!getToken() && (hash === '#/orders' || hash === '#/cart')) {
    window.location.hash = '#/login';
    return;
  }

  renderLanding();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
