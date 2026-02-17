import db from '~/server/db'
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

type RegisterBody = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const readJsonBody = async <T>(event: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = ''
    event.req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    event.req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch (err) { reject(err) }
    })
    event.req.on('error', reject)
  })
}

export default eventHandler(async (event) => {
  try {
    const body = await readJsonBody<RegisterBody>(event)
    const { name, email, password, confirmPassword } = body

    // --- Name ---
    if (!name?.trim()) {
      return { success: false, field: 'name', message: 'Full name is required' }
    }
    if (name.trim().length < 2) {
      return { success: false, field: 'name', message: 'Name must be at least 2 characters' }
    }
    if (name.trim().length > 50) {
      return { success: false, field: 'name', message: 'Name must be less than 50 characters' }
    }

    // --- Email ---
    if (!email?.trim()) {
      return { success: false, field: 'email', message: 'Email is required' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return { success: false, field: 'email', message: 'Please enter a valid email address' }
    }

    // --- Password ---
    if (!password) {
      return { success: false, field: 'password', message: 'Password is required' }
    }
    if (password.length < 6) {
      return { success: false, field: 'password', message: 'Password must be at least 6 characters' }
    }

    // --- Confirm Password ---
    if (!confirmPassword) {
      return { success: false, field: 'confirmPassword', message: 'Please confirm your password' }
    }
    if (password !== confirmPassword) {
      return { success: false, field: 'confirmPassword', message: 'Passwords do not match' }
    }

    // --- Duplicate email ---
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, field: 'email', message: 'This email is already registered' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      name: name.trim(),
      email: email.trim(),
      password_hash: hashedPassword,
    })

    return { success: true, message: 'Account created successfully!' }

  } catch (err) {
    console.error('REGISTER ERROR ', err)
    throw createError({ statusCode: 500, statusMessage: 'Registration failed' })
  }
})