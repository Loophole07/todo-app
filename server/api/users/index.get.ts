import { eventHandler } from 'h3'
import db from '~/server/db'
import { users } from '~/server/db/schema'

export default eventHandler(async (event) => {
  try {
     const reqUrl = event.req.url || '/'
    const baseUrl = 'http://localhost'
    const url = new URL(reqUrl, baseUrl)

    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('perPage') ?? '10')


    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    }).from(users)

 
    const total = allUsers.length
    const paginatedUsers = allUsers.slice((page - 1) * perPage, page * perPage)

    return {
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        total
      }
    }
  } catch (error) {
    console.error('FETCH USERS ERROR ', error)
    return {
      success: false,
      users: [],
      pagination: null,
      message: 'Failed to fetch users'
    }
  }
})
