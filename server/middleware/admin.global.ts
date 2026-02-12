import { eventHandler } from 'h3'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  const publicPaths = ['/', '/favicon.ico', '/api/admin/login'] 
  if (publicPaths.includes(event.path)) return

  
  if (!event.path.startsWith('/admin') && !event.path.startsWith('/api/admin')) return


  if (!event.node?.req || !event.node?.res) return

  // Parse cookies
  const rawCookies = event.node.req.headers.cookie || ''
  const cookies = cookie.parse(rawCookies)
  const token = cookies['admin_session']


  if (!token) {
    if (!event.path.startsWith('/api')) {
      // Redirect browser to login page
      event.node.res.statusCode = 302
      event.node.res.setHeader('Location', '/')
      event.node.res.end()
      return
    }

    // API request
    event.node.res.statusCode = 401
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.end(JSON.stringify({ success: false, message: 'Unauthorized: Please login' }))
    return
  }

  event.context.adminId = Number(token)
})
