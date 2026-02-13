import { eventHandler } from 'h3'
import cookie from 'cookie'

export default eventHandler(async (event) => {
  const publicPaths = ['/', '/favicon.ico', '/api/auth/login']

  if (publicPaths.includes(event.path)) return

  
  if (!event.path.startsWith('/home') && 
      !event.path.startsWith('/todos') && 
      !event.path.startsWith('/api/todos'))
    return

  if (!event.node?.req || !event.node?.res) return

  const rawCookies = event.node.req.headers.cookie || ''
  const cookies = cookie.parse(rawCookies)
  const token = cookies['user_session']

  if (!token) {
   
    if (!event.path.startsWith('/api')) {
      event.node.res.statusCode = 302
      event.node.res.setHeader('Location', '/')
      event.node.res.end()
      return
    }

    // API access 
    event.node.res.statusCode = 401
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.end(JSON.stringify({ success: false, message: 'Login required' }))
    return
  }


  event.context.userId = Number(token)
})