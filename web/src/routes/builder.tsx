import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { createSurvey, getSurvey, updateSurvey } from '../lib/api'
import type { CreateSurveyPayload, QuestionType, SurveyQuestion } from '../lib/types'

const questionTypeOptions: Array<{ value: QuestionType; label: string }> = [
  { value: 'text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'rating', label: '1–5 rating' },
]

const createOption = (value: string) => ({
  id: `${Math.random().toString(36).slice(2, 10)}`,
  value,
})

const buildQuestion = (type: QuestionType): SurveyQuestion => ({
  id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  prompt: type === 'rating' ? 'How would you rate this?' : 'Question prompt',
  required: true,
  options: type === 'multiple_choice' ? [createOption('Option 1'), createOption('Option 2')] : [],
  ratingScale: 5,
})

const defaultSurvey = (): CreateSurveyPayload => ({
  title: 'New branded survey',
  description: 'Collect feedback in a polished, shareable format.',
  branding: {
    primaryColor: '#0f172a',
    logoUrl:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=120&q=80',
  },
  questions: [buildQuestion('text'), buildQuestion('multiple_choice'), buildQuestion('rating')],
})

export const Route = createFileRoute('/builder')({
  component: BuilderPage,
  validateSearch: (search) => ({
    surveyId: typeof search.surveyId === 'string' ? search.surveyId : undefined,
  }),
})

function BuilderPage() {
  const navigate = useNavigate()
  const { surveyId } = Route.useSearch()
  const [survey, setSurvey] = useState<CreateSurveyPayload>(defaultSurvey())
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof surveyId !== 'string') {
      return
    }

    const currentSurveyId = surveyId as string

    async function loadExistingSurvey() {
      try {
        const existing = await getSurvey(currentSurveyId)
        setSurvey({
          title: existing.title,
          description: existing.description,
          branding: existing.branding,
          questions: existing.questions,
        })
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load survey.'
        setError(message)
      }
    }

    loadExistingSurvey()
  }, [surveyId])

  const shareUrl = useMemo(() => {
    if (!surveyId) {
      return ''
    }

    return `${window.location.origin}/s/${surveyId}`
  }, [surveyId])

  function updateBranding(field: keyof CreateSurveyPayload['branding'], value: string) {
    setSurvey((current) => ({
      ...current,
      branding: {
        ...current.branding,
        [field]: value,
      },
    }))
  }

  function updateSurveyField(
    field: keyof Pick<CreateSurveyPayload, 'title' | 'description'>,
    value: string,
  ) {
    setSurvey((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateQuestion(index: number, updated: Partial<SurveyQuestion>) {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...updated } : question,
      ),
    }))
  }

  function addQuestion(type: QuestionType) {
    setSurvey((current) => ({
      ...current,
      questions: [...current.questions, buildQuestion(type)],
    }))
  }

  function removeQuestion(index: number) {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setSurvey((current) => {
      const next = [...current.questions]
      const swapIndex = index + direction
      if (swapIndex < 0 || swapIndex >= next.length) {
        return current
      }

      const item = next[index]
      if (!item) {
        return current
      }

      next.splice(index, 1)
      next.splice(swapIndex, 0, item)
      return { ...current, questions: next }
    })
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, value } : option,
              ),
            }
          : question,
      ),
    }))
  }

  function addOption(questionIndex: number) {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              options: [...question.options, createOption(`Option ${question.options.length + 1}`)],
            }
          : question,
      ),
    }))
  }

  function removeOption(questionIndex: number, optionId: string) {
    setSurvey((current) => ({
      ...current,
      questions: current.questions.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              options: question.options.filter((option) => option.id !== optionId),
            }
          : question,
      ),
    }))
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      const saved = surveyId ? await updateSurvey(surveyId, survey) : await createSurvey(survey)

      setSaveMessage(`Survey saved. ${surveyId ? 'Updated.' : 'Ready to share.'}`)
      if (!surveyId) {
        navigate({ to: '/builder', search: { surveyId: saved.id } })
      }
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save survey.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main style={{ padding: '32px 20px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a, #2563eb)',
            color: 'white',
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Survey builder
          </p>
          <h1 style={{ margin: '12px 0 10px' }}>
            {surveyId ? 'Edit your survey' : 'Create a branded survey'}
          </h1>
          <p style={{ margin: 0, maxWidth: 700, lineHeight: 1.6 }}>
            Add questions, brand the experience, and save everything so the public link works as
            soon as you’re ready.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24 }}>
          <section
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ display: 'grid', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                Survey title
                <input
                  value={survey.title}
                  onChange={(event) => updateSurveyField('title', event.target.value)}
                  style={{
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    padding: '12px 14px',
                    fontSize: 16,
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                Description
                <textarea
                  value={survey.description}
                  onChange={(event) => updateSurveyField('description', event.target.value)}
                  rows={4}
                  style={{
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    padding: '12px 14px',
                    fontSize: 16,
                    resize: 'vertical',
                  }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                  Primary color
                  <input
                    type="color"
                    value={survey.branding.primaryColor}
                    onChange={(event) => updateBranding('primaryColor', event.target.value)}
                    style={{ height: 44, border: 0, padding: 0 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                  Logo URL
                  <input
                    value={survey.branding.logoUrl}
                    onChange={(event) => updateBranding('logoUrl', event.target.value)}
                    placeholder="https://example.com/logo.png"
                    style={{
                      borderRadius: 12,
                      border: '1px solid #cbd5e1',
                      padding: '12px 14px',
                      fontSize: 16,
                    }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0 }}>Questions</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {questionTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => addQuestion(option.value)}
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      + {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {survey.questions.map((question, index) => (
                  <div
                    key={question.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 20,
                      padding: 16,
                      background: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 800 }}>Question {index + 1}</p>
                        <p style={{ margin: '4px 0 0', color: '#475569' }}>
                          {
                            questionTypeOptions.find((option) => option.value === question.type)
                              ?.label
                          }
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, -1)}
                          style={toolbarButtonStyle}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, 1)}
                          style={toolbarButtonStyle}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          style={dangerButtonStyle}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                      <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                        Prompt
                        <input
                          value={question.prompt}
                          onChange={(event) =>
                            updateQuestion(index, { prompt: event.target.value })
                          }
                          style={{
                            borderRadius: 12,
                            border: '1px solid #cbd5e1',
                            padding: '10px 12px',
                            fontSize: 16,
                          }}
                        />
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>Required</span>
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(event) =>
                            updateQuestion(index, { required: event.target.checked })
                          }
                        />
                      </label>

                      <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                        Question type
                        <select
                          value={question.type}
                          onChange={(event) =>
                            updateQuestion(index, {
                              type: event.target.value as QuestionType,
                              options:
                                event.target.value === 'multiple_choice' ? question.options : [],
                              ratingScale:
                                event.target.value === 'rating' ? question.ratingScale || 5 : 5,
                            })
                          }
                          style={{
                            borderRadius: 12,
                            border: '1px solid #cbd5e1',
                            padding: '10px 12px',
                            fontSize: 16,
                          }}
                        >
                          {questionTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      {question.type === 'multiple_choice' ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {question.options.map((option, optionIndex) => (
                            <div key={option.id} style={{ display: 'flex', gap: 8 }}>
                              <input
                                value={option.value}
                                onChange={(event) =>
                                  updateOption(index, optionIndex, event.target.value)
                                }
                                style={{
                                  flex: 1,
                                  borderRadius: 12,
                                  border: '1px solid #cbd5e1',
                                  padding: '10px 12px',
                                  fontSize: 16,
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, option.id)}
                                style={dangerButtonStyle}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            style={secondaryButtonStyle}
                          >
                            + Add option
                          </button>
                        </div>
                      ) : null}

                      {question.type === 'rating' ? (
                        <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
                          Rating scale
                          <input
                            type="number"
                            min={3}
                            max={10}
                            value={question.ratingScale}
                            onChange={(event) =>
                              updateQuestion(index, {
                                ratingScale: Number.parseInt(event.target.value || '5', 10),
                              })
                            }
                            style={{
                              borderRadius: 12,
                              border: '1px solid #cbd5e1',
                              padding: '10px 12px',
                              fontSize: 16,
                            }}
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside style={{ display: 'grid', gap: 24 }}>
            <section
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Preview</h2>
              <div
                style={{
                  borderRadius: 22,
                  padding: 20,
                  background: '#f8fafc',
                  border: `1px solid ${survey.branding.primaryColor}`,
                }}
              >
                {survey.branding.logoUrl ? (
                  <img
                    src={survey.branding.logoUrl}
                    alt="Survey logo"
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 18 }}
                  />
                ) : null}
                <h3 style={{ marginBottom: 8 }}>{survey.title}</h3>
                <p style={{ color: '#475569', marginTop: 0 }}>{survey.description}</p>
                <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                  {survey.questions.map((question, index) => (
                    <div
                      key={question.id}
                      style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 14,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <p style={{ marginTop: 0, fontWeight: 700 }}>
                        {index + 1}. {question.prompt}
                      </p>
                      <p style={{ marginBottom: 0, color: '#475569' }}>
                        {question.type === 'text' && 'Single-line answer'}
                        {question.type === 'long_text' && 'Paragraph answer'}
                        {question.type === 'multiple_choice' && 'Choose one option'}
                        {question.type === 'rating' && `Rate from 1 to ${question.ratingScale}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Publish</h2>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>
                Save the survey and share the public link with anyone who should respond.
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  background: survey.branding.primaryColor,
                  color: 'white',
                  border: 0,
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isSaving ? 'Saving…' : surveyId ? 'Update survey' : 'Save survey'}
              </button>

              {saveMessage ? <p style={{ color: '#0f766e' }}>{saveMessage}</p> : null}
              {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
              {shareUrl ? (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>Public URL</p>
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
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

const toolbarButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  background: 'white',
  cursor: 'pointer',
}

const dangerButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '8px 10px',
  border: 0,
  background: '#fee2e2',
  color: '#b42318',
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '8px 12px',
  border: '1px solid #cbd5e1',
  background: 'white',
  cursor: 'pointer',
}
