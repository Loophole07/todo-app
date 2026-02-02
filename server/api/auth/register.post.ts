import db from '~/server/db'
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { eventHandler, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'

type RegisterBody = {
  name: string
  email: string
  password: string
}

export default eventHandler(async (event) => {
  const body = await readBody<RegisterBody | undefined>(event)

  if (!body) {
    return { success: false, message: 'Invalid request body' }
  }

  const { name, email, password } = body

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required' }
  }

  try {
    // Check if user exists
    let existing
    try {
      existing = await db.select().from(users).where(eq(users.email, email))
    } catch (err) {
      console.error('Error checking existing user:', err)
      throw err
    }

    if (existing.length > 0) {
      return { success: false, message: 'Email already registered' }
    }

    // Hash password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (err) {
      console.error('Error hashing password:', err)
      throw err
    }

   
    try {
      await db.insert(users).values({
        name,
        email,
        password_hash: hashedPassword,
      })
    } catch (err) {
      console.error('Error inserting user:', err)
      throw err
    }

    return { success: true, message: 'User registered successfully' }
  } catch (error) {
    console.error('REGISTER ERROR FULL TRACE: ', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed',
    })
  }
})
