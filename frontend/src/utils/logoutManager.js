let logoutHandler = null;

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;
};

export const triggerLogout = () => {
  if (logoutHandler) {
    logoutHandler();
    return;
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.replace('/');
};
