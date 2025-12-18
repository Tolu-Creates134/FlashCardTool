import axios from 'axios';
import { triggerLogout } from '../utils/logoutManager';

/**
 * Create axios instance
 */
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
});

let refreshRequest = null;

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = refreshAccessToken()
            .then(({ accessToken, refreshToken }) => {
              localStorage.setItem('accessToken', accessToken);
              if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
              }
              api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
              return accessToken;
            })
            .finally(() => {
              refreshRequest = null;
            });
        }

        const newAccessToken = await refreshRequest;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        refreshRequest = null;
        const refreshStatus = refreshError.response?.status;
        const missingRefreshToken = refreshError.message === 'Missing refresh token';
        if (refreshStatus === 401 || refreshStatus === 403 || missingRefreshToken) {
          triggerLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Login with details
 * @param {*} idToken
 * @returns
 */
export const loginWithGoogle = async (idToken) => {
  const res = await api.post("/auth/google-login", { idToken: idToken });
  return res.data; // contains accessToken, refreshToken, email
};

/**
 * Fetches all categories.
 * @returns
 */
export const fetchCategories = async () => {
  const res = await api.get('/categories');
  return res.data.categories;
};

/**
 * Creates a category
 * @param {*} categoryData
 * @returns
 */
export const createCategory = async (categoryData) => {
  const res = await api.post('/categories', { category: categoryData });
  return res.data.category;
};

/**
 * Fetches all decks.
 * @returns
 */
export const fetchDecks = async () => {
  const res = await api.get('/decks');
  return res.data;
};

/**
 * Creates deck and stores in database
 * @param {*} deckData
 * @returns
 */
export const createDeck = async (deckData) => {
  const payload = { deck: deckData };
  const res = await api.post('/decks', payload);
  return res.data;
};

/**
 * Fetches logged in user details
 * @returns
 */
export const fetchCurrentUser = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

export default api;
