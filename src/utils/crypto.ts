import { createHash, randomBytes } from "crypto";

/**
 * Generate a cryptographically secure random secret
 * @returns 32-byte secret as hex string (with 0x prefix)
 */
export function generateSecret(): string {
  const secret = randomBytes(32);
  return "0x" + secret.toString("hex");
}

/**
 * Create SHA-256 hash of a secret (hashlock)
 * @param secret - Secret value (hex string with or without 0x prefix)
 * @returns SHA-256 hash as hex string (with 0x prefix)
 */
export function createHashlock(secret: string): string {
  // Remove 0x prefix if present
  const cleanSecret = secret.startsWith("0x") ? secret.slice(2) : secret;

  // Validate secret is proper hex and 32 bytes (64 hex characters)
  if (!/^[0-9a-fA-F]{64}$/.test(cleanSecret)) {
    throw new Error("Secret must be exactly 32 bytes (64 hex characters)");
  }

  const secretBuffer = Buffer.from(cleanSecret, "hex");
  const hash = createHash("sha256").update(secretBuffer).digest();
  return "0x" + hash.toString("hex");
}

/**
 * Verify that a secret matches a given hashlock
 * @param secret - Secret value (hex string)
 * @param hashlock - Expected hash (hex string)
 * @returns true if secret matches hashlock
 */
export function verifySecret(secret: string, hashlock: string): boolean {
  try {
    const computedHash = createHashlock(secret);
    const cleanHashlock = hashlock.startsWith("0x")
      ? hashlock
      : "0x" + hashlock;
    return computedHash.toLowerCase() === cleanHashlock.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * Generate a secret and its corresponding hashlock
 * @returns Object with secret and hashlock
 */
export function generateSecretPair(): { secret: string; hashlock: string } {
  const secret = generateSecret();
  const hashlock = createHashlock(secret);
  return { secret, hashlock };
}

/**
 * Validate hex string format
 * @param value - Hex string to validate
 * @param expectedLength - Expected length in bytes (optional)
 * @returns true if valid hex string
 */
export function isValidHex(value: string, expectedLength?: number): boolean {
  const cleanValue = value.startsWith("0x") ? value.slice(2) : value;

  // Check if it's valid hex
  if (!/^[0-9a-fA-F]*$/.test(cleanValue)) {
    return false;
  }

  // Check length if specified (length in bytes, so hex length should be 2x)
  if (expectedLength !== undefined) {
    return cleanValue.length === expectedLength * 2;
  }

  return true;
}

/**
 * Normalize hex string (ensure 0x prefix)
 * @param value - Hex string
 * @returns Hex string with 0x prefix
 */
export function normalizeHex(value: string): string {
  if (value.startsWith("0x")) {
    return value;
  }
  return "0x" + value;
}

/**
 * Remove 0x prefix from hex string
 * @param value - Hex string
 * @returns Hex string without prefix
 */
export function stripHexPrefix(value: string): string {
  return value.startsWith("0x") ? value.slice(2) : value;
}

/**
 * Generate unique order ID
 * @returns Unique order ID string
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const randomPart = randomBytes(4).toString("hex");
  return `order_${timestamp}_${randomPart}`;
}

/**
 * Generate unique HTLC ID
 * @param type - Type of HTLC (ethereum or stellar)
 * @returns Unique HTLC ID string
 */
export function generateHTLCId(type: "ethereum" | "stellar"): string {
  const timestamp = Date.now();
  const randomPart = randomBytes(4).toString("hex");
  return `${type}_htlc_${timestamp}_${randomPart}`;
}

/**
 * Calculate timelock deadlines
 * @param duration - Total duration in seconds
 * @param makerTimeout - Maker's exclusive period in seconds
 * @param takerTimeout - Taker's exclusive period in seconds
 * @returns Object with calculated deadlines
 */
export function calculateTimelocks(
  duration: number = 3600, // 1 hour default
  makerTimeout: number = 1800, // 30 minutes default
  takerTimeout: number = 1800 // 30 minutes default
) {
  const now = Math.floor(Date.now() / 1000); // Unix timestamp

  return {
    createdAt: now,
    duration,
    claimDeadline: now + duration - takerTimeout,
    refundDeadline: now + duration,
    makerExclusiveUntil: now + makerTimeout,
    takerExclusiveUntil: now + duration - takerTimeout,
  };
}
