import db from '~/server/db'  // ✅ default import
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password } = body

    if (!name || !email || !password) {
      return { success: false, message: 'Please fill all fields' }
    }

    // Check if email already exists
    const existing = await db.select().from(users).where(users.email.eq(email))
    if (existing.length > 0) {
      return { success: false, message: 'Email already registered' }
    }

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.insert(users).values({
      name,
      email,
      password_hash: hashedPassword
    })

    return { success: true, message: 'User registered successfully' }
  } catch (err) {
    console.error('REGISTER ERROR ', err)
    return { success: false, message: 'Server error' }
  }
})
