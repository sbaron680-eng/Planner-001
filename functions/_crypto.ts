/**
 * _crypto.ts — Cloudflare Workers Web Crypto utilities
 *
 * 비밀번호 해싱: PBKDF2 (SHA-256, 100 000 iterations, 16-byte random salt)
 * 필드 암호화:  AES-GCM 256-bit (12-byte random IV, prepended to ciphertext)
 *
 * 저장 형식
 *   password_hash: "pbkdf2$<saltHex>$<hashHex>"
 *   encrypted field: base64url("<12-byte-IV><ciphertext>")
 */

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH      = 'SHA-256';
const KEY_BYTES        = 32;   // AES-256
const IV_BYTES         = 12;   // GCM standard
const ENC              = new TextEncoder();
const DEC              = new TextDecoder();

// ── 内部ヘルパー ────────────────────────────────────────────
function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexDecode(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr;
}

function b64urlEncode(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded + '=='.slice((padded.length + 4) & 3));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// ── 비밀번호 해싱 (PBKDF2) ───────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey(
    'raw', ENC.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: PBKDF2_HASH },
    baseKey, KEY_BYTES * 8,
  );
  return `pbkdf2$${hexEncode(salt.buffer)}$${hexEncode(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // 구 형식 호환 (SHA-256 단순 해시): pbkdf2 접두어 없이 64자 hex
  if (!stored.startsWith('pbkdf2$')) {
    // legacy: plain SHA-256 without salt
    const hash = await crypto.subtle.digest('SHA-256', ENC.encode(password));
    return hexEncode(hash) === stored;
  }
  const [, saltHex, hashHex] = stored.split('$');
  const salt = hexDecode(saltHex);
  const baseKey = await crypto.subtle.importKey(
    'raw', ENC.encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: PBKDF2_HASH },
    baseKey, KEY_BYTES * 8,
  );
  // Constant-time compare
  const newHex = hexEncode(bits);
  if (newHex.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < newHex.length; i++) diff |= newHex.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

// ── AES-GCM 필드 암호화 ──────────────────────────────────────

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  // secret 문자열 → AES-GCM 256-bit key (PBKDF2 with fixed app salt)
  const appSalt = ENC.encode('planner001-field-enc-v1');
  const baseKey = await crypto.subtle.importKey(
    'raw', ENC.encode(secret), 'PBKDF2', false, ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: appSalt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt', 'decrypt'],
  );
}

export async function encryptField(plaintext: string, secret: string): Promise<string> {
  const key = await deriveAesKey(secret);
  const iv  = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    ENC.encode(plaintext),
  );
  const combined = new Uint8Array(IV_BYTES + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), IV_BYTES);
  return b64urlEncode(combined);
}

export async function decryptField(encoded: string, secret: string): Promise<string> {
  const key  = await deriveAesKey(secret);
  const data = b64urlDecode(encoded);
  const iv   = data.slice(0, IV_BYTES);
  const cipher = data.slice(IV_BYTES);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return DEC.decode(plain);
}

// ── JWT 서명 검증 (HMAC-SHA256) ─────────────────────────────

export async function signJwt(payload: object, secret: string): Promise<string> {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body    = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const sigData = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw', ENC.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, ENC.encode(sigData));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${sigData}.${sigB64}`;
}

export async function verifyJwt(
  token: string, secret: string,
): Promise<{ sub?: string; role?: string; exp?: number } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, sigB64] = parts;
    const sigData = `${header}.${payload}`;

    const key = await crypto.subtle.importKey(
      'raw', ENC.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    );
    const sigBytes = b64urlDecode(sigB64.replace(/-/g, '+').replace(/_/g, '/'));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, ENC.encode(sigData));
    if (!valid) return null;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decoded.exp || decoded.exp < Date.now() / 1000) return null;
    return decoded as { sub: string; role: string; exp: number };
  } catch {
    return null;
  }
}

// ── 입력 데이터 HMAC 캐시 키 (SHA-256) ─────────────────────

export async function hashCacheKey(input: object): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', ENC.encode(JSON.stringify(input)));
  return hexEncode(hash).slice(0, 32);
}
