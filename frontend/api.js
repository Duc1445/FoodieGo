const API_URL = window.__FOODIEGO_API_URL__ || 'http://localhost:3000/api';

function getDemoState() {
  try {
    return window.__FOODIEGO_DEMO__ || window.parent?.__FOODIEGO_DEMO__ || null;
  } catch {
    return null;
  }
}

function getDemoUserFromEmail(email = '', defaultRole = 'customer') {
  const lower = email.toLowerCase();
  if (lower.includes('admin')) {
    return { id: 'admin-id', email, full_name: 'Admin Demo', role: 'admin' };
  }
  if (lower.includes('merchant') || lower.includes('merchant')) {
    return { id: 'merchant-id', email, full_name: 'Merchant Demo', role: 'merchant' };
  }
  if (lower.includes('shipper')) {
    return { id: 'shipper-id', email, full_name: 'Shipper Demo', role: 'shipper' };
  }
  return { id: 'customer-id', email, full_name: 'Người dùng Demo', role: defaultRole };
}

function demoData() {
  return {
    categories: [
      { id: 'c1', name: 'Bún - Phở' },
      { id: 'c2', name: 'Cơm' },
      { id: 'c3', name: 'Bánh mì' },
      { id: 'c4', name: 'Đồ uống' },
      { id: 'c5', name: 'Tráng miệng' },
    ],
    menus: [
      { id: 'm1', name: 'Phở bò tái nạm', price: 45000, description: 'Phở bò nước dùng ngọt thanh', image_url: '', category_id: 'c1', is_available: true },
      { id: 'm2', name: 'Cơm gà xối mỡ', price: 52000, description: 'Phần cơm nóng giòn dễ ăn', image_url: '', category_id: 'c2', is_available: true },
      { id: 'm3', name: 'Bánh mì thịt nướng', price: 28000, description: 'Nhẹ bụng, nhanh gọn', image_url: '', category_id: 'c3', is_available: true },
    ],
    orders: [
      { id: 'o1', user_id: 'u1', order_type: 'takeaway', total_price: 45000, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), address: '123 Nguyễn Huệ' },
      { id: 'o2', user_id: 'u2', order_type: 'takeaway', total_price: 97000, status: 'preparing', created_at: new Date(Date.now() - 15 * 60000).toISOString(), updated_at: new Date().toISOString(), address: '45 Võ Văn Tần' },
      { id: 'o3', user_id: 'u3', order_type: 'takeaway', total_price: 68000, status: 'completed', created_at: new Date(Date.now() - 40 * 60000).toISOString(), updated_at: new Date().toISOString(), address: '77 Trần Hưng Đạo' },
    ],
    delivery: { id: 'd1', order_id: 'o1', status: 'accepted' },
    stats: { total_users: 24, total_orders: 38, total_revenue: 3800000, total_expenses: 1150000 },
    employees: [{ id: 'e1', name: 'Minh', role: 'Bếp trưởng', salary: 12000000 }],
    promotions: [{ id: 'p1', code: 'SAVE10', discount_percentage: 10, is_active: true }],
    expenses: [{ id: 'x1', description: 'Gas bếp', amount: 120000, expense_date: '2026-07-10', created_at: new Date().toISOString() }],
  };
}

