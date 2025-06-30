/**
 * Password Strength Calculation Utility
 * 
 * This module provides functionality to calculate password strength
 * based on various criteria including length, character diversity, and entropy.
 */

export interface PasswordStrengthResult {
  score: number; // 0-100
  level: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  feedback: string[];
  estimatedCrackTime: string;
}

/**
 * Calculates the entropy of a password based on character set size and length
 */
function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password);
  return password.length * Math.log2(charsetSize);
}

/**
 * Determines the character set size based on password content
 */
function getCharsetSize(password: string): number {
  let size = 0;
  
  if (/[a-z]/.test(password)) size += 26; // lowercase
  if (/[A-Z]/.test(password)) size += 26; // uppercase
  if (/[0-9]/.test(password)) size += 10; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // special characters (approximate)
  
  return size;
}

/**
 * Estimates crack time based on entropy
 */
function estimateCrackTime(entropy: number): string {
  // Assuming 1 billion guesses per second (modern GPU)
  const guessesPerSecond = 1_000_000_000;
  const totalCombinations = Math.pow(2, entropy);
  const averageGuesses = totalCombinations / 2;
  const timeInSeconds = averageGuesses / guessesPerSecond;
  
  if (timeInSeconds < 60) {
    return 'Less than 1 minute';
  } else if (timeInSeconds < 3600) {
    return `${Math.round(timeInSeconds / 60)} minutes`;
  } else if (timeInSeconds < 86400) {
    return `${Math.round(timeInSeconds / 3600)} hours`;
  } else if (timeInSeconds < 31536000) {
    return `${Math.round(timeInSeconds / 86400)} days`;
  } else if (timeInSeconds < 31536000000) {
    return `${Math.round(timeInSeconds / 31536000)} years`;
  } else {
    return 'Centuries';
  }
}

/**
 * Checks for common password patterns that reduce strength
 */
function checkPatterns(password: string): string[] {
  const issues: string[] = [];
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Avoid repeated characters');
  }
  
  // Check for common sequences
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    issues.push('Avoid alphabetical sequences');
  }
  
  if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
    issues.push('Avoid numerical sequences');
  }
  
  // Check for keyboard patterns
  if (/(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i.test(password)) {
    issues.push('Avoid keyboard patterns');
  }
  
  return issues;
}

/**
 * Provides feedback for password improvement
 */
function generateFeedback(password: string, score: number): string[] {
  const feedback: string[] = [];
  
  if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special characters');
  }
  
  if (password.length < 12 && score < 80) {
    feedback.push('Consider using 12+ characters');
  }
  
  // Add pattern-specific feedback
  feedback.push(...checkPatterns(password));
  
  return feedback;
}

/**
 * Calculates comprehensive password strength
 * 
 * Scoring algorithm:
 * - Base score from entropy (0-70 points)
 * - Length bonus (0-15 points)
 * - Character diversity bonus (0-10 points)
 * - Pattern penalties (0-5 points deduction)
 * 
 * @param password - Password to analyze
 * @returns Detailed strength analysis
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      score: 0,
      level: 'Very Weak',
      feedback: ['Enter a password'],
      estimatedCrackTime: 'Instant'
    };
  }
  
  // Calculate entropy-based score (0-70 points)
  const entropy = calculateEntropy(password);
  let score = Math.min(70, entropy * 1.5);
  
  // Length bonus (0-15 points)
  if (password.length >= 8) score += 5;
  if (password.length >= 12) score += 5;
  if (password.length >= 16) score += 5;
  
  // Character type diversity bonus (0-10 points)
  let charTypes = 0;
  if (/[a-z]/.test(password)) charTypes++;
  if (/[A-Z]/.test(password)) charTypes++;
  if (/[0-9]/.test(password)) charTypes++;
  if (/[^a-zA-Z0-9]/.test(password)) charTypes++;
  
  score += charTypes * 2.5;
  
  // Pattern penalties
  const patterns = checkPatterns(password);
  score -= patterns.length * 5;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine strength level
  let level: PasswordStrengthResult['level'];
  if (score < 20) level = 'Very Weak';
  else if (score < 40) level = 'Weak';
  else if (score < 60) level = 'Fair';
  else if (score < 80) level = 'Good';
  else if (score < 95) level = 'Strong';
  else level = 'Very Strong';
  
  return {
    score: Math.round(score),
    level,
    feedback: generateFeedback(password, score),
    estimatedCrackTime: estimateCrackTime(entropy)
  };
}