import './style.css';
import { api, getToken, getUser, setToken, setUser } from './api.js';

const app = document.getElementById('app');
const PARTNER_QUEUE_KEY = 'foodiego-partner-queue';
const COURIER_ASSIGNMENT_KEY = 'foodiego-courier-assignments';
const POLL_INTERVAL_MS = 15000;
const DEMO_COURIERS = ['An', 'Bình', 'Chi', 'Dũng'];

const DEFAULT_PARTNERS = [
  { id: 'p-1', name: 'Phố Nóng', area: 'Quận 1', status: 'pending', note: 'Mở thêm chi nhánh trưa.' },
  { id: 'p-2', name: 'Cơm Nhà 24H', area: 'Quận 3', status: 'approved', note: 'Đã duyệt hồ sơ.' },
  { id: 'p-3', name: 'Bánh Mì Xanh', area: 'Quận 10', status: 'pending', note: 'Cần bổ sung menu.' },
];

const state = {
  activeTab: 'dashboard',
  orders: [],
  menus: [],
  categories: [],
  employees: [],
  promotions: [],
  expenses: [],
  stats: {},
  partnerQueue: loadJson(PARTNER_QUEUE_KEY, DEFAULT_PARTNERS),
  courierAssignments: loadJson(COURIER_ASSIGNMENT_KEY, {}),
  timer: null,
  editingMenuId: null,
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function isAdminLike(role) {
  return role === 'admin' || role === 'merchant';
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
}

function init() {
  const user = getUser();
  if (!getToken() || !user || !isAdminLike(user.role)) {
    renderAdminLogin();
    return;
  }

  renderLayout();
  router();
}

function renderAdminLogin() {
  app.innerHTML = `
    <div class="auth-shell glass view admin-login">
      <span class="eyebrow">Quản trị</span>
      <h2>Đăng nhập Admin</h2>
      <form id="admin-login-form">
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
        <p class="muted-link"><a href="./index.html">Quay lại trang người dùng</a></p>
      </form>
    </div>
  `;

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('login-error');

    try {
      feedback.innerText = 'Đang đăng nhập...';
      const response = await api.login(email, password);
      if (!isAdminLike(response.data.user.role)) {
        throw new Error('Tài khoản này không có quyền admin');
      }
      setToken(response.data.token);
      setUser(response.data.user);
      renderLayout();
      router();
    } catch (error) {
      feedback.innerText = error.message;
    }
  });
}

function renderLayout() {
  const currentUser = getUser();
  app.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar glass">
        <div>
          <span class="eyebrow">FoodieGo</span>
          <h2>Admin Console</h2>
          <p class="text-muted">${escapeHtml(currentUser?.full_name || 'Quản trị')} · ${escapeHtml(currentUser?.role || 'admin')}</p>
        </div>
        <nav class="sidebar-nav">
          <a href="#/dashboard" class="nav-btn" data-tab="dashboard">Tổng quan</a>
          <a href="#/orders" class="nav-btn" data-tab="orders">Đơn hàng</a>
          <a href="#/menu" class="nav-btn" data-tab="menu">Menu & tồn món</a>
          <a href="#/partners" class="nav-btn" data-tab="partners">Đối tác</a>
          <a href="#/employees" class="nav-btn" data-tab="employees">Nhân sự</a>
          <a href="#/promotions" class="nav-btn" data-tab="promotions">Ưu đãi</a>
          <a href="#/expenses" class="nav-btn" data-tab="expenses">Chi tiêu</a>
        </nav>
        <button id="logout" class="btn btn-outline btn-full">Đăng xuất</button>
      </aside>
      <main class="admin-content" id="content"></main>
    </div>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = './index.html';
  });
}

function setActiveTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.nav-btn').forEach((button) => button.classList.remove('active'));
  const activeButton = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

async function loadOrders() {
  const response = await api.getAllOrders();
  state.orders = response?.data || [];
  return state.orders;
}

