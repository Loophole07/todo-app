import { eventHandler, createError } from 'h3'
import cookie from 'cookie'

export default eventHandler((event) => {
  if (!event.node?.res) {
    throw createError({ statusCode: 500, statusMessage: 'Node response not available' })
  }

  event.node.res.setHeader(
    'Set-Cookie',
    cookie.serialize('admin_session', '', {
      httpOnly: true,
      path: '/',
      maxAge: -1,
    })
  )

  return { success: true, message: 'Logged out successfully' }
})