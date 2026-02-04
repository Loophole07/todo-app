import { eventHandler } from 'h3'
import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
   
    const reqUrl = event.req.url || '/'
    const baseUrl = 'http://localhost' 
    const url = new URL(reqUrl, baseUrl)

    const category = url.searchParams.get('category')?.trim()
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('perPage') ?? '10')

    
    const allTodos = category
      ? await db.select().from(todos).where(eq(todos.category, category))
      : await db.select().from(todos)

    
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
