import './style.css';
import { api, getToken, getUser, setToken, setUser } from './api.js';

const app = document.getElementById('app');

function init() {
  const user = getUser();
  if (!getToken() || !user || user.role !== 'admin') {
    renderAdminLogin();
  } else {
    renderLayout();
    router();
  }
}

function renderAdminLogin() {
  app.innerHTML = `
    <div class="glass auth-container view" style="margin: 5rem auto; max-width: 400px; padding: 2rem;">
      <h2 class="text-center" style="color: var(--primary)">Đăng Nhập Quản Trị</h2>
      <form id="admin-login-form" class="mt-4">
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
        <p class="text-center mt-2"><a href="./index.html">Về Trang Khách Hàng</a></p>
      </form>
    </div>
  `;
  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');
    try {
      errEl.innerText = 'Đang đăng nhập...';
      const res = await api.login(email, password);
      if (res.data.user.role !== 'admin') {
        throw new Error('Tài khoản không có quyền Admin!');
      }
      setToken(res.data.token);
      setUser(res.data.user);
      renderLayout();
      router();
    } catch (err) {
      errEl.innerText = err.message;
    }
  });
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────
function renderLayout() {
  app.innerHTML = `
    <div class="sidebar">
      <h2>FoodieGo Admin</h2>
      <a href="#/dashboard" class="nav-btn" data-tab="dashboard">📊 Tổng Quan</a>
      <a href="#/orders" class="nav-btn" data-tab="orders">🧾 Hóa Đơn</a>
      <a href="#/foods" class="nav-btn" data-tab="foods">🍔 Món Ăn</a>
      <a href="#/employees" class="nav-btn" data-tab="employees">👥 Nhân Sự</a>
      <a href="#/promotions" class="nav-btn" data-tab="promotions">🎁 Ưu Đãi</a>
      <a href="#/expenses" class="nav-btn" data-tab="expenses">💸 Chi Tiêu</a>
      <a href="#" id="logout" style="margin-top: 2rem; color: red;">🚪 Đăng Xuất</a>
    </div>
    <div class="admin-content" id="content"></div>
  `;

  document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = './index.html';
  });
}

function setActiveTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (btn) btn.classList.add('active');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
async function renderDashboard() {
  setActiveTab('dashboard');
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Loading Dashboard...</h2>`;
  
  try {
    const res = await api.getAdminStats();
    
    // In Python analytics-service, stats returns total_users, total_orders, total_revenue, total_expenses
    const profit = (res.total_revenue || 0) - (res.total_expenses || 0);

    content.innerHTML = `
      <h2>Tổng Quan Nhà Hàng</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-title">Tổng Doanh Thu</div>
          <div class="stat-value" style="color: green">${(res.total_revenue || 0).toLocaleString('vi-VN')} đ</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Tổng Chi Tiêu</div>
          <div class="stat-value" style="color: red">${(res.total_expenses || 0).toLocaleString('vi-VN')} đ</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Lợi Nhuận</div>
          <div class="stat-value" style="color: blue">${profit.toLocaleString('vi-VN')} đ</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Khách Hàng</div>
          <div class="stat-value">${res.total_users || 0}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tổng Số Đơn Hàng Đã Đặt</div>
        <div class="stat-value">${res.total_orders || 0}</div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<h2 style="color:red">Lỗi tải dữ liệu: ${err.message}</h2>`;
  }
}

// ─── ORDERS ───────────────────────────────────────────────────────────────
async function renderOrders() {
  setActiveTab('orders');
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Loading Orders...</h2>`;
  
  try {
    const res = await api.getAdminOrders();
    const orders = res.data;
    
    let html = `
      <h2>Quản Lý Hóa Đơn</h2>
      <table class="table mt-4">
        <thead>
          <tr>
            <th>Mã Đơn</th>
            <th>Loại</th>
            <th>Tổng Tiền</th>
            <th>Trạng Thái</th>
            <th>Ngày Đặt</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
    `;

    orders.forEach(o => {
      html += `
        <tr>
          <td>${o.id.substring(0,8)}</td>
          <td>${o.order_type === 'dine-in' ? 'Ăn tại chỗ' : 'Mua về'}</td>
          <td>${parseFloat(o.total_price).toLocaleString('vi-VN')} đ</td>
          <td>
            <select class="form-control status-select" data-id="${o.id}" style="width: auto">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ duyệt</option>
              <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
              <option value="delivering" ${o.status === 'delivering' ? 'selected' : ''}>Đang giao</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã Hủy</option>
            </select>
          </td>
          <td>${new Date(o.created_at).toLocaleString('vi-VN')}</td>
          <td>
            <button class="btn btn-primary btn-sm update-status-btn" data-id="${o.id}">Cập Nhật</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    content.innerHTML = html;

    document.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const select = document.querySelector(`.status-select[data-id="${id}"]`);
        try {
          await api.updateOrderStatus(id, select.value);
          alert('Cập nhật trạng thái thành công!');
        } catch (err) {
          alert('Lỗi: ' + err.message);
        }
      });
    });

  } catch (err) {
    content.innerHTML = `<h2 style="color:red">Lỗi tải dữ liệu: ${err.message}</h2>`;
  }
}

// ─── EXPENSES ───────────────────────────────────────────────────────────────
async function renderExpenses() {
  setActiveTab('expenses');
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Loading Expenses...</h2>`;
  
  try {
    const res = await api.getExpenses();
    const items = res.data || [];
    
    let html = `
      <div class="flex-between">
        <h2>Quản Lý Chi Tiêu</h2>
        <button class="btn btn-primary" id="add-expense">Thêm Khoản Chi</button>
      </div>
      <div id="expense-form" style="display: none; background: white; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
        <input type="text" id="exp-desc" placeholder="Mô tả khoản chi" class="form-control" style="margin-bottom: 0.5rem" />
        <input type="number" id="exp-amount" placeholder="Số tiền (VNĐ)" class="form-control" style="margin-bottom: 0.5rem" />
        <input type="date" id="exp-date" class="form-control" style="margin-bottom: 0.5rem" />
        <button class="btn btn-primary" id="save-expense">Lưu</button>
      </div>
      <table class="table mt-4">
        <thead>
          <tr>
            <th>Mô Tả</th>
            <th>Số Tiền</th>
            <th>Ngày Chi</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach(i => {
      html += `
        <tr>
          <td>${i.description}</td>
          <td>${parseFloat(i.amount).toLocaleString('vi-VN')} đ</td>
          <td>${i.expense_date || new Date(i.created_at).toLocaleDateString('vi-VN')}</td>
          <td>
            <button class="btn btn-outline rm-expense" data-id="${i.id}">Xóa</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    content.innerHTML = html;

    document.getElementById('add-expense').addEventListener('click', () => {
      document.getElementById('expense-form').style.display = 'block';
    });

    document.getElementById('save-expense').addEventListener('click', async () => {
      const desc = document.getElementById('exp-desc').value;
      const amount = document.getElementById('exp-amount').value;
      const date = document.getElementById('exp-date').value;
      if (!desc || !amount) return alert('Vui lòng nhập đủ thông tin');
      
      try {
        await api.createExpense({ description: desc, amount: parseFloat(amount), expense_date: date || null });
        renderExpenses();
      } catch (err) { alert(err.message); }
    });

    document.querySelectorAll('.rm-expense').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        try {
          await api.deleteExpense(e.target.dataset.id);
          renderExpenses();
        } catch (err) { alert(err.message); }
      });
    });

  } catch (err) {
    content.innerHTML = `<h2 style="color:red">Lỗi tải dữ liệu: ${err.message}</h2>`;
  }
}

