import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError, readBody } from 'h3'
import { eq, and } from 'drizzle-orm'

type UpdateBody = {
  title: string
  description?: string
  category?: string
  start_date?: string
  due_date?: string
  completed?: boolean
}

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const userId = Number(event.context.userId)

    
    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'You must login first' })
    }

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid todo ID' })
    }

 
    const body = await readBody<UpdateBody>(event)

    if (!body?.title) {
      throw createError({ statusCode: 400, statusMessage: 'Title required' })
    }

    
    const [existingTodo] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .limit(1)

    if (!existingTodo) {
      throw createError({ statusCode: 403, statusMessage: 'Not your todo' })
    }

   
    await db.update(todos)
      .set({
        title: body.title,
        description: body.description ?? null,
        category: body.category ?? 'personal',
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
