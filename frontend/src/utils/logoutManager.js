let logoutHandler = null;

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
