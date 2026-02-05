import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

type RegisterBody = {
  title: string
  description?: string
  category: string
  start_date: string
  due_date: string
  completed?: boolean
  user_id: 2
}


const readJsonBody = async <T>(event: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = ''

    event.req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })

    event.req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })

    event.req.on('error', reject)
  })
}

export default eventHandler(async (event) => {
  try {
    const body = await readJsonBody<RegisterBody>(event)

    const { title, category, start_date, due_date, description, completed, user_id } = body

    if (!category || !title || !start_date || !due_date) {
      return { success: false, message: 'All fields are required' }
    }

    const existing = await db
      .select({ id: todos.id })
      .from(todos)
      .where(eq(todos.title, title))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, message: 'Todo cannot be registered' }
    }

   
    await db.insert(todos).values({
      title,
      description: description || null,
      category,
      start_date: new Date(start_date),
      due_date: new Date(due_date),
      completed: completed ?? false,
      user_id
    })

    return { success: true, message: 'Todo registered successfully' }
  } catch (err) {
    console.error('REGISTER ERROR 👉', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed',
    })
  }
})