async function loadCatalog(force = false) {
  if (!force && state.menus.length && state.categories.length) {
    return { menus: state.menus, categories: state.categories };
  }

  const [menuResponse, categoryResponse] = await Promise.all([
    api.getMenus(),
    api.getCategories(),
  ]);
  state.menus = menuResponse?.data || [];
  state.categories = categoryResponse?.data || [];
  return { menus: state.menus, categories: state.categories };
}

async function loadStaff() {
  const response = await api.getEmployees();
  state.employees = response?.data || [];
  return state.employees;
}

async function loadPromotions() {
  const response = await api.getPromotions();
  state.promotions = response?.data || [];
  return state.promotions;
}

async function loadExpenses() {
  const response = await api.getExpenses();
  state.expenses = response?.data || [];
  return state.expenses;
}

async function loadStats() {
  state.stats = await api.getAdminStats();
  return state.stats;
}

function computeDashboardMetrics() {
  const totalOrders = state.orders.length;
  const completedOrders = state.orders.filter((order) => order.status === 'completed').length;
  const fulfillmentRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const completedDurations = state.orders
    .filter((order) => order.status === 'completed' && order.created_at && order.updated_at)
    .map((order) => new Date(order.updated_at).getTime() - new Date(order.created_at).getTime())
    .filter((duration) => Number.isFinite(duration) && duration > 0);
  const averageMinutes = completedDurations.length
    ? Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length / 60000)
    : 0;

  return {
    revenue: Number(state.stats.total_revenue || 0),
    expenses: Number(state.stats.total_expenses || 0),
    profit: Number(state.stats.total_revenue || 0) - Number(state.stats.total_expenses || 0),
    users: Number(state.stats.total_users || 0),
    totalOrders,
    completedOrders,
    pendingOrders: state.orders.filter((order) => order.status === 'pending').length,
    fulfillmentRate,
    averageMinutes,
  };
}

