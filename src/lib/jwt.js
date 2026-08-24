// Minimal JWT payload decoding, no network call and no dependency.
//
// The backend issues devise-jwt tokens with a 1-day expiry (see
// config/initializers/devise.rb `jwt.expiration_time`). There is no
// `/auth/validate_token` endpoint to call — decoding `exp` locally is the
// only way to tell "still good" from "expired" without making a request.

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  // Strip an optional "Bearer " prefix — that's how it's stored in
  // localStorage (see constants.js / app/page.tsx).
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// True only for a well-formed, non-expired token. A token with no `exp`
// claim is treated as invalid rather than as "never expires".
export function isTokenValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now();
}
