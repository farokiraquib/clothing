export const API_ROOT = import.meta.env.DEV ? 'http://localhost:5000' : '';
const API_BASE = `${API_ROOT}/api`;

async function request(url, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${url}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return res.json();
}

function authHeaders() {
  const pw = localStorage.getItem('adminPassword');
  return pw ? { 'x-admin-password': pw } : {};
}

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products?${query}`);
};

export const getProduct = (id) => request(`/products/${id}`);
export const getFeaturedProducts = () => request('/products/featured');
export const getNewArrivals = () => request('/products/new-arrivals');
export const searchProducts = (q) => request(`/products/search?q=${encodeURIComponent(q)}`);

export const addProduct = (formData) =>
  fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  }).then(r => r.json());

export const updateProduct = (id, formData) =>
  fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  }).then(r => r.json());

export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE', headers: authHeaders() });

// Categories
export const getCategories = () => request('/categories');
export const updateCategory = (id, formData) =>
  fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  }).then(r => r.json());

// Brands
export const getBrands = () => request('/brands');
export const addBrand = (data) => request('/brands', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });

// Orders
export const createOrder = (orderData) =>
  request('/orders', { method: 'POST', body: JSON.stringify(orderData) });

export const getOrders = () =>
  request('/orders', { headers: authHeaders() });

export const getOrder = (id) => request(`/orders/${id}`);

export const trackOrder = (orderId, email) =>
  request(`/orders/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);

export const updateOrderStatus = (id, data) =>
  request(`/orders/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });

// Admin
export const adminLogin = (password) =>
  request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) });

export const getAdminStats = () =>
  request('/admin/stats', { headers: authHeaders() });

export const exportCustomersCSV = () => {
  const pw = localStorage.getItem('adminPassword');
  window.open(`${API_BASE}/admin/customers/export?adminPassword=${pw || ''}`, '_blank');
};

export const getSettings = () => request('/admin/settings');
export const updateSettings = (data) =>
  request('/admin/settings', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });

// Banners
export const getBanners = () => request('/admin/banners');
export const addBanner = (data) =>
  request('/admin/banners', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
export const updateBanner = (id, data) =>
  request(`/admin/banners/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
export const deleteBanner = (id) =>
  request(`/admin/banners/${id}`, { method: 'DELETE', headers: authHeaders() });
export const reorderBanners = (order) =>
  request('/admin/banners-reorder', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ order }) });

// Auth / User
export const registerUser = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const loginUser = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMyProfile = (token) =>
  request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });

export const updateMyProfile = (token, data) =>
  request('/auth/me', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });

export const getMyOrders = (token) =>
  request('/auth/orders', { headers: { Authorization: `Bearer ${token}` } });

export const getReviews = (productId) => request(`/reviews/${productId}`);
export const submitReview = (data) =>
  request('/reviews', { method: 'POST', body: JSON.stringify(data) });
