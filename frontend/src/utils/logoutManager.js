let logoutHandler = null;

/**
 * Logout handler
 * @param {*} handler 
 */
export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const hardRedirectToLogin = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  if (window.location.pathname !== '/') {
    window.location.replace('/');
  }
};

/**
 * Trigger logout
 */
export const triggerLogout = () => {
  if (logoutHandler) {
    try {
      logoutHandler();
    } catch (error) {
      console.error('Logout handler failed, falling back to hard redirect.', error);
    }
  }

  hardRedirectToLogin();
};
