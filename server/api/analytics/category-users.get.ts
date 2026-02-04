import { eventHandler } from 'h3'
import db from '~/server/db'
import { todos, users } from '~/server/db/schema'
import { eq, inArray } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    // --- Safe URL parsing ---
    const reqUrl = event.req.url || '/'                // fallback
    const baseUrl = 'http://localhost'                // dummy base for URL
    const url = new URL(reqUrl, baseUrl)

    const category = url.searchParams.get('category')?.trim()
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('perPage') ?? '10')

    if (!category) {
      return {
        success: false,
        users: [],
        total: 0,
        message: 'Category is required'
      }
    }

    // --- Fetch todos in this category ---
    const todosInCategory = await db
      .select({ user_id: todos.user_id })
      .from(todos)
      .where(eq(todos.category, category))

    // --- Extract unique user IDs ---
    const userIds = Array.from(
      new Set(
        todosInCategory
          .map(t => t.user_id)
          .filter((id): id is number => id !== null)
      )
    )

    if (userIds.length === 0) {
      return { success: true, users: [], total: 0 }
    }

    // --- Server-side pagination ---
    const total = userIds.length
    const paginatedIds = userIds.slice((page - 1) * perPage, page * perPage)

    // --- Fetch user details ---
    const usersInCategory = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(inArray(users.id, paginatedIds))

    return {
      success: true,
      users: usersInCategory,
      total
    }
  } catch (err) {
    console.error('CATEGORY USERS FETCH ERROR', err)
    return {
      success: false,
      users: [],
      total: 0,
      message: 'Failed to fetch users'
    }
  }
})
