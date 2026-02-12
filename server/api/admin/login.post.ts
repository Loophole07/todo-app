
import db from '~/server/db'
import { admin } from '~/server/db/schema'
import { eventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'

type AdminLoginBody = {
  email: string
  password: string
}

export default eventHandler(async (event) => {
  let body: AdminLoginBody

  // --- Safely parse JSON body ---
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = ''
      event.node?.req.on('data', (chunk: any) => (data += chunk))
      event.node?.req.on('end', () => resolve(data))
      event.node?.req.on('error', reject)
    })
    body = JSON.parse(raw)
  } catch (err) {
    return { success: false, message: 'Invalid request body' }
  }

  const { email, password } = body
  if (!email || !password) return { success: false, message: 'Email and password are required' }

  try {
    // --- Find admin by email ---
    const [adminUser] = await db
      .select()
      .from(admin)
      .where(eq(admin.email, email))
      .limit(1)

    if (!adminUser) return { success: false, message: 'Invalid credentials' }

    // --- Since password is plain text (not hashed) ---
    if (password !== adminUser.password_hash) {
      return { success: false, message: 'Invalid credentials' }
    }

    // --- Set HTTP-only cookie for session ---
    event.node?.res?.setHeader(
      'Set-Cookie',
      cookie.serialize('admin_session', adminUser.id.toString(), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      })
    )

    return {
      success: true,
      message: 'Login successful',
      redirect: '/admin', // frontend can use this to navigate
      admin: { id: adminUser.id, username: adminUser.username, email: adminUser.email },
    }
  } catch (err) {
    console.error('ADMIN LOGIN ERROR 👉', err)
    return { success: false, message: 'Server error, try again later' }
  }
})
