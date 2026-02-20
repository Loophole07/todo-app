import { eventHandler, createError } from 'h3'
import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eq, and, like } from 'drizzle-orm'

type DeadlineUrgency = 'safe' | 'moderate' | 'urgent' | 'none'

/** Returns days remaining until due date (0 = today, negative = overdue). null if no due date. */
const getDaysLeft = (due: Date | null, today: Date): number | null => {
  if (!due) return null
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Maps days-left to a colour urgency tier. */
const getDeadlineUrgency = (daysLeft: number | null): DeadlineUrgency => {
  if (daysLeft === null)              return 'none'
  if (daysLeft >= 4 && daysLeft <= 6) return 'safe'     // 🟢 green
  if (daysLeft >= 2 && daysLeft <  4) return 'moderate' // 🟡 amber
  if (daysLeft >= 0 && daysLeft <  2) return 'urgent'   // 🔴 scarlet
  if (daysLeft < 0)                   return 'urgent'   // overdue → also urgent
  return 'none'
}

export default eventHandler(async (event) => {
  try {
    const userId = event.context.userId as number

    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const reqUrl  = event.req.url || '/'
    const baseUrl = 'http://localhost'
    const url     = new URL(reqUrl, baseUrl)

    const category = url.searchParams.get('category')?.trim()
    const status   = url.searchParams.get('status')?.trim()
    const search   = url.searchParams.get('search')?.trim()
    const page     = Number(url.searchParams.get('page')    ?? '1')
    const perPage  = Number(url.searchParams.get('perPage') ?? '6')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // ── Build DB where conditions ──────────────────────────────────────────
    const conditions = [eq(todos.user_id, userId)]
    if (category) conditions.push(eq(todos.category, category))
    if (search)   conditions.push(like(todos.title, `%${search}%`))

    let allTodos = await db
      .select()
      .from(todos)
      .where(and(...conditions))

    // ── Helper: parse due_date / start_date to midnight Date ──────────────
    const parseDate = (raw: Date | string | null | undefined): Date | null => {
      if (raw == null) return null
      const d = new Date(raw)
      d.setHours(0, 0, 0, 0)
      return isNaN(d.getTime()) ? null : d
    }

    // ── Status filter ──────────────────────────────────────────────────────
    if (status === 'completed') {
      allTodos = allTodos.filter((t) => t.completed === true)

    } else if (status === 'overdue') {
      allTodos = allTodos.filter((t) => {
        if (t.completed) return false
        const due = parseDate(t.due_date)
        return due !== null && due < today
      })

    } else if (status === 'upcoming') {
      // Not completed, start_date is strictly in the future
      allTodos = allTodos.filter((t) => {
        if (t.completed) return false
        const start = parseDate(t.start_date)
        return start !== null && start > today
      })

    } else if (status === 'in_progress') {
      // Not completed, not overdue, already started (start <= today <= due)
      allTodos = allTodos.filter((t) => {
        if (t.completed) return false
        const start = parseDate(t.start_date)
        const due   = parseDate(t.due_date)
        if (!start || !due) return false
        const isOverdue = due < today
        return start <= today && !isOverdue
      })
    }

    // ── Attach deadline urgency to every todo ──────────────────────────────
    const todosWithUrgency = allTodos.map((t) => {
      const due      = parseDate(t.due_date)
      const daysLeft = t.completed ? null : getDaysLeft(due, today)
      return {
        ...t,
        days_left:        daysLeft,
        deadline_urgency: t.completed ? ('none' as DeadlineUrgency) : getDeadlineUrgency(daysLeft),
      }
    })

    // ── Pagination ─────────────────────────────────────────────────────────
    const total          = todosWithUrgency.length
    const paginatedTodos = todosWithUrgency.slice((page - 1) * perPage, page * perPage)

    return {
      success: true,
      todos: paginatedTodos,
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        total,
      },
    }

  } catch (err) {
    console.error('FETCH TODOS ERROR', err)
    return {
      success: false,
      todos: [],
      pagination: null,
      message: 'Failed to fetch todos',
    }
  }
})