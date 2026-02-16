import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  try {
   
    const cookieHeader = event.node?.req?.headers?.cookie || ''
    const cookies = cookie.parse(cookieHeader)
    const sessionCookie = cookies.user_session

    if (!sessionCookie) {
      return { success: false, message: 'Not authenticated' }
    }

    const userId = Number(sessionCookie)

    if (isNaN(userId)) {
      return { success: false, message: 'Invalid session' }
    }

    // Fetch user 
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  } catch (err) {
    console.error('ME ENDPOINT ERROR ', err)
    return { success: false, message: 'Server error' }
  }
})