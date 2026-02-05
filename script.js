const registerScreen = document.getElementById('register-screen');
const loginScreen = document.getElementById('login-screen');
const welcomeScreen = document.getElementById('welcome-screen');

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

const registerMessage = document.getElementById('register-message');
const loginMessage = document.getElementById('login-message');

const setMessage = (element, text, type) => {
  element.textContent = text;
  element.classList.remove('error', 'success');
  if (type) {
    element.classList.add(type);
  }
};

const normalizePhone = (value) => value.replace(/\D/g, '');
const validateEmail = (email) => email.includes('@');

const showScreen = (name) => {
  registerScreen.classList.toggle('hidden', name !== 'register');
  loginScreen.classList.toggle('hidden', name !== 'login');
  welcomeScreen.classList.toggle('hidden', name !== 'welcome');

  if (name !== 'register') {
    setMessage(registerMessage, '', null);
  }

  if (name !== 'login') {
    setMessage(loginMessage, '', null);
  }
};

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('register-email').value.trim();
  const phoneRaw = document.getElementById('register-phone').value.trim();
  const phone = normalizePhone(phoneRaw);
  const password = document.getElementById('register-password').value;

  if (!email || !phoneRaw || !password) {
    setMessage(registerMessage, 'Заполните все поля.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    setMessage(registerMessage, 'Некорректный email (должен содержать @).', 'error');
    return;
  }

  if (phone.length < 10) {
    setMessage(registerMessage, 'Телефон должен содержать минимум 10 цифр.', 'error');
    return;
  }

  if (password.length < 6) {
    setMessage(registerMessage, 'Пароль должен содержать минимум 6 символов.', 'error');
    return;
  }

  try {
    const result = await postJson('/register', { email, phone: phoneRaw, password });

    if (!result.ok) {
      if (result.data.code === 'EMAIL_TAKEN') {
        setMessage(registerMessage, 'Этот email уже занят.', 'error');
        return;
      }

      if (result.data.code === 'PHONE_TAKEN') {
        setMessage(registerMessage, 'Этот телефон уже занят.', 'error');
        return;
      }

      setMessage(registerMessage, result.data.message || 'Ошибка регистрации.', 'error');
      return;
    }

    setMessage(registerMessage, 'Успешная регистрация! Теперь можно войти.', 'success');
    registerForm.reset();
    setTimeout(() => showScreen('login'), 400);
  } catch {
    setMessage(registerMessage, 'Сервер недоступен. Попробуйте позже.', 'error');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const login = document.getElementById('login-identity').value.trim();
  const password = document.getElementById('login-password').value;

  if (!login || !password) {
    setMessage(loginMessage, 'Заполните все поля.', 'error');
    return;
  }

  if (password.length < 6) {
    setMessage(loginMessage, 'Пароль должен содержать минимум 6 символов.', 'error');
    return;
  }

  try {
    const result = await postJson('/login', { login, password });

    if (!result.ok) {
      if (result.data.code === 'INVALID_CREDENTIALS') {
        setMessage(loginMessage, 'Неверные данные для входа.', 'error');
        return;
      }

      setMessage(loginMessage, result.data.message || 'Ошибка входа.', 'error');
      return;
    }

    setMessage(loginMessage, 'Успешный вход!', 'success');
    loginForm.reset();
    showScreen('welcome');
  } catch {
    setMessage(loginMessage, 'Сервер недоступен. Попробуйте позже.', 'error');
  }
});

document.getElementById('go-login').addEventListener('click', () => showScreen('login'));
document.getElementById('go-register').addEventListener('click', () => showScreen('register'));
document.getElementById('logout').addEventListener('click', () => showScreen('login'));
