import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq, and } from 'drizzle-orm'
import cookie from 'cookie'

type UpdateBody = {
  title: string
  description?: string
  category?: string
  start_date?: string
  due_date?: string
  completed?: boolean
  user_id: number
}

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid todo ID' })
    }

    // Manual 
    let body: UpdateBody
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = ''
        event.node?.req.on('data', (chunk: any) => (data += chunk))
        event.node?.req.on('end', () => resolve(data))
        event.node?.req.on('error', reject)
      })

      body = JSON.parse(raw)
    } catch (err) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    // Get user_id 
    const userId = Number(body.user_id)

    if (!userId || isNaN(userId)) {
      throw createError({ statusCode: 401, statusMessage: 'You must login first' })
    }

    if (!body?.title) {
      throw createError({ statusCode: 400, statusMessage: 'Title required' })
    }

    // Check 
    const [existingTodo] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .limit(1)

    if (!existingTodo) {
      throw createError({ statusCode: 403, statusMessage: 'Not your todo or todo not found' })
    }

    // Update todo
    await db.update(todos)
      .set({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category?.trim() || 'personal',
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        completed: body.completed ?? false
      })
      .where(eq(todos.id, id))

    return { success: true, message: 'Todo updated successfully' }

  } catch (err: any) {
    console.error('UPDATE TODO ERROR 👉', err)

    if (err?.statusCode) throw err

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update todo',
    })
  }
})