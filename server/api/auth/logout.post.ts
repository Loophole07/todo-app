import { eventHandler } from 'h3'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  try {
    
    event.node?.res?.setHeader(
      'Set-Cookie',
      cookie.serialize('user_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, 
      })
    )

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (err) {
    console.error('LOGOUT ERROR 👉', err)
    return { success: false, message: 'Logout failed' }
  }
})