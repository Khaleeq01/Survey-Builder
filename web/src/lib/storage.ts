import type { Survey, SurveyResponse } from './types'

export type Session = {
  token: string
  email: string
}

const SESSION_KEY = 'docodego-survey-session'
const SURVEY_CACHE_KEY = 'docodego-survey-cache'
const RESPONSE_CACHE_KEY = 'docodego-response-cache'

export function getSession(): Session | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.token || !parsed?.email) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export function getCachedSurvey(id: string): Survey | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SURVEY_CACHE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Survey>
    return parsed[id] ?? null
  } catch {
    return null
  }
}

export function getCachedSurveys(): Survey[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(SURVEY_CACHE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Survey>
    return Object.values(parsed)
  } catch {
    return []
  }
}

export function saveCachedSurvey(survey: Survey) {
  if (typeof window === 'undefined') {
    return
  }

  const raw = window.localStorage.getItem(SURVEY_CACHE_KEY)
  const surveys = raw ? (JSON.parse(raw) as Record<string, Survey>) : {}
  surveys[survey.id] = survey
  window.localStorage.setItem(SURVEY_CACHE_KEY, JSON.stringify(surveys))
}

export function saveCachedSurveys(surveys: Survey[]) {
  if (typeof window === 'undefined') {
    return
  }

  const cache = surveys.reduce<Record<string, Survey>>((accumulator, survey) => {
    accumulator[survey.id] = survey
    return accumulator
  }, {})

  window.localStorage.setItem(SURVEY_CACHE_KEY, JSON.stringify(cache))
}

export function getCachedResponses(surveyId: string): SurveyResponse[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(RESPONSE_CACHE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, SurveyResponse[]>
    return parsed[surveyId] ?? []
  } catch {
    return []
  }
}

export function saveCachedResponse(response: SurveyResponse) {
  if (typeof window === 'undefined') {
    return
  }

  const raw = window.localStorage.getItem(RESPONSE_CACHE_KEY)
  const responses = raw ? (JSON.parse(raw) as Record<string, SurveyResponse[]>) : {}
  responses[response.surveyId] = [...(responses[response.surveyId] ?? []), response]
  window.localStorage.setItem(RESPONSE_CACHE_KEY, JSON.stringify(responses))
}
