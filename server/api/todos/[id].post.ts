import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq, and } from 'drizzle-orm'

type UpdateBody = {
  title: string
  description?: string
  category?: string
  start_date?: string
  due_date?: string
  completed?: boolean
  user_id: number
}

const VALID_CATEGORIES = ['study', 'bug', 'api', 'code', 'exam', 'health', 'work', 'personal', 'shopping']

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid todo ID' })
    }

    let body: UpdateBody
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

    // --- Auth check ---
    const userId = Number(body.user_id)
    if (!userId || isNaN(userId)) {
      throw createError({ statusCode: 401, statusMessage: 'You must be logged in first' })
    }

    // --- Title ---
    if (!body.title?.trim()) {
      return { success: false, field: 'title', message: 'Title is required' }
    }
    if (body.title.trim().length < 3) {
      return { success: false, field: 'title', message: 'Title must be at least 3 characters' }
    }
    if (body.title.trim().length > 100) {
      return { success: false, field: 'title', message: 'Title must be less than 100 characters' }
    }

    // --- Description ---
    if (!body.description?.trim()) {
      return { success: false, field: 'description', message: 'Description is required' }
    }
    if (body.description.trim().length > 500) {
      return { success: false, field: 'description', message: 'Description must be less than 500 characters' }
    }

    // --- Category ---
    if (!body.category?.trim()) {
      return { success: false, field: 'category', message: 'Please select a category' }
    }
    if (!VALID_CATEGORIES.includes(body.category.trim())) {
      return { success: false, field: 'category', message: 'Invalid category selected' }
    }

    // --- Dates ---
    if (!body.start_date) {
      return { success: false, field: 'start_date', message: 'Start date is required' }
    }
    if (!body.due_date) {
      return { success: false, field: 'due_date', message: 'End date is required' }
    }

    const startDateObj = new Date(body.start_date)
    const dueDateObj = new Date(body.due_date)

    if (isNaN(startDateObj.getTime())) {
      return { success: false, field: 'start_date', message: 'Start date is invalid' }
    }
    if (isNaN(dueDateObj.getTime())) {
      return { success: false, field: 'due_date', message: 'End date is invalid' }
    }
    if (dueDateObj < startDateObj) {
      return { success: false, field: 'due_date', message: 'End date cannot be before start date' }
    }

    // --- Ownership check ---
    const [existingTodo] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .limit(1)

    if (!existingTodo) {
      throw createError({ statusCode: 403, statusMessage: 'Todo not found or access denied' })
    }

    // --- Update ---
    await db.update(todos)
      .set({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category.trim(),
        start_date: startDateObj,
        due_date: dueDateObj,
        completed: body.completed ?? false,
      })
      .where(eq(todos.id, id))

    return { success: true, message: 'Todo updated successfully' }

  } catch (err: any) {
    console.error('UPDATE TODO ERROR 👉', err)
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to update todo' })
  }
})