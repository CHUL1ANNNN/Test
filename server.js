const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 4173;
const USERS_FILE = path.join(__dirname, 'users.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const ensureUsersFile = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]\n', 'utf-8');
  }
};

const readUsers = () => {
  ensureUsersFile();
  const content = fs.readFileSync(USERS_FILE, 'utf-8');
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : [];
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf-8');
};

const normalizePhone = (value = '') => value.replace(/\D/g, '');
const normalizeEmail = (value = '') => value.trim().toLowerCase();

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

const parseRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });

const handleRegister = async (req, res) => {
  const payload = await parseRequestBody(req);
  const email = normalizeEmail(payload.email || '');
  const phone = normalizePhone(payload.phone || '');
  const password = String(payload.password || '');

  if (!email || !phone || !password) {
    sendJson(res, 400, { status: 'error', code: 'EMPTY_FIELDS', message: 'Заполните все поля.' });
    return;
  }

  if (!email.includes('@')) {
    sendJson(res, 400, { status: 'error', code: 'INVALID_EMAIL', message: 'Некорректный email.' });
    return;
  }

  if (phone.length < 10) {
    sendJson(res, 400, { status: 'error', code: 'INVALID_PHONE', message: 'Телефон должен содержать минимум 10 цифр.' });
    return;
  }

  if (password.length < 6) {
    sendJson(res, 400, { status: 'error', code: 'INVALID_PASSWORD', message: 'Пароль должен содержать минимум 6 символов.' });
    return;
  }

  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    sendJson(res, 409, { status: 'error', code: 'EMAIL_TAKEN', message: 'Этот email уже занят.' });
    return;
  }

  if (users.some((user) => user.phone === phone)) {
    sendJson(res, 409, { status: 'error', code: 'PHONE_TAKEN', message: 'Этот телефон уже занят.' });
    return;
  }

  users.push({ id: randomUUID(), email, phone, password });
  writeUsers(users);

  sendJson(res, 201, { status: 'success', code: 'REGISTER_SUCCESS', message: 'Успешная регистрация.' });
};

const handleLogin = async (req, res) => {
  const payload = await parseRequestBody(req);
  const login = String(payload.login || '').trim();
  const normalizedLogin = normalizeEmail(login);
  const normalizedLoginPhone = normalizePhone(login);
  const password = String(payload.password || '');

  if (!login || !password) {
    sendJson(res, 400, { status: 'error', code: 'EMPTY_FIELDS', message: 'Заполните все поля.' });
    return;
  }

  const users = readUsers();
  const user = users.find(
    (item) => item.email === normalizedLogin || item.phone === normalizedLoginPhone,
  );

  if (!user || user.password !== password) {
    sendJson(res, 401, { status: 'error', code: 'INVALID_CREDENTIALS', message: 'Неверные данные для входа.' });
    return;
  }

  sendJson(res, 200, { status: 'success', code: 'LOGIN_SUCCESS', message: 'Успешный вход.' });
};

const serveStatic = (req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = filePath.split('?')[0];
  const safePath = path.normalize(filePath).replace(/^([.][.][/\\])+/, '');
  const resolvedPath = path.join(__dirname, safePath);

  if (!resolvedPath.startsWith(__dirname)) {
    sendJson(res, 403, { status: 'error', code: 'FORBIDDEN' });
    return;
  }

  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(resolvedPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/register') {
      await handleRegister(req, res);
      return;
    }

    if (req.method === 'POST' && req.url === '/login') {
      await handleLogin(req, res);
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { status: 'error', code: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    if (error.message === 'Invalid JSON') {
      sendJson(res, 400, { status: 'error', code: 'INVALID_JSON', message: 'Некорректный JSON.' });
      return;
    }

    sendJson(res, 500, { status: 'error', code: 'SERVER_ERROR', message: 'Внутренняя ошибка сервера.' });
  }
});

ensureUsersFile();
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
