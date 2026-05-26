import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getResponses, getSurveys } from '../lib/api'
import type { Survey, SurveyResponse } from '../lib/types'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [responseMap, setResponseMap] = useState<Record<string, SurveyResponse[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const loadedSurveys = await getSurveys()
        setSurveys(loadedSurveys)

        const nextResponses: Record<string, SurveyResponse[]> = {}
        for (const survey of loadedSurveys) {
          nextResponses[survey.id] = await getResponses(survey.id)
        }
        setResponseMap(nextResponses)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load dashboard.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  async function handleCopy(survey: Survey) {
    const url = `${window.location.origin}/s/${survey.id}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <main style={{ padding: '32px 20px 60px' }}>
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          display: 'grid',
          gap: 24,
        }}
      >
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
            color: 'white',
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Owner dashboard
          </p>
          <h1 style={{ margin: '12px 0 10px' }}>Track your surveys and responses</h1>
          <p style={{ margin: 0, maxWidth: 700, lineHeight: 1.6 }}>
            Every survey you save is available as a shareable public page, and every response is
            captured on the server for your later review.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate({ to: '/builder', search: { surveyId: undefined } })}
              style={{
                border: 0,
                borderRadius: 999,
                padding: '12px 18px',
                fontWeight: 800,
                background: 'white',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              + Create survey
            </button>
          </div>
        </section>

        {loading ? <p>Loading surveys…</p> : null}

        {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}

        <section style={{ display: 'grid', gap: 16 }}>
          {surveys.length === 0 && !loading ? (
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 28,
                boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <h2 style={{ marginTop: 0 }}>No surveys yet</h2>
              <p style={{ color: '#475569', marginBottom: 0 }}>
                Build your first survey to start collecting branded responses.
              </p>
            </div>
          ) : null}

          {surveys.map((survey) => {
            const responses = responseMap[survey.id] ?? []
            const shareUrl = `${window.location.origin}/s/${survey.id}`

            return (
              <article
                key={survey.id}
                style={{
                  background: 'white',
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <p style={{ color: survey.branding.primaryColor, margin: 0, fontWeight: 800 }}>
                      {responses.length} response{responses.length === 1 ? '' : 's'}
                    </p>
                    <h2 style={{ margin: '8px 0' }}>{survey.title}</h2>
                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                      {survey.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => navigate({ to: '/builder', search: { surveyId: survey.id } })}
                      style={{
                        borderRadius: 999,
                        padding: '10px 14px',
                        border: `1px solid ${survey.branding.primaryColor}`,
                        background: 'white',
                        color: survey.branding.primaryColor,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(survey)}
                      style={{
                        borderRadius: 999,
                        padding: '10px 14px',
                        border: 0,
                        background: '#0f172a',
                        color: 'white',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                <p style={{ marginTop: 18, marginBottom: 4, fontWeight: 700 }}>Share URL</p>
                <code
                  style={{
                    display: 'block',
                    wordBreak: 'break-all',
                    background: '#f8fafc',
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  {shareUrl}
                </code>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Responses</h3>
                  {responses.length === 0 ? (
                    <p style={{ color: '#475569', margin: 0 }}>No responses yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {responses.map((response) => (
                        <div
                          key={response.id}
                          style={{
                            background: '#f8fafc',
                            borderRadius: 16,
                            padding: 14,
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: 700 }}>
                            {new Date(response.submittedAt).toLocaleString()}
                          </p>
                          <ul style={{ margin: '10px 0 0 16px', padding: 0 }}>
                            {Object.entries(response.answers).map(([key, value]) => {
                              const question = survey.questions.find((q) => q.id === key)
                              const label = question ? question.prompt : key
                              
                              return (
                                <li key={key} style={{ marginBottom: 6 }}>
                                  <strong>{label}:</strong> {value}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
