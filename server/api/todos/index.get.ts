import { eventHandler, createError } from 'h3'
import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const userId = event.context.userId as number

    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const reqUrl = event.req.url || '/'
    const baseUrl = 'http://localhost'
    const url = new URL(reqUrl, baseUrl)

    const category = url.searchParams.get('category')?.trim()
    const status = url.searchParams.get('status')?.trim() 
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('perPage') ?? '10')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

  
    let allTodos = category
      ? await db.select().from(todos).where(and(eq(todos.user_id, userId), eq(todos.category, category)))
      : await db.select().from(todos).where(eq(todos.user_id, userId))

    // Helper: safely parse a due_date that may be Date | null
    const parseDue = (raw: Date | string | null): Date | null => {
      if (raw === null || raw === undefined) return null
      const d = new Date(raw)
      d.setHours(0, 0, 0, 0)
      return isNaN(d.getTime()) ? null : d
    }

    // Apply status filter in JS after fetching
    if (status === 'completed') {
      allTodos = allTodos.filter((t) => t.completed === true)
    } else if (status === 'overdue') {
      // Not completed AND due_date exists AND is before today
      allTodos = allTodos.filter((t) => {
        if (t.completed) return false
        const due = parseDue(t.due_date)
        return due !== null && due < today
      })
    } else if (status === 'in_progress') {
      
      allTodos = allTodos.filter((t) => {
        if (t.completed) return false
        const due = parseDue(t.due_date)
        return due === null || due >= today
      })
    }

    const total = allTodos.length
    const paginatedTodos = allTodos.slice((page - 1) * perPage, page * perPage)

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
    console.error('FETCH TODOS ERROR ', err)
    return {
      success: false,
      todos: [],
      pagination: null,
      message: 'Failed to fetch todos',
    }
  }
})