// ─── EMPLOYEES ─────────────────────────────────────────────────────────────
async function renderEmployees() {
  setActiveTab('employees');
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Loading Employees...</h2>`;
  
  try {
    const res = await api.getEmployees();
    const items = res.data || [];
    
    let html = `
      <div class="flex-between">
        <h2>Quản Lý Nhân Sự</h2>
        <button class="btn btn-primary" id="add-emp">Thêm Nhân Viên</button>
      </div>
      <div id="emp-form" style="display: none; background: white; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
        <input type="text" id="emp-name" placeholder="Họ Tên" class="form-control" style="margin-bottom: 0.5rem" />
        <input type="text" id="emp-role" placeholder="Chức vụ (vd: Bếp trưởng, Phục vụ...)" class="form-control" style="margin-bottom: 0.5rem" />
        <input type="number" id="emp-salary" placeholder="Mức lương (VNĐ)" class="form-control" style="margin-bottom: 0.5rem" />
        <button class="btn btn-primary" id="save-emp">Lưu</button>
      </div>
      <table class="table mt-4">
        <thead>
          <tr>
            <th>Họ Tên</th>
            <th>Chức Vụ</th>
            <th>Mức Lương</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach(i => {
      html += `
        <tr>
          <td>${i.name}</td>
          <td>${i.role}</td>
          <td>${parseFloat(i.salary).toLocaleString('vi-VN')} đ</td>
          <td>
            <button class="btn btn-outline rm-emp" data-id="${i.id}">Nghỉ Việc</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    content.innerHTML = html;

    document.getElementById('add-emp').addEventListener('click', () => {
      document.getElementById('emp-form').style.display = 'block';
    });

    document.getElementById('save-emp').addEventListener('click', async () => {
      const name = document.getElementById('emp-name').value;
      const role = document.getElementById('emp-role').value;
      const salary = document.getElementById('emp-salary').value;
      if (!name || !role) return alert('Vui lòng nhập đủ thông tin');
      
      try {
        await api.createEmployee({ name, role, salary: parseFloat(salary) || 0 });
        renderEmployees();
      } catch (err) { alert(err.message); }
    });

    document.querySelectorAll('.rm-emp').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Xóa nhân viên này?')) return;
        try {
          await api.deleteEmployee(e.target.dataset.id);
          renderEmployees();
        } catch (err) { alert(err.message); }
      });
    });

  } catch (err) {
    content.innerHTML = `<h2 style="color:red">Lỗi tải dữ liệu: ${err.message}</h2>`;
  }
}

// ─── ROUTER ───────────────────────────────────────────────────────────────
function router() {
  const hash = window.location.hash;
  if (!hash || hash === '#/dashboard') return renderDashboard();
  if (hash === '#/orders') return renderOrders();
  if (hash === '#/expenses') return renderExpenses();
  if (hash === '#/employees') return renderEmployees();
  
  document.getElementById('content').innerHTML = `<h2>Tính năng đang phát triển...</h2>`;
}

// Init
init();
window.addEventListener('hashchange', () => {
  if (getToken() && getUser()?.role === 'admin') router();
});
