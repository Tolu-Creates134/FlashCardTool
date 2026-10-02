import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { triggerLogout } from '../utils/logoutManager';
import { isInfrastructureError } from '../utils/infraErrorHandler';
import { emitApiError } from './errorEmitter';
import { EmitApiErrorInput } from './errorEmitter';
import { 
CreateCategoryCommand, 
CreateCategoryResponse, 
CreateDeckCommand, 
CreateDeckResponse, 
CreatePractiseSessionRequest, 
CreatePractiseSessionResponse, 
DeckDto, 
GenerateFlashcardsResponse, 
GetCurrentUserQueryResponse, 
GetDeckByIdResponse, 
GoogleLoginResponse, 
ListAllCategoriesResponse, 
ListAllDecksResponse, 
ListFlashCardsByDeckIdResponse, 
ListPractiseSessionsByDeckIdQueryResponse 
} from '../types';


interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _skipErrorToast?: boolean;
  _retry?: boolean;
}

/**
 * Create axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
  withCredentials: true, // Includes cookies in each server request
});

let refreshRequest: Promise<void> | null = null;

/**
 * Refreshes the access token using the refresh token cookie
 * @returns {Promise<void>}
 */
const refreshAccessToken = async (): Promise<void> => {
  await api.post('/auth/refresh');
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as CustomAxiosRequestConfig
    const status = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');
    const skipErrorToast = originalRequest._skipErrorToast;

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = refreshAccessToken().finally(() => {
            refreshRequest = null;
          });
        }

        await refreshRequest;
        return api(originalRequest);
      } catch (refreshError: unknown) {
        refreshRequest = null;

        const axiosError = refreshError as AxiosError
        const refreshStatus = axiosError.response?.status;
        const missingRefreshToken = (refreshError as Error).message === 'Missing refresh token';

        if (
          refreshStatus === 401 ||
          refreshStatus === 403 ||
          missingRefreshToken
        ) {
          emitApiError({
            response: {
              data: {
                message: 'Your session has expired. Please sign in again.',
              },
            },
          });
          triggerLogout();
        }else {
          emitApiError(axiosError as unknown as EmitApiErrorInput)
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Only emit error if not flagged to skip
    if (!skipErrorToast) {
      emitApiError(error as unknown as EmitApiErrorInput);
    } else {
    }

    return Promise.reject(error);
  }
);

/**
 * Login with Google
 * @param {string} idToken
 * @returns {Promise<GoogleLoginResponse>}
 */
export const loginWithGoogle = async (idToken: string): Promise<GoogleLoginResponse> => {
  const res = await api.post<GoogleLoginResponse>('/auth/google-login', { idToken: idToken });
  return res.data;
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

/**
 * Fetches all categories
 * @returns {Promise<ListAllCategoriesResponse>}
 */
export const fetchCategories = async (): Promise<ListAllCategoriesResponse>  => {
  const res = await api.get<ListAllCategoriesResponse>('/categories');
  return res.data;
};

/**
 * Creates a category
 * @param {CreateCategoryCommand} categoryData
 * @returns {Promise<CreateCategoryResponse>}
 */
export const createCategory = async (categoryData: CreateCategoryCommand): Promise<CreateCategoryResponse> => {
  const res = await api.post<CreateCategoryResponse>('/categories', categoryData);
  return res.data;
};

/**
 * Fetches all decks.
 * @returns
 */
export const fetchDecks = async (): Promise<ListAllDecksResponse> => {
  const res = await api.get<ListAllDecksResponse>('/decks');
  return res.data;
};

/**
 * Creates deck and stores in database
 * @param {CreateDeckCommand} deckData
 * @returns {Promise<CreateDeckResponse>}
 */
export const createDeck = async (deckData: CreateDeckCommand): Promise<CreateDeckResponse> => {
  const res = await api.post<CreateDeckResponse>('/decks', deckData);
  return res.data;
};

/**
 * Deletes a deck and its flashcards
 * @param {string} deckId
 * @returns {Promise<void>}
 */
export const deleteDeck = async (deckId: string): Promise<void> => {
  try {
    await api.delete(
      `decks/${deckId}`, 
      { _skipErrorToast: true } as CustomAxiosRequestConfig
    );
  } catch (error: unknown) {
    if (isInfrastructureError(error as AxiosError)) {
      return;
    }
    throw error;
  }
};

/**
 * Deletes a category and all associated decks and flashcards 
 * @param {*} categoryId
 * @returns
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await api.delete(`/categories/${categoryId}`);
  } catch (error) {
    if (isInfrastructureError(error as AxiosError)) {
      return;
    }
    throw error;
  }
}

/**
 * Fetch individual deck by id
 * @param {string} deckId
 * @returns
 */
export const fetchDeckById = async (deckId: string): Promise<GetDeckByIdResponse> => {
  const res = await api.get<GetDeckByIdResponse>(`/decks/${deckId}`);
  return res.data;
};

/**
 * Update deck by id
 * @param {string} deckId
 * @param {DeckDto} deckData
 * @returns {Promise<void>}
 */
export const updateDeck = async (deckId: string, deckData: DeckDto): Promise<void> => {
  try {
    await api.put(
      `/decks/${deckId}`, deckData, 
      { _skipErrorToast: true } as CustomAxiosRequestConfig
    );
  } catch (error) {
    if (isInfrastructureError(error as AxiosError)) {
      return;
    }
    throw error;
  }
};

/**
 * Generates AI flashcard preview drafts
 * @param {FormData} formData
 * @returns {Promise<GenerateFlashcardsResponse>}
 */
export const generateFlashcardsPreview = async (formData: FormData): Promise<GenerateFlashcardsResponse> => {
  const res = await api.post('/decks/ai/generate-preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

/**
 * Persists practise sessions scores
 * @param {string} deckId
 * @param {CreatePractiseSessionRequest} sessionsData
 * @returns {Promise<CreatePractiseSessionResponse>}
 */
export const createPractiseSession = async (deckId: string, sessionsData: CreatePractiseSessionRequest): Promise<CreatePractiseSessionResponse> => {
  const res = await api.post(
    `/decks/${deckId}/practise-sessions`,
    sessionsData
  );

  return res.data;
};

/**
 * Fetches practises session scores
 * @param {string} deckId
 * @returns {Promise<ListPractiseSessionsByDeckIdQueryResponse>}
 */
export const fetchPractiseSessions = async (deckId: string): Promise<ListPractiseSessionsByDeckIdQueryResponse> => {
  const res = await api.get(`/decks/${deckId}/practise-sessions`);
  return res.data;
};

/**
 * Fetch flashcards for a specific deck
 * @param {string} deckId
 * @returns {Promise<ListFlashCardsByDeckIdResponse>} 
 */
export const fetchFlashcardsByDeckId = async (deckId: string): Promise<ListFlashCardsByDeckIdResponse> => {
  const res = await api.get(`/flashcards/${deckId}`);
  return res.data;
};

/**
 * Fetches logged in user details
 * @returns {Promise<GetCurrentUserQueryResponse>}
 */
export const fetchCurrentUser = async ():Promise<GetCurrentUserQueryResponse> => {
  const res = await api.get('/users/me');
  return res.data;
};

export default api;
