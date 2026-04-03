import crypto from 'crypto';
import { env } from '../config/env.js';

function base64urlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

/**
 * Mock signed token: payload is JSON { sub, role } — NOT for production.
 */
export function signMockToken(payload) {
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', env.mockJwtSecret)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyMockToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expected = crypto
    .createHmac('sha256', env.mockJwtSecret)
    .update(payloadB64)
    .digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    return JSON.parse(base64urlDecode(payloadB64));
  } catch {
    return null;
  }
}
