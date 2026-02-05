const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 4173
const ROOT_DIR = path.join(__dirname)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  // Парсим URL и убираем query string
  let pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname)

  // Убираем trailing slash, но оставляем root
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  // Если корень, сервируем index.html
  if (pathname === '/') {
    pathname = '/index.html'
  }

  let filePath = path.join(ROOT_DIR, pathname)

  // Защита от path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('403 Forbidden')
    return
  }

  // Проверяем существование файла
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    serveFile(filePath, res)
  })
})

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  res.setHeader('Cache-Control', 'public, max-age=3600')

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('500 Internal Server Error')
      return
    }

    res.writeHead(200, { 'Content-Type': mimeType })
    res.end(data)
  })
}

server.listen(PORT, () => {
  console.log(`📡 Сервер запущен на http://localhost:${PORT}`)
  console.log(`📁 Сервирует файлы из: ${ROOT_DIR}`)
})

server.on('error', (err) => {
  console.error('Ошибка сервера:', err)
  process.exit(1)
})
