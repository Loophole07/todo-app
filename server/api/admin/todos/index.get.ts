import { eventHandler } from 'h3'
import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

type DeadlineUrgency = 'safe' | 'moderate' | 'urgent' | 'none'

const getDaysLeft = (due: Date | null, today: Date): number | null => {
  if (!due) return null
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

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
    const reqUrl  = event.req.url || '/'
    const baseUrl = 'http://localhost'
    const url     = new URL(reqUrl, baseUrl)

    const category = url.searchParams.get('category')?.trim()
    const page     = Number(url.searchParams.get('page')    ?? '1')
    const perPage  = Number(url.searchParams.get('perPage') ?? '10')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const parseDate = (raw: Date | string | null | undefined): Date | null => {
      if (raw == null) return null
      const d = new Date(raw)
      d.setHours(0, 0, 0, 0)
      return isNaN(d.getTime()) ? null : d
    }

    const allTodos = category
      ? await db.select().from(todos).where(eq(todos.category, category))
      : await db.select().from(todos)

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