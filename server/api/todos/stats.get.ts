import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  try {
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


    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.user_id, userId))

   
    const total = userTodos.length
    const completed = userTodos.filter(t => t.completed).length
    const pending = userTodos.filter(t => !t.completed).length
    
  
    const now = new Date()
    const overdue = userTodos.filter(t => 
      !t.completed && t.due_date && new Date(t.due_date) < now
    ).length

    return {
      success: true,
      stats: {
        total,
        completed,
        pending,
        overdue
      }
    }

  } catch (err: any) {
    console.error('FETCH STATS ERROR 👉', err)

    if (err?.statusCode) throw err

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch statistics',
    })
  }
})