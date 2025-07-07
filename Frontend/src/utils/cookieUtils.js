// Cookie utility functions for iOS compatibility

/**
 * Set a cookie with specified name, value, and options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {boolean} session - If true, creates session cookie (default: true)
 * @param {string} path - Cookie path (default: '/')
 */
export const setCookie = (name, value, session = true, path = '/') => {
  if (session) {
    // Session cookie - expires when browser/app is closed
    document.cookie = `${name}=${value};path=${path};SameSite=Lax`;
  } else {
    // Persistent cookie with 30-day expiration
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${path};SameSite=Lax`;
  }
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = name => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export const deleteCookie = (name, path = '/') => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;
};
