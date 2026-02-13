import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError, readBody } from 'h3'
import { eq, and } from 'drizzle-orm'

type RegisterBody = {
  title: string
  description?: string
  category: string
  start_date: string
  due_date: string
  completed?: boolean
}

export default eventHandler(async (event) => {
  try {
   
    const userId = Number(event.context.userId)

    if (!userId || isNaN(userId)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must login first'
      })
    }

    
    const body = await readBody<RegisterBody>(event)

    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    const { title, category, start_date, due_date, description, completed } = body

   
    if (!title?.trim() || !category?.trim() || !start_date || !due_date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required'
      })
    }

   
    const startDateObj = new Date(start_date)
    const dueDateObj = new Date(due_date)

    if (isNaN(startDateObj.getTime()) || isNaN(dueDateObj.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid date format'
      })
    }

   
    const existing = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.title, title.trim()), eq(todos.user_id, userId)))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        message: 'You already created this todo'
      }
    }

    
    await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      category: category.trim(),
      start_date: startDateObj,
      due_date: dueDateObj,
      completed: completed ?? false,
      user_id: userId
    })

    return {
      success: true,
      message: 'Todo created successfully'
    }

  } catch (err: any) {
    console.error('CREATE TODO ERROR 👉', err)

    // keep real error status
    if (err?.statusCode) throw err

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create todo'
    })
  }
})
