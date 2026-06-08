/**
 * Frontend constants for survey builder and UI
 */

export const QUESTION_TYPES = {
  TEXT: 'text',
  LONG_TEXT: 'long_text',
  MULTIPLE_CHOICE: 'multiple_choice',
  RATING: 'rating',
} as const

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.TEXT]: 'Short text',
  [QUESTION_TYPES.LONG_TEXT]: 'Long text',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple choice',
  [QUESTION_TYPES.RATING]: '1–5 rating',
} as const

export const DEFAULT_BRANDING = {
  PRIMARY_COLOR: '#0f172a',
  LOGO_URL: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=120&q=80',
} as const

export const DEFAULT_SURVEY_TITLE = 'New branded survey'
export const DEFAULT_SURVEY_DESCRIPTION = 'Collect feedback in a polished, shareable format.'

export const DEFAULT_QUESTION_PROMPTS = {
  [QUESTION_TYPES.TEXT]: 'Question prompt',
  [QUESTION_TYPES.LONG_TEXT]: 'Question prompt',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Question prompt',
  [QUESTION_TYPES.RATING]: 'How would you rate this?',
} as const

export const DEFAULT_MULTIPLE_CHOICE_OPTIONS = ['Option 1', 'Option 2']

export const RATING_SCALE_DEFAULT = 5
