/**
 * Validation utilities for input sanitization and type checking
 */

/**
 * Validates email format using a robust regex pattern
 * Rejects edge cases like "@" alone or missing domain
 */
export function validateEmail(email: string): boolean {
  // RFC 5322 simplified pattern - covers most real-world cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Safely parses JSON strings with error handling
 * Returns null if parsing fails, allowing callers to decide on fallback behavior
 */
export function safeJsonParse<T>(jsonString: string, fallback: T | null = null): T | null {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    console.error('JSON parse error:', jsonString)
    return fallback
  }
}

/**
 * Validates that input object has expected shape
 * Helps prevent malformed data from being stored
 */
export function validateObject(obj: unknown, requiredKeys: string[]): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const objKeys = Object.keys(obj as Record<string, unknown>)
  return requiredKeys.every((key) => objKeys.includes(key))
}
