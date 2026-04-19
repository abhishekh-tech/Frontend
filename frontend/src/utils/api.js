export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Convert relative URL to absolute if needed
  const absoluteUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(absoluteUrl, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return response;
};
