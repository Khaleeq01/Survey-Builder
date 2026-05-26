export type QuestionType = 'text' | 'long_text' | 'multiple_choice' | 'rating'

export interface SurveyOption {
  id: string
  value: string
}

export interface SurveyQuestion {
  id: string
  type: QuestionType
  prompt: string
  required: boolean
  options: SurveyOption[]
  ratingScale: number
}

export interface SurveyBranding {
  primaryColor: string
  logoUrl: string
}

export interface Survey {
  id: string
  ownerId: string
  title: string
  description: string
  branding: SurveyBranding
  questions: SurveyQuestion[]
  createdAt: string
  updatedAt: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: Record<string, string>
  submittedAt: string
}

export interface Owner {
  id: string
  email: string
}

export interface AuthResponse {
  owner: Owner
  session: {
    token: string
    email: string
  }
}

export interface CreateSurveyPayload {
  title: string
  description: string
  branding: SurveyBranding
  questions: SurveyQuestion[]
}

export interface PublicSurveyResponsePayload {
  answers: Record<string, string>
}
