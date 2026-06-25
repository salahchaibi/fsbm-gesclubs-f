import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistDir = path.join(__dirname, 'dist', 'client')
const serverBundlePath = path.join(__dirname, 'dist', 'server', 'entry-server.js')
const port = Number(process.env.PORT || 3000)
const backendUrl = process.env.BACKEND_URL || 'http://backend'
const authCookieName = 'fsbm_auth_token'
const authCookieMaxAge = 60 * 60 * 24 * 7

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function send(res, status, headers, body) {
  res.writeHead(status, headers)
  res.end(body)
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, pair) => {
    const index = pair.indexOf('=')
    if (index === -1) return cookies
    const key = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (!key) return cookies
    cookies[key] = decodeURIComponent(value)
    return cookies
  }, {})
}

function getAuthToken(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  return cookies[authCookieName] || null
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  parts.push(`Path=${options.path || '/'}`)
  parts.push('HttpOnly')
  parts.push(`SameSite=${options.sameSite || 'Lax'}`)
  if (options.secure) parts.push('Secure')
  return parts.join('; ')
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function stripHopByHop(headers) {
  const out = {}
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase()
    if (['connection', 'content-length', 'transfer-encoding', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'].includes(lower)) continue
    out[key] = value
  }
  return out
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return chunks.length ? Buffer.concat(chunks) : undefined
}

async function backendJson(pathname, req) {
  const target = new URL(pathname, backendUrl)
  const headers = {}
  const token = getAuthToken(req)
  if (token) headers.authorization = `Bearer ${token}`

  const res = await fetch(target, { headers, redirect: 'manual' })
  if (!res.ok) return null

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.data)) return data.data
  return []
}

async function buildInitialData(req) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  const auth = await backendJson('/api/profil', req)
  const initial = auth ? { auth: { user: auth } } : {}

  if (pathname === '/') {
    const [actualites, pageContent] = await Promise.all([
      backendJson('/api/actualites', req),
      backendJson('/api/page-accueil', req),
    ])
    initial.home = {
      actualites: normalizeList(actualites),
      pageContent: pageContent || null,
    }
    return initial
  }

  if (pathname === '/actualites') {
    const actualites = await backendJson('/api/actualites', req)
    initial.actualitesPage = {
      actualites: normalizeList(actualites),
    }
    return initial
  }

  if (pathname.startsWith('/actualites/')) {
    const id = pathname.split('/')[2]
    const [actu, actualites] = await Promise.all([
      backendJson(`/api/actualites/${id}`, req),
      backendJson('/api/actualites', req),
    ])
    const list = normalizeList(actualites).filter(item => String(item.id) !== String(id)).slice(0, 3)
    initial.actualiteDetail = {
      id,
      actu,
      autresActus: list,
    }
    return initial
  }

  if (pathname === '/clubs') {
    const clubs = await backendJson('/api/clubs', req)
    initial.clubsPage = {
      clubs: normalizeList(clubs),
    }
    return initial
  }

  if (pathname.startsWith('/clubs/')) {
    const id = pathname.split('/')[2]
    const [club, evenements] = await Promise.all([
      backendJson(`/api/clubs/${id}`, req),
      backendJson('/api/evenements', req),
    ])
    initial.clubDetail = {
      id,
      club,
      evenements: normalizeList(evenements).filter(evt => String(evt.club_id) === String(id) && evt.statut === 'valide'),
    }
    return initial
  }

  if (pathname === '/dashboard' && auth) {
    const clubId = auth.club_id
    if (clubId) {
      const [club, evenements, demandes] = await Promise.all([
        backendJson(`/api/clubs/${clubId}`, req),
        backendJson('/api/evenements', req),
        backendJson(`/api/demandes-adhesion?club_id=${clubId}`, req),
      ])
      initial.dashboardAdmin = {
        club,
        evenements: normalizeList(evenements).filter(evt => String(evt.club_id) === String(clubId)),
        demandes: normalizeList(demandes).filter(d => !d.statut || d.statut === 'en_attente'),
      }
    }
    return initial
  }

  if (pathname === '/dashboard-admin' && auth) {
    const [clubs, evenements, actualites, comptes, demandesEvt] = await Promise.all([
      backendJson('/api/clubs', req),
      backendJson('/api/evenements', req),
      backendJson('/api/actualites', req),
      backendJson('/api/utilisateurs', req),
      backendJson('/api/demandes-evenement', req),
    ])
    initial.dashboardSuperAdmin = {
      clubs: normalizeList(clubs),
      evenements: normalizeList(evenements),
      actualites: normalizeList(actualites),
      comptes: normalizeList(comptes).filter(u => u.role !== 'administrateur'),
      demandesEvt: normalizeList(demandesEvt),
    }
    return initial
  }

  return initial
}