async function renderDashboard() {
  setActiveTab('dashboard');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải dashboard...</div>`;

  try {
    await Promise.all([loadStats(), loadOrders(), loadCatalog(true)]);
    const metrics = computeDashboardMetrics();
    const recentOrders = state.orders.slice(0, 5);
    const activePartners = state.partnerQueue.filter((partner) => partner.status === 'approved').length;

    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Dashboard thời gian thực</span>
            <h1>Tổng quan vận hành</h1>
          </div>
          <button class="btn btn-outline" id="refresh-dashboard">Làm mới</button>
        </div>
        <div class="stat-grid">
          <article class="stat-card glass">
            <span>Doanh thu</span>
            <strong>${money(metrics.revenue)} đ</strong>
          </article>
          <article class="stat-card glass">
            <span>Chi tiêu</span>
            <strong>${money(metrics.expenses)} đ</strong>
          </article>
          <article class="stat-card glass">
            <span>Lợi nhuận</span>
            <strong>${money(metrics.profit)} đ</strong>
          </article>
          <article class="stat-card glass">
            <span>Người dùng</span>
            <strong>${metrics.users}</strong>
          </article>
          <article class="stat-card glass">
            <span>Tổng đơn</span>
            <strong>${metrics.totalOrders}</strong>
          </article>
          <article class="stat-card glass">
            <span>Tỷ lệ hoàn thành</span>
            <strong>${metrics.fulfillmentRate}%</strong>
          </article>
          <article class="stat-card glass">
            <span>Đơn chờ xử lý</span>
            <strong>${metrics.pendingOrders}</strong>
          </article>
          <article class="stat-card glass">
            <span>Thời gian TB</span>
            <strong>${metrics.averageMinutes} phút</strong>
          </article>
        </div>
        <div class="metrics-note">
          Đối tác đã duyệt: <strong>${activePartners}</strong> · Món còn hiển thị: <strong>${state.menus.filter((menu) => menu.is_available).length}</strong>
        </div>
      </section>

      <section class="section-block">
        <h2>Đơn gần nhất</h2>
        <div class="orders-list">
          ${recentOrders.map((order) => `
            <article class="order-card glass">
              <div class="order-top">
                <div>
                  <h3>#${escapeHtml(order.id.slice(0, 8))}</h3>
                  <p class="text-muted">${formatDate(order.created_at)}</p>
                </div>
                <div class="order-price">${money(order.total_price)} đ</div>
              </div>
              <div class="order-row">
                <span>Trạng thái</span>
                <strong>${escapeHtml(order.status)}</strong>
              </div>
              <div class="order-row">
                <span>Khách</span>
                <strong>${escapeHtml(order.user_id)}</strong>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    document.getElementById('refresh-dashboard').addEventListener('click', () => renderDashboard());
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải dashboard: ${escapeHtml(error.message)}</div>`;
  }
}

function getOrderAssignment(orderId) {
  return state.courierAssignments[orderId] || '';
}

function setOrderAssignment(orderId, courier) {
  if (!courier) {
    delete state.courierAssignments[orderId];
  } else {
    state.courierAssignments[orderId] = courier;
  }
  saveJson(COURIER_ASSIGNMENT_KEY, state.courierAssignments);
}

function quickActionsForStatus(orderStatus) {
  if (orderStatus === 'pending') {
    return [
      { label: 'Chấp nhận', status: 'confirmed', tone: 'primary' },
      { label: 'Từ chối', status: 'cancelled', tone: 'danger' },
    ];
  }
  if (orderStatus === 'confirmed') {
    return [{ label: 'Chuẩn bị', status: 'preparing', tone: 'primary' }];
  }
  if (orderStatus === 'preparing') {
    return [{ label: 'Sẵn sàng giao', status: 'delivering', tone: 'primary' }];
  }
  if (orderStatus === 'delivering') {
    return [{ label: 'Hoàn tất', status: 'completed', tone: 'primary' }];
  }
  return [];
}

async function updateOrder(orderId, status) {
  await api.updateOrderStatus(orderId, status);
  await renderOrders();
}

async function renderOrders() {
  setActiveTab('orders');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải đơn hàng...</div>`;

  try {
    await loadOrders();
    const activeOrders = state.orders;

    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Merchant / Admin</span>
            <h1>Quản lý đơn hàng</h1>
          </div>
          <button class="btn btn-outline" id="refresh-orders">Làm mới</button>
        </div>
        <div class="filter-bar">
          ${['all', 'pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'].map((status) => `
            <button class="filter-chip ${status === 'all' ? 'is-active' : ''}" data-order-filter="${status}">${status === 'all' ? 'Tất cả' : status}</button>
          `).join('')}
        </div>
        <div class="orders-list orders-list--wide">
          ${activeOrders.map((order) => {
            const assignment = getOrderAssignment(order.id);
            const quickActions = quickActionsForStatus(order.status);
            return `
              <article class="order-card glass" data-order-row="${escapeHtml(order.status)}">
                <div class="order-top">
                  <div>
                    <h3>#${escapeHtml(order.id.slice(0, 8))}</h3>
                    <p class="text-muted">${formatDate(order.created_at)}</p>
                  </div>
                  <div class="order-price">${money(order.total_price)} đ</div>
                </div>
                <div class="order-row">
                  <span>Khách</span>
                  <strong>${escapeHtml(order.user_id)}</strong>
                </div>
                <div class="order-row">
                  <span>Loại đơn</span>
                  <strong>${escapeHtml(order.order_type)}</strong>
                </div>
                <div class="order-row">
                  <span>Trạng thái</span>
                  <strong>${escapeHtml(order.status)}</strong>
                </div>
                <div class="order-row">
                  <span>Ship demo</span>
                  <strong>${escapeHtml(assignment || 'Chưa gán')}</strong>
                </div>
                <div class="order-actions">
                  ${quickActions.map((action) => `
                    <button class="btn ${action.tone === 'danger' ? 'btn-outline-danger' : 'btn-primary'}" data-order-action="${escapeHtml(order.id)}" data-status="${escapeHtml(action.status)}">
                      ${escapeHtml(action.label)}
                    </button>
                  `).join('')}
                </div>
                <div class="assignment-row">
                  <select class="form-control courier-select" data-courier-select="${escapeHtml(order.id)}">
                    <option value="">Gán shipper demo</option>
                    ${DEMO_COURIERS.map((courier) => `
                      <option value="${escapeHtml(courier)}" ${assignment === courier ? 'selected' : ''}>${escapeHtml(courier)}</option>
                    `).join('')}
                  </select>
                  <button class="btn btn-outline btn-sm" data-courier-save="${escapeHtml(order.id)}">Lưu gán</button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;

    document.getElementById('refresh-orders').addEventListener('click', () => renderOrders());

    document.querySelectorAll('[data-order-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        await updateOrder(button.dataset.orderAction, button.dataset.status);
      });
    });

    document.querySelectorAll('[data-courier-save]').forEach((button) => {
      button.addEventListener('click', () => {
        const orderId = button.dataset.courierSave;
        const select = document.querySelector(`[data-courier-select="${orderId}"]`);
        setOrderAssignment(orderId, select?.value || '');
        renderOrders();
      });
    });

    document.querySelectorAll('[data-order-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.orderFilter;
        document.querySelectorAll('[data-order-filter]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        document.querySelectorAll('.order-card').forEach((card) => {
          const status = card.getAttribute('data-order-row');
          card.style.display = filter === 'all' || filter === status ? '' : 'none';
        });
      });
    });
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải đơn hàng: ${escapeHtml(error.message)}</div>`;
  }
}

function renderMenuForm(menu = null) {
  state.editingMenuId = menu?.id || null;
  const name = menu?.name || '';
  const description = menu?.description || '';
  const price = menu?.price || '';
  const imageUrl = menu?.image_url || '';
  const categoryId = menu?.category_id || '';
  const isAvailable = menu?.is_available !== undefined ? Boolean(menu.is_available) : true;

  return `
    <div class="form-card glass">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Menu cơ bản</span>
          <h2>${menu ? 'Cập nhật món' : 'Tạo món mới'}</h2>
        </div>
      </div>
      <form id="menu-form">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tên món</label>
            <input class="form-control" id="menu-name" value="${escapeHtml(name)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Giá</label>
            <input class="form-control" id="menu-price" type="number" value="${escapeHtml(price)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Danh mục</label>
            <select class="form-control" id="menu-category">
              <option value="">Chưa chọn</option>
              ${state.categories.map((category) => `
                <option value="${escapeHtml(category.id)}" ${String(category.id) === String(categoryId) ? 'selected' : ''}>${escapeHtml(category.name)}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ảnh</label>
            <input class="form-control" id="menu-image" value="${escapeHtml(imageUrl)}" placeholder="https://..." />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả</label>
          <textarea class="form-control" id="menu-description" rows="4">${escapeHtml(description)}</textarea>
        </div>
        <div class="form-row">
          <label class="checkbox-row">
            <input type="checkbox" id="menu-available" ${isAvailable ? 'checked' : ''} />
            <span>Còn món</span>
          </label>
          <button class="btn btn-primary" type="submit">${menu ? 'Lưu thay đổi' : 'Tạo món'}</button>
          ${menu ? '<button class="btn btn-outline" type="button" id="menu-cancel">Hủy</button>' : ''}
        </div>
        <p class="form-feedback" id="menu-form-feedback"></p>
      </form>
    </div>
  `;
}

async function renderMenu() {
  setActiveTab('menu');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải menu...</div>`;

  try {
    await loadCatalog(true);
    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Merchant tools</span>
            <h1>Quản lý menu & trạng thái còn món</h1>
          </div>
          <button class="btn btn-primary" id="new-menu-btn">Thêm món</button>
        </div>
        <div id="menu-form-slot"></div>
        <div class="menu-admin-grid">
          ${state.menus.map((menu) => `
            <article class="menu-admin-card glass">
              <div class="menu-head">
                <div>
                  <h3>${escapeHtml(menu.name)}</h3>
                  <p class="text-muted">${escapeHtml((state.categories.find((category) => category.id === menu.category_id) || {}).name || 'Chưa phân loại')}</p>
                </div>
                <span class="badge ${menu.is_available ? 'badge-success' : 'badge-muted'}">${menu.is_available ? 'Còn món' : 'Hết món'}</span>
              </div>
              <p class="menu-price">${money(menu.price)} đ</p>
              <p class="menu-desc">${escapeHtml(menu.description || 'Chưa có mô tả')}</p>
              <div class="order-actions">
                <button class="btn btn-outline btn-sm" data-toggle-available="${escapeHtml(menu.id)}">${menu.is_available ? 'Tắt món' : 'Bật món'}</button>
                <button class="btn btn-primary btn-sm" data-edit-menu="${escapeHtml(menu.id)}">Sửa</button>
                <button class="btn btn-outline-danger btn-sm" data-delete-menu="${escapeHtml(menu.id)}">Xóa</button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    const formSlot = document.getElementById('menu-form-slot');
    const openForm = (menu = null) => {
      formSlot.innerHTML = renderMenuForm(menu);
      bindMenuForm(menu);
    };

    document.getElementById('new-menu-btn').addEventListener('click', () => {
      openForm(null);
    });

    document.querySelectorAll('[data-edit-menu]').forEach((button) => {
      button.addEventListener('click', () => {
        const menu = state.menus.find((item) => item.id === button.dataset.editMenu);
        openForm(menu || null);
      });
    });

    document.querySelectorAll('[data-toggle-available]').forEach((button) => {
      button.addEventListener('click', async () => {
        const menu = state.menus.find((item) => item.id === button.dataset.toggleAvailable);
        if (!menu) return;
        await api.updateMenu(menu.id, { is_available: !menu.is_available });
        await renderMenu();
      });
    });

    document.querySelectorAll('[data-delete-menu]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Xóa món này?')) return;
        await api.deleteMenu(button.dataset.deleteMenu);
        await renderMenu();
      });
    });
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải menu: ${escapeHtml(error.message)}</div>`;
  }
}

function bindMenuForm(menu) {
  const form = document.getElementById('menu-form');
  if (!form) return;

  const cancelButton = document.getElementById('menu-cancel');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      document.getElementById('menu-form-slot').innerHTML = '';
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const feedback = document.getElementById('menu-form-feedback');
    const payload = {
      name: document.getElementById('menu-name').value.trim(),
      price: Number(document.getElementById('menu-price').value),
      category_id: document.getElementById('menu-category').value || null,
      image_url: document.getElementById('menu-image').value.trim() || null,
      description: document.getElementById('menu-description').value.trim() || null,
      is_available: document.getElementById('menu-available').checked,
    };

    try {
      feedback.innerText = 'Đang lưu...';
      if (menu?.id) {
        await api.updateMenu(menu.id, payload);
      } else {
        await api.createMenu(payload);
      }
      await renderMenu();
    } catch (error) {
      feedback.innerText = error.message;
    }
  });
}

function renderPartners() {
  setActiveTab('partners');
  const content = document.getElementById('content');
  content.innerHTML = `
    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Quản lý đối tác</span>
          <h1>Duyệt quán mới</h1>
        </div>
        <button class="btn btn-outline" id="reset-partners">Khôi phục mẫu</button>
      </div>
      <div class="partner-grid">
        ${state.partnerQueue.map((partner) => `
          <article class="partner-card glass">
            <div class="order-top">
              <div>
                <h3>${escapeHtml(partner.name)}</h3>
                <p class="text-muted">${escapeHtml(partner.area)}</p>
              </div>
              <span class="badge ${partner.status === 'approved' ? 'badge-success' : partner.status === 'rejected' ? 'badge-muted' : 'badge-warning'}">
                ${escapeHtml(partner.status)}
              </span>
            </div>
            <p>${escapeHtml(partner.note || 'Chưa có ghi chú')}</p>
            <div class="order-actions">
              <button class="btn btn-primary btn-sm" data-partner-action="${escapeHtml(partner.id)}" data-status="approved">Duyệt</button>
              <button class="btn btn-outline-danger btn-sm" data-partner-action="${escapeHtml(partner.id)}" data-status="rejected">Từ chối</button>
            </div>
          </article>
        `).join('')}
      </div>
      <div class="metrics-note">Đây là khu vực demo local cho luồng merchant onboarding khi backend chưa có endpoint riêng.</div>
    </section>
  `;

  document.getElementById('reset-partners').addEventListener('click', () => {
    state.partnerQueue = DEFAULT_PARTNERS.map((partner) => ({ ...partner }));
    saveJson(PARTNER_QUEUE_KEY, state.partnerQueue);
    renderPartners();
  });

  document.querySelectorAll('[data-partner-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const partner = state.partnerQueue.find((item) => item.id === button.dataset.partnerAction);
      if (!partner) return;
      partner.status = button.dataset.status;
      saveJson(PARTNER_QUEUE_KEY, state.partnerQueue);
      renderPartners();
    });
  });
}

