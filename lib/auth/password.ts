/**
 * Password Utilities
 * 
 * Secure password hashing and verification using bcryptjs.
 */

import bcrypt from 'bcryptjs'

// ================================
// Configuration
// ================================

/**
 * Number of salt rounds for bcrypt.
 * Higher = more secure but slower.
 * 12 is a good balance for most applications.
 */
const SALT_ROUNDS = 12

// ================================
// Password Functions
// ================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ================================
// Password Validation
// ================================

interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password harus minimal 8 karakter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung minimal satu huruf besar')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung minimal satu huruf kecil')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung minimal satu angka')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generate a random password
 * @param length - Password length (default: 16)
 * @returns Random password
 */
export function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const all = uppercase + lowercase + numbers + special

  let password = ''
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}
