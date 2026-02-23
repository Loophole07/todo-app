import bcrypt from 'bcrypt'
import db from '~/server/db'
import { users, passwordResetTokens } from '~/server/db/schema'
import { eq, and, gt } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string; password: string; confirmPassword: string }>(event)

  if (!body || !body.token || !body.password || !body.confirmPassword) {
    throw createError({ statusCode: 400, message: 'All fields are required.' })
  }

  const { token, password, confirmPassword } = body

  // Backend validation
  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, message: 'Passwords do not match.' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'Password must be at least 6 characters.' })
  }

  if (!/[A-Z]/.test(password)) {
    throw createError({ statusCode: 400, message: 'Password must contain at least one uppercase letter.' })
  }

  if (!/[0-9]/.test(password)) {
    throw createError({ statusCode: 400, message: 'Password must contain at least one number.' })
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw createError({ statusCode: 400, message: 'Password must contain at least one special character.' })
  }

  // Check token
  const resetResult = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1)

  const resetRecord = resetResult[0]

  if (!resetRecord) {
    throw createError({ statusCode: 400, message: 'Invalid or expired token.' })
  }

  // Hash and save new password
  const hashedPassword = await bcrypt.hash(password, 10)

  await db
    .update(users)
    .set({ password_hash: hashedPassword })
    .where(eq(users.id, resetRecord.userId))

  // Delete used token
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))

  return { message: 'Password updated successfully.' }
})