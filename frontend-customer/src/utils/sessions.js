export function getStoredToken() {
  return localStorage.getItem('tableSessionToken');
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('tableSessionToken', token);
}

export function clearStoredToken() {
  localStorage.removeItem('tableSessionToken');
}

