/**
 * Password Generation Utility
 * 
 * This module provides secure password generation functionality with customizable options.
 * It uses cryptographically secure random number generation when available.
 */

export interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
  includeLowercase?: boolean; // Always true by default
}

/**
 * Character sets used for password generation
 */
const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

/**
 * Generates a cryptographically secure random integer between 0 and max-1
 * Falls back to Math.random() if crypto API is not available
 */
function getSecureRandomInt(max: number): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  // Fallback for environments without crypto API
  return Math.floor(Math.random() * max);
}

/**
 * Builds the character pool based on selected options
 */
function buildCharacterPool(options: PasswordOptions): string {
  let pool = CHARACTER_SETS.lowercase; // Always include lowercase
  
  if (options.includeUppercase) {
    pool += CHARACTER_SETS.uppercase;
  }
  
  if (options.includeNumbers) {
    pool += CHARACTER_SETS.numbers;
  }
  
  if (options.includeSpecialChars) {
    pool += CHARACTER_SETS.specialChars;
  }
  
  return pool;
}

/**
 * Ensures the generated password meets all selected criteria
 * by guaranteeing at least one character from each selected set
 */
function ensurePasswordCriteria(password: string[], options: PasswordOptions, characterPool: string): string[] {
  const requiredChars: string[] = [];
  
  // Always include at least one lowercase letter
  requiredChars.push(CHARACTER_SETS.lowercase[getSecureRandomInt(CHARACTER_SETS.lowercase.length)]);
  
  if (options.includeUppercase) {
    requiredChars.push(CHARACTER_SETS.uppercase[getSecureRandomInt(CHARACTER_SETS.uppercase.length)]);
  }
  
  if (options.includeNumbers) {
    requiredChars.push(CHARACTER_SETS.numbers[getSecureRandomInt(CHARACTER_SETS.numbers.length)]);
  }
  
  if (options.includeSpecialChars) {
    requiredChars.push(CHARACTER_SETS.specialChars[getSecureRandomInt(CHARACTER_SETS.specialChars.length)]);
  }
  
  // Replace random positions with required characters
  for (let i = 0; i < requiredChars.length; i++) {
    const randomIndex = getSecureRandomInt(password.length);
    password[randomIndex] = requiredChars[i];
  }
  
  return password;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm with secure random numbers
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a secure password based on the provided options
 * 
 * Algorithm:
 * 1. Build character pool from selected options
 * 2. Generate random password of specified length
 * 3. Ensure password meets all criteria by replacing random positions
 * 4. Shuffle the final password for additional security
 * 
 * @param options - Password generation options
 * @returns Generated password string
 */
export function generatePassword(options: PasswordOptions): string {
  // Validate input
  if (options.length < 1) {
    throw new Error('Password length must be at least 1');
  }
  
  if (options.length > 128) {
    throw new Error('Password length cannot exceed 128 characters');
  }
  
  // Build character pool based on options
  const characterPool = buildCharacterPool(options);
  
  // Generate initial password
  const password: string[] = [];
  for (let i = 0; i < options.length; i++) {
    password.push(characterPool[getSecureRandomInt(characterPool.length)]);
  }
  
  // Ensure password meets all criteria
  const validatedPassword = ensurePasswordCriteria(password, options, characterPool);
  
  // Shuffle for additional security
  const shuffledPassword = shuffleArray(validatedPassword);
  
  return shuffledPassword.join('');
}

/**
 * Validates password generation options
 */
export function validatePasswordOptions(options: PasswordOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (options.length < 4) {
    errors.push('Password length should be at least 4 characters for security');
  }
  
  if (options.length > 128) {
    errors.push('Password length cannot exceed 128 characters');
  }
  
  if (!options.includeNumbers && !options.includeSpecialChars && !options.includeUppercase) {
    errors.push('At least one additional character type should be selected for stronger security');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}