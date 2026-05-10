import Cookies from 'js-cookie';

const TOKEN_KEY = 'neev_token';
const USER_KEY = 'neev_user';
const ROLE_KEY = 'neev_role';

export const setAuth = (token: string, user: any, role: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, role);
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || null;
};

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ROLE_KEY);
};

export const clearAuth = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
