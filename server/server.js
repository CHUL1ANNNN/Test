const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed creating data dir', e);
  }
}

async function loadUsers() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

async function saveUsers(users) {
  await ensureDataDir();
  const tmpPath = USERS_FILE + '.tmp';
  const data = JSON.stringify(users, null, 2);
  await fs.writeFile(tmpPath, data, 'utf8');
  await fs.rename(tmpPath, USERS_FILE);
}

function nextId(users) {
  if (!users.length) return 1;
  return users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
}

app.post('/api/register', async (req, res) => {
  const { email, phone, password } = req.body || {};
  if (!email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'missing_fields' });
  }

  try {
    const users = await loadUsers();

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, error: 'email_taken' });
    }
    if (users.find(u => u.phone === phone)) {
      return res.status(409).json({ success: false, error: 'phone_taken' });
    }

    const user = {
      id: nextId(users),
      email,
      phone,
      password // demo only
    };
    users.push(user);
    await saveUsers(users);

    return res.json({ success: true, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) {
    return res.status(400).json({ success: false, error: 'missing_fields' });
  }

  try {
    const users = await loadUsers();
    const user = users.find(u => u.email === login || u.phone === login);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'invalid_credentials' });
    }
    return res.json({ success: true, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});