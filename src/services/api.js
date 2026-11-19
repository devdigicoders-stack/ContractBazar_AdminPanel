// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://contractbazar-backend.onrender.com/api';

// Base Origin for Media / Uploads (strips trailing /api if present)
export const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Helper to format media/document URLs safely
export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // If it was stored with localhost:5000, replace with live production backend URL
    if (path.includes('localhost:5000')) {
      return path.replace('http://localhost:5000', FILE_BASE_URL);
    }
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${FILE_BASE_URL}${cleanPath}`;
}

// Helper to make authenticated requests
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token is invalid or expired, clear session
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Do NOT force window.location.href here to avoid infinite redirect loops
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Admin Auth APIs
export const adminAuthApi = {
  login: async (email, password) => {
    const data = await apiRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
    }
    return data;
  },

  getProfile: async () => {
    return await apiRequest('/admin/auth/me');
  },

  changePassword: async (passwordData) => {
    return await apiRequest('/admin/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentAdmin: () => {
    try {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};

// Admin Panel Data APIs (Dashboard, Vendors, Categories, Orders)
export const adminPanelApi = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return await apiRequest('/admin/panel/dashboard-stats');
  },

  // Revenue & Commissions Stats
  getRevenueCommission: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/panel/revenue-commission${query ? `?${query}` : ''}`);
  },

  // Platform Settings
  getSettings: async () => {
    return await apiRequest('/admin/panel/settings');
  },

  updateSettings: async (settingsData) => {
    return await apiRequest('/admin/panel/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Drivers / Delivery Fleet
  getDrivers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/panel/drivers${query ? `?${query}` : ''}`);
  },

  createDriver: async (driverData) => {
    return await apiRequest('/admin/panel/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  },

  updateDriverStatus: async (id, updateData) => {
    return await apiRequest(`/admin/panel/drivers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  deleteDriver: async (id) => {
    return await apiRequest(`/admin/panel/drivers/${id}`, {
      method: 'DELETE',
    });
  },

  // File Upload Helper for Admin
  uploadFile: async (file, category = 'categories', appType = 'admin') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('appType', appType);

    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    return data;
  },

  // Categories
  getCategories: async () => {
    return await apiRequest('/admin/panel/categories');
  },

  createCategory: async (categoryData) => {
    return await apiRequest('/admin/panel/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, categoryData) => {
    return await apiRequest(`/admin/panel/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id) => {
    return await apiRequest(`/admin/panel/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Vendors
  getVendors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/panel/vendors${query ? `?${query}` : ''}`);
  },

  createVendor: async (vendorData) => {
    return await apiRequest('/admin/panel/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  },

  updateVendorStatus: async (id, updateData) => {
    return await apiRequest(`/admin/panel/vendors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  deleteVendor: async (id) => {
    return await apiRequest(`/admin/panel/vendors/${id}`, {
      method: 'DELETE',
    });
  },

  getVendorDetail360: async (id) => {
    return await apiRequest(`/admin/panel/vendors/${id}/detail360`);
  },

  getDriverDetail360: async (id) => {
    return await apiRequest(`/admin/panel/drivers/${id}/detail360`);
  },

  // Orders
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/panel/orders${query ? `?${query}` : ''}`);
  },

  createOrder: async (orderData) => {
    return await apiRequest('/admin/panel/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateOrderStatus: async (id, updateData) => {
    return await apiRequest(`/admin/panel/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  deleteOrder: async (id) => {
    return await apiRequest(`/admin/panel/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Test FCM Push Notification to Customer / Vendor / Delivery apps
  sendTestFcm: async ({ appType, phone, token, title, body }) => {
    return await apiRequest('/test/fcm', {
      method: 'POST',
      body: JSON.stringify({ appType, phone, token, title, body }),
    });
  },
};
