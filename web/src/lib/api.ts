import {
  getCachedResponses,
  getCachedSurvey,
  getCachedSurveys,
  getSession,
  saveCachedResponse,
  saveCachedSurvey,
  saveCachedSurveys,
} from './storage'
import type {
  AuthResponse,
  CreateSurveyPayload,
  PublicSurveyResponsePayload,
  Survey,
  SurveyResponse,
} from './types'

export class ApiError extends Error {
  status: number
  payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function request<T>(path: string, init: RequestInit = {}, withAuth = true) {
  const session = getSession()
  const headers = new Headers(init.headers)

  if (withAuth && session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  if (init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
  })

  const text = await response.text()
  let payload: unknown = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error: string }).error)
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export function login(email: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function getSurveys() {
  try {
    const surveys = await request<Survey[]>('/surveys')
    saveCachedSurveys(surveys)
    return surveys
  } catch (error) {
    const cached = getCachedSurveys()
    if (cached.length > 0) {
      return cached
    }
    throw error
  }
}

export async function getSurvey(id: string) {
  try {
    const survey = await request<Survey>(`/surveys/${id}`)
    saveCachedSurvey(survey)
    return survey
  } catch (error) {
    const cached = getCachedSurvey(id)
    if (cached) {
      return cached
    }
    throw error
  }
}

export async function createSurvey(payload: CreateSurveyPayload) {
  const survey = await request<Survey>('/surveys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  saveCachedSurvey(survey)
  return survey
}

export async function updateSurvey(id: string, payload: CreateSurveyPayload) {
  const survey = await request<Survey>(`/surveys/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  saveCachedSurvey(survey)
  return survey
}

export async function getResponses(id: string) {
  try {
    const responses = await request<SurveyResponse[]>(`/surveys/${id}/responses`)
    return responses
  } catch (error) {
    const cached = getCachedResponses(id)
    if (cached.length > 0) {
      return cached
    }
    throw error
  }
}

export async function getPublicSurvey(id: string) {
  try {
    const survey = await request<Survey>(`/public/surveys/${id}`, {}, false)
    saveCachedSurvey(survey)
    return survey
  } catch (error) {
    const cached = getCachedSurvey(id)
    if (cached) {
      return cached
    }
    throw error
  }
}

export async function submitResponse(id: string, payload: PublicSurveyResponsePayload) {
  const response = await request<SurveyResponse>(
    `/public/surveys/${id}/responses`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false,
  )

  saveCachedResponse(response)
  return response
}
