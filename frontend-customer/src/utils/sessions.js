export function getStoredToken() {
  return localStorage.getItem('tableSessionToken');
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('tableSessionToken', token);
}

export function clearStoredToken() {
  localStorage.removeItem('tableSessionToken');
}

export function markSessionExpired() {
  localStorage.setItem('session_expired', 'true');
  clearStoredToken();
}

export function isSessionExpired() {
  return localStorage.getItem('session_expired') === 'true';
}

export function clearSessionExpiredFlag() {
  localStorage.removeItem('session_expired');
}

