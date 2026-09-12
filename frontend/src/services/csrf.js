const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let cachedCsrfToken = null;

const readCsrfTokenFromCookie = () => {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith('XSRF-TOKEN=')) {
      return trimmedCookie.substring('XSRF-TOKEN='.length);
    }
  }

  return null;
};

/**
 * Return the CSRF token required for mutating API requests.
 * Reads the cookie first, then requests /health when cross-domain cookies
 * are not visible to JavaScript.
 */
export const getCsrfToken = async () => {
  cachedCsrfToken = readCsrfTokenFromCookie() || cachedCsrfToken;

  if (!cachedCsrfToken) {
    try {
      const healthResponse = await fetch(`${API_URL}/health`, {
        credentials: 'include',
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        cachedCsrfToken = healthData.csrfToken || null;
      }
    } catch (error) {
      console.warn('Failed to pre-fetch CSRF token', error);
    }
  }

  return cachedCsrfToken;
};

export const isMutatingMethod = (method = 'GET') =>
  !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
