import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getPublicSurvey, submitResponse } from '../lib/api'
import type { Survey, SurveyQuestion } from '../lib/types'

export const Route = createFileRoute('/s/$surveyId')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  const { surveyId } = Route.useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true)
        const loadedSurvey = await getPublicSurvey(surveyId)
        setSurvey(loadedSurvey)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load survey.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [surveyId])

  function handleAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!survey) {
      return
    }

    const missingRequired = survey.questions.filter(
      (question) => question.required && !answers[question.id]?.trim(),
    )
    if (missingRequired.length > 0) {
      setError('Please complete all required questions before submitting.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await submitResponse(surveyId, { answers })
      setSubmitted(true)
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Could not submit response.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const heroStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${survey?.branding.primaryColor ?? '#0f172a'}, #1d4ed8)`,
    }),
    [survey],
  )

  if (loading) {
    return <main style={{ padding: '32px 20px' }}>Loading survey…</main>
  }

  if (error && !survey) {
    return (
      <main style={{ padding: '32px 20px' }}>
        <p style={{ color: '#b42318' }}>{error}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '28px 20px 56px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <section
          style={{
            ...heroStyle,
            color: 'white',
            borderRadius: 28,
            padding: 28,
            boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)',
          }}
        >
          {survey?.branding.logoUrl ? (
            <img
              src={survey.branding.logoUrl}
              alt="Survey logo"
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 18 }}
            />
          ) : null}
          <h1 style={{ marginBottom: 10 }}>{survey?.title}</h1>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{survey?.description}</p>
        </section>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            background: 'white',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
          }}
        >
          {submitted ? (
            <div style={{ padding: 18, background: '#ecfdf5', borderRadius: 20 }}>
              <h2 style={{ marginTop: 0 }}>Thanks for responding</h2>
              <p style={{ marginBottom: 0 }}>Your answers were saved anonymously.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 18 }}>
                {survey?.questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={answers[question.id] ?? ''}
                    onChange={handleAnswer}
                  />
                ))}
              </div>

              {error ? <p style={{ color: '#b42318', marginTop: 16 }}>{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: 24,
                  border: 0,
                  borderRadius: 999,
                  padding: '12px 18px',
                  background: survey?.branding.primaryColor ?? '#0f172a',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? 'Submitting…' : 'Submit response'}
              </button>
            </>
          )}
        </form>
      </div>
    </main>
  )
}

interface QuestionFieldProps {
  question: SurveyQuestion
  value: string
  onChange: (questionId: string, value: string) => void
}

function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  const label = (
    <>
      {question.prompt}
      {question.required ? <span style={{ color: '#b42318' }}> *</span> : null}
    </>
  )

  if (question.type === 'long_text') {
    return (
      <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
        {label}
        <textarea
          rows={5}
          value={value}
          onChange={(event) => onChange(question.id, event.target.value)}
          required={question.required}
          style={{
            borderRadius: 12,
            border: '1px solid #cbd5e1',
            padding: '12px 14px',
            fontSize: 16,
            resize: 'vertical',
          }}
        />
      </label>
    )
  }

  if (question.type === 'multiple_choice') {
    return (
      <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 14, margin: 0 }}>
        <legend style={{ fontWeight: 700 }}>{label}</legend>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {question.options.map((option) => (
            <label key={option.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => onChange(question.id, event.target.value)}
                required={question.required}
              />
              <span>{option.value}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (question.type === 'rating') {
    return (
      <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 14, margin: 0 }}>
        <legend style={{ fontWeight: 700 }}>{label}</legend>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {Array.from({ length: question.ratingScale }, (_, index) => index + 1).map((number) => (
            <label key={number} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="radio"
                name={question.id}
                value={number.toString()}
                checked={value === number.toString()}
                onChange={(event) => onChange(question.id, event.target.value)}
                required={question.required}
              />
              <span>{number}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(question.id, event.target.value)}
        required={question.required}
        style={{
          borderRadius: 12,
          border: '1px solid #cbd5e1',
          padding: '12px 14px',
          fontSize: 16,
        }}
      />
    </label>
  )
}
