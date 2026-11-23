import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_MASTER_KEY || process.env.AUTH_SECRET || 'avenix_secure_master_encryption_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive credentials (like Discord bot tokens) using AES-256-GCM.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an authenticated AES-256-GCM secret.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato de cifrado inválido');
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Componentes de descifrado incompletos');
  }

  const key = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks a sensitive token for UI presentation (e.g. "MTI3...••••••••...9xKz")
 */
export function maskToken(token: string): string {
  if (!token) return '••••••••';
  if (token.length <= 10) return '••••••••';
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}...••••••••...${suffix}`;
}
