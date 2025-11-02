import axios from 'axios';

/**
 * Create axios instance
 */
const api = axios.create({
    api_base_url: `${process.env.REACT_APP_API_BASE_URL}/api`
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    };

    return config;
});

/**
 * Fetches all categories.
 * @returns 
 */
export const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

/**
 * Fetches all decks.
 * @returns 
 */
export const fetchDecks = async () => {
  const res = await api.get("/decks");
  return res.data;
};

/**
 * Creates deck and stores in database
 * @param {*} deckData 
 * @returns 
 */
export const createDeck = async (deckData) => {
  const res = await api.post("/decks", deckData);
  return res.data;
};

/**
 * Fetches logged in user details
 * @returns 
 */
export const fetchCurrentUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export default api;

