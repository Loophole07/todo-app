import db from '~/server/db'
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { defineEventHandler, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return { success: false, message: 'Email and password are required' }
    }

  
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return { success: false, message: 'Invalid credentials' }
    }

    
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return { success: false, message: 'Invalid credentials' }
    }

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  } catch (error) {
    console.error('LOGIN ERROR ', error)
    throw createError({ statusCode: 500, statusMessage: 'Login failed' })
  }
})