async function demoRequest(endpoint, options = {}) {
  const demo = getDemoState();
  if (!demo) return null;

  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.replace(/^\/+/, '');
  const mock = { ...demoData(), ...demo };

  if (path === 'auth/login' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const user = demo.user || getDemoUserFromEmail(body.email || '', demo.defaultRole || 'customer');
    return { success: true, message: 'Login successful', data: { token: `${user.role}-token`, user } };
  }

  if (path === 'auth/register' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const user = { id: 'customer-id', email: body.email, full_name: body.full_name || 'Người dùng Demo', role: 'customer' };
    return { success: true, message: 'Registered successfully', data: { token: 'customer-token', user } };
  }

  if (path === 'auth/profile' && method === 'GET') {
    return { success: true, data: demo.user || getDemoUserFromEmail('demo@foodiego.com') };
  }

  if (path === 'auth/profile' && method === 'PUT') {
    return { success: true, message: 'Profile updated', data: demo.user || getDemoUserFromEmail('demo@foodiego.com') };
  }

  if (path === 'categories' && method === 'GET') {
    return { success: true, data: mock.categories };
  }

  if ((path === 'menus' || path === 'foods') && method === 'GET') {
    return { success: true, data: mock.menus };
  }

  if (path.startsWith('menus/') && method === 'GET') {
    const id = path.split('/')[1];
    return { success: true, data: mock.menus.find((item) => item.id === id) || mock.menus[0] };
  }

  if ((path === 'menus' || path === 'foods') && method === 'POST') {
    return { success: true, data: mock.menus[0] };
  }

  if (path.startsWith('menus/') && (method === 'PUT' || method === 'DELETE')) {
    return { success: true, data: mock.menus[0], message: method === 'DELETE' ? 'Menu deleted' : 'Menu updated' };
  }

  if (path === 'orders' && method === 'GET') {
    return { success: true, data: mock.orders.filter((order) => order.user_id === 'u1') };
  }

  if (path === 'orders' && method === 'POST') {
    return { success: true, message: 'Order placed successfully', data: { id: 'o-new', status: 'pending' } };
  }

  if (path === 'orders/all' && method === 'GET') {
    return { success: true, data: mock.orders };
  }

  if (path.startsWith('orders/') && path.endsWith('/status') && method === 'PATCH') {
    return { success: true, data: { id: path.split('/')[1], status: 'confirmed' } };
  }

  if (path.startsWith('orders/') && method === 'GET') {
    const id = path.split('/')[1];
    return { success: true, data: mock.orders.find((order) => order.id === id) || { id, status: 'pending', items: [] } };
  }

  if (path.startsWith('delivery/order/') && method === 'GET') {
    return { success: true, data: mock.delivery };
  }

  if (path.startsWith('delivery/') && path.endsWith('/accept') && method === 'PATCH') {
    return { success: true, data: { ...mock.delivery, status: 'accepted' } };
  }

  if (path.startsWith('delivery/') && path.endsWith('/status') && method === 'PATCH') {
    return { success: true, data: { ...mock.delivery, status: 'delivering' } };
  }

  if (path === 'analytics' && method === 'GET') {
    return mock.stats;
  }

  if (path === 'employees' && method === 'GET') {
    return { success: true, data: mock.employees };
  }
  if (path === 'employees' && method === 'POST') {
    return { success: true, data: mock.employees[0] };
  }
  if (path.startsWith('employees/') && (method === 'PUT' || method === 'DELETE')) {
    return { success: true, data: mock.employees[0] };
  }

  if (path === 'promotions' && method === 'GET') {
    return { success: true, data: mock.promotions };
  }
  if (path === 'promotions' && method === 'POST') {
    return { success: true, data: mock.promotions[0] };
  }
  if (path.startsWith('promotions/') && (method === 'PUT' || method === 'DELETE')) {
    return { success: true, data: mock.promotions[0] };
  }

  if (path === 'expenses' && method === 'GET') {
    return { success: true, data: mock.expenses };
  }
  if (path === 'expenses' && method === 'POST') {
    return { success: true, data: mock.expenses[0] };
  }
  if (path.startsWith('expenses/') && (method === 'PUT' || method === 'DELETE')) {
    return { success: true, data: mock.expenses[0] };
  }

  return null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

async function request(endpoint, options = {}) {
  const demoResponse = await demoRequest(endpoint, options);
  if (demoResponse) {
    return demoResponse;
  }

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
}

const postJson = (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) });
const putJson = (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
const patchJson = (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
const deleteJson = (endpoint) => request(endpoint, { method: 'DELETE' });

export const api = {
  login: (email, password) => postJson('/auth/login', { email, password }),
  register: (name, email, password) => postJson('/auth/register', { full_name: name, email, password }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => putJson('/auth/profile', data),

  getCategories: () => request('/categories'),
  getMenus: () => request('/menus'),
  getMenuById: (id) => request(`/menus/${id}`),
  getFoods: () => request('/menus'),
  createMenu: (data) => postJson('/menus', data),
  updateMenu: (id, data) => putJson(`/menus/${id}`, data),
  deleteMenu: (id) => deleteJson(`/menus/${id}`),
  createFood: (data) => postJson('/menus', data),
  updateFood: (id, data) => putJson(`/menus/${id}`, data),
  deleteFood: (id) => deleteJson(`/menus/${id}`),

  checkout: (cart, address, note, paymentMethod = 'cod') => postJson('/orders', {
    cart,
    address,
    note,
    order_type: 'takeaway',
    payment_method: paymentMethod,
  }),
  getOrders: () => request('/orders'),
  getAllOrders: () => request('/orders/all'),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) => patchJson(`/orders/${id}/status`, { status }),

  getDeliveryByOrder: (orderId) => request(`/delivery/order/${orderId}`),
  acceptDelivery: (id) => patchJson(`/delivery/${id}/accept`, {}),
  updateDeliveryStatus: (id, status) => patchJson(`/delivery/${id}/status`, { status }),

  getAdminStats: () => request('/analytics'),
  getExpenses: () => request('/expenses'),
  createExpense: (data) => postJson('/expenses', data),
  updateExpense: (id, data) => putJson(`/expenses/${id}`, data),
  deleteExpense: (id) => deleteJson(`/expenses/${id}`),

  getEmployees: () => request('/employees'),
  createEmployee: (data) => postJson('/employees', data),
  updateEmployee: (id, data) => putJson(`/employees/${id}`, data),
  deleteEmployee: (id) => deleteJson(`/employees/${id}`),

  getPromotions: () => request('/promotions'),
  createPromotion: (data) => postJson('/promotions', data),
  updatePromotion: (id, data) => putJson(`/promotions/${id}`, data),
  deletePromotion: (id) => deleteJson(`/promotions/${id}`),
};
