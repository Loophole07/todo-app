import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq, and } from 'drizzle-orm'

type TodoBody = {
  title: string
  description?: string
  category: string
  start_date: string
  due_date: string
  completed?: boolean
  user_id: number
}

const VALID_CATEGORIES = ['study', 'bug', 'api', 'code', 'exam', 'health', 'work', 'personal', 'shopping']

export default eventHandler(async (event) => {
  try {
    let body: TodoBody

    try {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = ''
        event.node?.req.on('data', (chunk: any) => (data += chunk))
        event.node?.req.on('end', () => resolve(data))
        event.node?.req.on('error', reject)
      })
      body = JSON.parse(raw)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
    }

    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Request body is missing' })
    }

    const { title, category, start_date, due_date, description, completed, user_id } = body

    // --- Auth check ---
    if (!user_id || isNaN(Number(user_id))) {
      throw createError({ statusCode: 401, statusMessage: 'You must be logged in first' })
    }
    const userId = Number(user_id)

    // --- Title ---
    if (!title?.trim()) {
      return { success: false, field: 'title', message: 'Title is required' }
    }
    if (title.trim().length < 3) {
      return { success: false, field: 'title', message: 'Title must be at least 3 characters' }
    }
    if (title.trim().length > 100) {
      return { success: false, field: 'title', message: 'Title must be less than 100 characters' }
    }

    // --- Description ---
    if (description && description.trim().length > 500) {
      return { success: false, field: 'description', message: 'Description must be less than 500 characters' }
    }

    // --- Category ---
    if (!category?.trim()) {
      return { success: false, field: 'category', message: 'Please select a category' }
    }
    if (!VALID_CATEGORIES.includes(category.trim())) {
      return { success: false, field: 'category', message: 'Invalid category selected' }
    }

    // --- Dates ---
    if (!start_date) {
      return { success: false, field: 'start_date', message: 'Start date is required' }
    }
    if (!due_date) {
      return { success: false, field: 'due_date', message: 'End date is required' }
    }

    const startDateObj = new Date(start_date)
    const dueDateObj = new Date(due_date)

    if (isNaN(startDateObj.getTime())) {
      return { success: false, field: 'start_date', message: 'Start date is invalid' }
    }
    if (isNaN(dueDateObj.getTime())) {
      return { success: false, field: 'due_date', message: 'End date is invalid' }
    }
    if (dueDateObj < startDateObj) {
      return { success: false, field: 'due_date', message: 'End date cannot be before start date' }
    }

    // --- Duplicate check ---
    const existing = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.title, title.trim()), eq(todos.user_id, userId)))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, field: 'title', message: 'You already have a todo with this title' }
    }

  
    await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      category: category.trim(),
      start_date: startDateObj,
      due_date: dueDateObj,
      completed: completed ?? false,
      user_id: userId,
    })

    return { success: true, message: 'Todo created successfully' }

  } catch (err: any) {
    console.error('CREATE TODO ERROR 👉', err)
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to create todo' })
  }
})