async function renderPage(req, res) {
  const templatePath = path.join(clientDistDir, 'index.html')
  const template = await readFile(templatePath, 'utf-8')
  const initialData = await buildInitialData(req)
  const { render } = await import(pathToFileURL(serverBundlePath).href)
  const appHtml = render(req.url, initialData)
  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div><script>window.__INITIAL_DATA__=${escapeJsonForHtml(initialData)}</script>`,
  )

  send(res, 200, { 'Content-Type': 'text/html; charset=utf-8' }, html)
}

async function proxy(req, res, { injectAuth = true, clearAuthCookie = false, rewriteAuthResponse = false } = {}) {
  const target = new URL(req.url, backendUrl)
  const headers = { ...req.headers }
  delete headers.host
  delete headers.connection
  delete headers['content-length']
  delete headers.cookie

  const token = getAuthToken(req)
  if (injectAuth && token && !headers.authorization) {
    headers.authorization = `Bearer ${token}`
  }

  const body = await readRequestBody(req)

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  })

  const responseHeaders = stripHopByHop(upstream.headers)

  if (clearAuthCookie) {
    responseHeaders['Set-Cookie'] = serializeCookie(authCookieName, '', { maxAge: 0 })
  }

  if (rewriteAuthResponse) {
    const contentType = upstream.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const payload = await upstream.text()
      try {
        const data = JSON.parse(payload)
        if (data && typeof data === 'object') {
          const { token: loginToken, ...safeData } = data
          if (typeof loginToken === 'string' && loginToken) {
            responseHeaders['Set-Cookie'] = serializeCookie(authCookieName, loginToken, {
              maxAge: authCookieMaxAge,
            })
          }
          responseHeaders['Content-Type'] = 'application/json; charset=utf-8'
          send(res, upstream.status, responseHeaders, JSON.stringify(safeData))
          return
        }
      } catch {
        // Fall through to raw proxying.
      }
    }
  }

  const responseBody = Buffer.from(await upstream.arrayBuffer())
  res.writeHead(upstream.status, responseHeaders)
  res.end(responseBody)
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/') pathname = '/index.html'

  const filePath = path.join(clientDistDir, pathname)
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = path.extname(filePath)
    const body = await readFile(filePath)
    send(res, 200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }, body)
    return
  }

  const indexPath = path.join(clientDistDir, 'index.html')
  const body = await readFile(indexPath)
  send(res, 200, { 'Content-Type': 'text/html; charset=utf-8' }, body)
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request')
      return
    }

    if (req.url === '/api/login' || req.url === '/api/register') {
      await proxy(req, res, { injectAuth: false, rewriteAuthResponse: true })
      return
    }

    if (req.url === '/api/logout') {
      await proxy(req, res, { clearAuthCookie: true })
      return
    }

    if (req.url.startsWith('/api/') || req.url === '/api' || req.url.startsWith('/storage/')) {
      await proxy(req, res)
      return
    }

    await renderPage(req, res)
  } catch (error) {
    try {
      await serveStatic(req, res)
    } catch {
      send(res, 502, { 'Content-Type': 'text/plain; charset=utf-8' }, `Proxy error: ${error.message}`)
    }
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on ${port}, proxying to ${backendUrl}`)
})
