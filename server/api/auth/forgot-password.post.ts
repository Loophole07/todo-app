import { sendEmail } from '~/server/utils/mailer'
import db from '~/server/db'
import { users, passwordResetTokens } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  //Read email from request body
  const body = await readBody<{ email: string }>(event)

  if (!body || !body.email) {
    throw createError({ statusCode: 400, message: 'Email is required.' })
  }

  const email = body.email
  console.log('Email received:', email)

  //Find user
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const user = userResult[0]
  console.log(' User found:', user)

  if (!user) {
    return { message: 'If that email exists, a reset link was sent.' }
  }

  //Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hr from now

  //DB
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt
  })
  console.log(' Token saved to DB:', token)

  //Send reset email
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`

  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    
    <!-- Header -->
    <div style="background-color: #3b82f6; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;"> Password Reset</h1>
    </div>

    <!-- Body -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <p style="color: #374151; font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to create a new password.
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
          style="background-color: #3b82f6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
          Reset My Password
        </a>
      </div>

      <p style="color: #6b7280; font-size: 13px;">
         This link expires in <strong>1 hour</strong>.
      </p>

      <p style="color: #d01a1a; font-size: 13px;">
         If you didn't request this, you can safely ignore this email. Your password will not be changed.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
      </p>

    </div>

    <!-- Footer -->
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
      © 2026 Todo App. All rights reserved.
    </p>

  </div>
`
    })
    console.log(' Email sent successfully to:', email)
  } catch (err) {
    console.error(' Email sending failed:', err)
    throw createError({ statusCode: 500, message: 'Failed to send email.' })
  }

  return { message: 'Reset link sent.' }
})