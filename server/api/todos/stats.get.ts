import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  try {
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const parseDate = (raw: Date | string | null | undefined): Date | null => {
      if (raw == null) return null
      const d = new Date(raw)
      d.setHours(0, 0, 0, 0)
      return isNaN(d.getTime()) ? null : d
    }

    const total     = userTodos.length
    const completed = userTodos.filter((t) => t.completed).length

    // Overdue: not completed, due date strictly before today
    const overdue = userTodos.filter((t) => {
      if (t.completed) return false
      const due = parseDate(t.due_date)
      return due !== null && due < today
    }).length

    // Upcoming: not completed, start_date is strictly in the future
    const upcoming = userTodos.filter((t) => {
      if (t.completed) return false
      const start = parseDate(t.start_date)
      return start !== null && start > today
    }).length

    // In Progress: not completed, not overdue, already started (start <= today <= due)
    const in_progress = userTodos.filter((t) => {
      if (t.completed) return false
      const start = parseDate(t.start_date)
      const due   = parseDate(t.due_date)
      if (!start || !due) return false
      return start <= today && due >= today
    }).length

    return {
      success: true,
      stats: {
        total,
        completed,
        upcoming,
        in_progress,
        overdue,
      },
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