type LogoutHandler = () => Promise<void>;

let logoutHandler : LogoutHandler | null = null;

/**
 * Registers the logout handler function to be called when triggerLogout is invoked
 * @param {LogoutHandler} handler - The async logout function from AuthContext
 * @returns {void}
 */
export const registerLogoutHandler = (handler: LogoutHandler): void => {
  logoutHandler = handler;
};

/**
 * Redirects the user to the login page if not already there
 * @returns {void}
 */
const hardRedirectToLogin = () : void => {
  if (window.location.pathname !== '/') {
    window.location.replace('/');
  }
};

/**
 * Triggers the logout flow — calls the registered handler then redirects to login
 * @returns {void}
 */
export const triggerLogout = () : void => {
  if (logoutHandler) {
    try {
      logoutHandler();
    } catch {
      // logout failure is silent — redirect still happens
    }
  }

  hardRedirectToLogin();
};