async function renderEmployees() {
  setActiveTab('employees');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải nhân sự...</div>`;

  try {
    await loadStaff();
    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Nhân sự</span>
            <h1>Quản lý đội ngũ</h1>
          </div>
        </div>
        <div class="form-card glass">
          <h2>Thêm nhân viên</h2>
          <form id="employee-form" class="form-grid">
            <div class="form-group"><label class="form-label">Họ tên</label><input id="emp-name" class="form-control" required /></div>
            <div class="form-group"><label class="form-label">Vai trò</label><input id="emp-role" class="form-control" required /></div>
            <div class="form-group"><label class="form-label">Lương</label><input id="emp-salary" type="number" class="form-control" /></div>
            <div class="form-group align-end"><button class="btn btn-primary" type="submit">Lưu</button></div>
          </form>
        </div>
        <div class="table-shell glass">
          <table class="data-table">
            <thead><tr><th>Họ tên</th><th>Vai trò</th><th>Lương</th><th>Hành động</th></tr></thead>
            <tbody>
              ${state.employees.map((employee) => `
                <tr>
                  <td>${escapeHtml(employee.name)}</td>
                  <td>${escapeHtml(employee.role)}</td>
                  <td>${money(employee.salary)} đ</td>
                  <td><button class="btn btn-outline-danger btn-sm" data-delete-employee="${escapeHtml(employee.id)}">Xóa</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    document.getElementById('employee-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      await api.createEmployee({
        name: document.getElementById('emp-name').value.trim(),
        role: document.getElementById('emp-role').value.trim(),
        salary: Number(document.getElementById('emp-salary').value || 0),
      });
      await renderEmployees();
    });

    document.querySelectorAll('[data-delete-employee]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Xóa nhân viên này?')) return;
        await api.deleteEmployee(button.dataset.deleteEmployee);
        await renderEmployees();
      });
    });
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải nhân sự: ${escapeHtml(error.message)}</div>`;
  }
}

async function renderPromotions() {
  setActiveTab('promotions');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải ưu đãi...</div>`;

  try {
    await loadPromotions();
    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Ưu đãi</span>
            <h1>Quản lý mã khuyến mãi</h1>
          </div>
        </div>
        <div class="form-card glass">
          <h2>Tạo mã</h2>
          <form id="promotion-form" class="form-grid">
            <div class="form-group"><label class="form-label">Mã</label><input id="promo-code" class="form-control" required /></div>
            <div class="form-group"><label class="form-label">Giảm (%)</label><input id="promo-percent" type="number" class="form-control" min="0" max="100" required /></div>
            <div class="form-group align-end"><button class="btn btn-primary" type="submit">Lưu</button></div>
          </form>
        </div>
        <div class="table-shell glass">
          <table class="data-table">
            <thead><tr><th>Mã</th><th>Giảm</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              ${state.promotions.map((promotion) => `
                <tr>
                  <td>${escapeHtml(promotion.code)}</td>
                  <td>${escapeHtml(promotion.discount_percentage)}%</td>
                  <td>${promotion.is_active ? 'Đang chạy' : 'Tạm dừng'}</td>
                  <td><button class="btn btn-outline-danger btn-sm" data-delete-promotion="${escapeHtml(promotion.id)}">Xóa</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    document.getElementById('promotion-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      await api.createPromotion({
        code: document.getElementById('promo-code').value.trim(),
        discount_percentage: Number(document.getElementById('promo-percent').value),
      });
      await renderPromotions();
    });

    document.querySelectorAll('[data-delete-promotion]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Xóa mã này?')) return;
        await api.deletePromotion(button.dataset.deletePromotion);
        await renderPromotions();
      });
    });
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải ưu đãi: ${escapeHtml(error.message)}</div>`;
  }
}

async function renderExpenses() {
  setActiveTab('expenses');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-state">Đang tải chi tiêu...</div>`;

  try {
    await loadExpenses();
    content.innerHTML = `
      <section class="section-block">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Chi tiêu</span>
            <h1>Đối soát cơ bản</h1>
          </div>
        </div>
        <div class="form-card glass">
          <h2>Thêm khoản chi</h2>
          <form id="expense-form" class="form-grid">
            <div class="form-group"><label class="form-label">Mô tả</label><input id="exp-desc" class="form-control" required /></div>
            <div class="form-group"><label class="form-label">Số tiền</label><input id="exp-amount" type="number" class="form-control" required /></div>
            <div class="form-group"><label class="form-label">Ngày</label><input id="exp-date" type="date" class="form-control" /></div>
            <div class="form-group align-end"><button class="btn btn-primary" type="submit">Lưu</button></div>
          </form>
        </div>
        <div class="table-shell glass">
          <table class="data-table">
            <thead><tr><th>Mô tả</th><th>Số tiền</th><th>Ngày</th><th>Hành động</th></tr></thead>
            <tbody>
              ${state.expenses.map((expense) => `
                <tr>
                  <td>${escapeHtml(expense.description)}</td>
                  <td>${money(expense.amount)} đ</td>
                  <td>${escapeHtml(expense.expense_date || formatDate(expense.created_at))}</td>
                  <td><button class="btn btn-outline-danger btn-sm" data-delete-expense="${escapeHtml(expense.id)}">Xóa</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    document.getElementById('expense-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      await api.createExpense({
        description: document.getElementById('exp-desc').value.trim(),
        amount: Number(document.getElementById('exp-amount').value),
        expense_date: document.getElementById('exp-date').value || null,
      });
      await renderExpenses();
    });

    document.querySelectorAll('[data-delete-expense]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Xóa khoản chi này?')) return;
        await api.deleteExpense(button.dataset.deleteExpense);
        await renderExpenses();
      });
    });
  } catch (error) {
    content.innerHTML = `<div class="error-state">Lỗi tải chi tiêu: ${escapeHtml(error.message)}</div>`;
  }
}

function router() {
  const hash = window.location.hash || '#/dashboard';
  stopTimer();

  if (hash === '#/dashboard' || hash === '#/') {
    renderDashboard();
    state.timer = setInterval(() => {
      if (window.location.hash === '#/dashboard' || window.location.hash === '#/') {
        renderDashboard();
      }
    }, POLL_INTERVAL_MS);
    return;
  }

  if (hash === '#/orders') {
    renderOrders();
    state.timer = setInterval(() => {
      if (window.location.hash === '#/orders') {
        renderOrders();
      }
    }, POLL_INTERVAL_MS);
    return;
  }

  if (hash === '#/menu') {
    renderMenu();
    return;
  }

  if (hash === '#/partners') {
    renderPartners();
    return;
  }

  if (hash === '#/employees') {
    renderEmployees();
    return;
  }

  if (hash === '#/promotions') {
    renderPromotions();
    return;
  }

  if (hash === '#/expenses') {
    renderExpenses();
    return;
  }

  renderDashboard();
}

window.addEventListener('hashchange', () => {
  if (getToken() && isAdminLike(getUser()?.role)) {
    router();
  }
});

init();
