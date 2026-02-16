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

export default eventHandler(async (event) => {
  try {
    let body: TodoBody

    // Manual parsing
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = ''
        event.node?.req.on('data', (chunk: any) => (data += chunk))
        event.node?.req.on('end', () => resolve(data))
        event.node?.req.on('error', reject)
      })

      body = JSON.parse(raw)
    } catch (err) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    const { title, category, start_date, due_date, description, completed, user_id } = body

    
    if (!user_id || isNaN(Number(user_id))) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must login first'
      })
    }

    const userId = Number(user_id)

  
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

    
    if (err?.statusCode) throw err

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create todo'
    })
  }
})