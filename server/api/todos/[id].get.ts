import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq, and } from 'drizzle-orm'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid todo ID' })
    }

    // Get user_id
    const cookieHeader = event.node?.req?.headers?.cookie || ''
    const cookies = cookie.parse(cookieHeader)
    const sessionCookie = cookies.user_session

    if (!sessionCookie) {
      throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    }

    const userId = Number(sessionCookie)

    if (isNaN(userId)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }

    // Fetch todo
    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .limit(1)

    if (!todo) {
      throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
    }

    return {
      success: true,
      todo: {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        category: todo.category,
        start_date: todo.start_date,
        due_date: todo.due_date,
        completed: todo.completed,
        user_id: todo.user_id
      }
    }

  } catch (err: any) {
    console.error('GET TODO ERROR ', err)

    if (err?.statusCode) throw err

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch todo',
    })
  }
})