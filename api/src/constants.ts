/**
 * Shared constants and configuration values for the survey API
 */

export const QUESTION_TYPES = {
  TEXT: 'text',
  LONG_TEXT: 'long_text',
  MULTIPLE_CHOICE: 'multiple_choice',
  RATING: 'rating',
} as const

export const ID_PREFIXES = {
  OWNER: 'owner',
  SESSION: 'session',
  SURVEY: 'survey',
  RESPONSE: 'resp',
  OPTION: 'opt',
} as const

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  MALFORMED_JSON: 'Failed to parse stored data',
  MISSING_SURVEY: 'Survey not found',
  INVALID_REQUEST_BODY: 'Invalid request body',
} as const

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const
