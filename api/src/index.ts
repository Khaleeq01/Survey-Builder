import type { Context } from 'hono'
import { Hono } from 'hono'

interface SurveyOption {
  id: string
  value: string
}

interface QuestionType {
  type: 'text' | 'long_text' | 'multiple_choice' | 'rating'
  prompt: string
  required: boolean
  options: SurveyOption[]
  ratingScale: number
}

interface SurveyBranding {
  primaryColor: string
  logoUrl: string
}

interface Survey {
  id: string
  ownerId: string
  title: string
  description: string
  branding: SurveyBranding
  questions: QuestionType[]
  createdAt: string
  updatedAt: string
}

interface SurveyResponse {
  id: string
  surveyId: string
  answers: Record<string, string>
  submittedAt: string
}

interface Owner {
  id: string
  email: string
}

interface Session {
  token: string
  owner_id: string
  email: string
}

interface CreateSurveyBody {
  title: string
  description: string
  branding: SurveyBranding
  questions: QuestionType[]
}

interface LoginBody {
  email: string
}

interface PublicResponseBody {
  answers: Record<string, string>
}

type Variables = {
  owner: Owner
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function now() {
  return new Date().toISOString()
}

/* ---------------- AUTH MIDDLEWARE ---------------- */
async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const session = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE token = ?'
  ).bind(token).first<Session>()

  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const owner = await c.env.DB.prepare(
    'SELECT * FROM owners WHERE id = ?'
  ).bind(session.owner_id).first<Owner>()

  if (!owner) return c.json({ error: 'Unauthorized' }, 401)

  c.set('owner', owner)
  await next()
}

/* ---------------- HEALTH ---------------- */
app.get('/', (c) => c.text('API Server Running'))
app.get('/api/health', (c) => c.json({ status: 'ok' }))

/* ---------------- LOGIN ---------------- */
app.post('/api/auth/login', async (c) => {
  const body = (await c.req.json()) as LoginBody
  const email = body.email?.trim().toLowerCase()

  if (!email?.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400)
  }

  let owner = await c.env.DB.prepare(
    'SELECT * FROM owners WHERE email = ?'
  ).bind(email).first<Owner>()

  if (!owner) {
    owner = {
      id: generateId('owner'),
      email,
    }

    await c.env.DB.prepare(
      'INSERT INTO owners (id, email) VALUES (?, ?)'
    ).bind(owner.id, owner.email).run()
  }

  const session: Session = {
    token: generateId('session'),
    owner_id: owner.id,
    email: owner.email,
  }

  await c.env.DB.prepare(
    'INSERT INTO sessions (token, owner_id, email) VALUES (?, ?, ?)'
  ).bind(session.token, session.owner_id, session.email).run()

  return c.json({ owner, session })
})

/* ---------------- PROTECTED ROUTES ---------------- */
app.use('/api/surveys/*', authMiddleware)

/* ---------------- CREATE SURVEY ---------------- */
app.post('/api/surveys', async (c) => {
  const owner = c.get('owner')
  const body = (await c.req.json()) as CreateSurveyBody

  const survey: Survey = {
    id: generateId('survey'),
    ownerId: owner.id,
    title: body.title,
    description: body.description,
    branding: body.branding,
    questions: body.questions,
    createdAt: now(),
    updatedAt: now(),
  }

  await c.env.DB.prepare(`
    INSERT INTO surveys (
      id, owner_id, title, description, branding, questions, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    survey.id,
    survey.ownerId,
    survey.title,
    survey.description,
    JSON.stringify(survey.branding),
    JSON.stringify(survey.questions),
    survey.createdAt,
    survey.updatedAt
  ).run()

  return c.json(survey)
})

/* ---------------- GET SURVEYS ---------------- */
app.get('/api/surveys', async (c) => {
  const owner = c.get('owner')

  const result = await c.env.DB.prepare(
    'SELECT * FROM surveys WHERE owner_id = ?'
  ).bind(owner.id).all()

  const surveys = result.results.map((s: any) => ({
    id: s.id,
    ownerId: s.owner_id,
    title: s.title,
    description: s.description,
    branding: JSON.parse(s.branding),
    questions: JSON.parse(s.questions),
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }))

  return c.json(surveys)
})

/* ---------------- GET SINGLE SURVEY ---------------- */
app.get('/api/surveys/:id', async (c) => {
  const owner = c.get('owner')

  const survey = await c.env.DB.prepare(
    'SELECT * FROM surveys WHERE id = ? AND owner_id = ?'
  ).bind(c.req.param('id'), owner.id).first<any>()

  if (!survey) return c.json({ error: 'Not found' }, 404)

  return c.json({
    id: survey.id,
    ownerId: survey.owner_id,
    title: survey.title,
    description: survey.description,
    branding: JSON.parse(survey.branding),
    questions: JSON.parse(survey.questions),
    createdAt: survey.created_at,
    updatedAt: survey.updated_at,
  })
})

/* ---------------- UPDATE SURVEY ---------------- */
app.put('/api/surveys/:id', async (c) => {
  const owner = c.get('owner')
  const body = (await c.req.json()) as CreateSurveyBody

  await c.env.DB.prepare(`
    UPDATE surveys SET
      title = ?,
      description = ?,
      branding = ?,
      questions = ?,
      updated_at = ?
    WHERE id = ? AND owner_id = ?
  `).bind(
    body.title,
    body.description,
    JSON.stringify(body.branding),
    JSON.stringify(body.questions),
    now(),
    c.req.param('id'),
    owner.id
  ).run()

  return c.json({ success: true })
})

/* ---------------- RESPONSES (PUBLIC) ---------------- */
app.post('/api/public/surveys/:id/responses', async (c) => {
  const body = (await c.req.json()) as PublicResponseBody

  const response: SurveyResponse = {
    id: generateId('resp'),
    surveyId: c.req.param('id'),
    answers: body.answers,
    submittedAt: now(),
  }

  await c.env.DB.prepare(`
    INSERT INTO responses (id, survey_id, answers, submitted_at)
    VALUES (?, ?, ?, ?)
  `).bind(
    response.id,
    response.surveyId,
    JSON.stringify(response.answers),
    response.submittedAt
  ).run()

  return c.json(response)
})

/* ---------------- GET RESPONSES ---------------- */
app.get('/api/surveys/:id/responses', async (c) => {
  const owner = c.get('owner')

  const result = await c.env.DB.prepare(
    'SELECT * FROM responses WHERE survey_id = ?'
  ).bind(c.req.param('id')).all()

  return c.json(result.results.map((r: any) => ({
    id: r.id,
    surveyId: r.survey_id,
    answers: JSON.parse(r.answers),
    submittedAt: r.submitted_at,
  })))
})

export default app