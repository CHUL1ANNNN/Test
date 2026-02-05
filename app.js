import {
  signUp,
  signIn,
  signOut,
  getUser,
  onAuthStateChange
} from './src/auth.js'
import { supabasePromise } from './src/supabaseClient.js'

// Ждём инициализации supabase перед началом работы
await supabasePromise

// ========================
// DOM элементы
// ========================

// Экраны
const registerScreen = document.getElementById('register-screen')
const loginScreen = document.getElementById('login-screen')
const statusScreen = document.getElementById('status-screen')

// Форма регистрации
const registerForm = document.getElementById('register-form')
const registerEmail = document.getElementById('register-email')
const registerPassword = document.getElementById('register-password')
const registerPhone = document.getElementById('register-phone')
const registerMessage = document.getElementById('register-message')

// Форма входа
const loginForm = document.getElementById('login-form')
const loginEmail = document.getElementById('login-email')
const loginPassword = document.getElementById('login-password')
const loginMessage = document.getElementById('login-message')

// Статус и выход
const statusEmail = document.getElementById('status-email')
const logoutBtn = document.getElementById('logout-btn')

// Кнопки переключения экранов
const goLoginBtn = document.getElementById('go-login')
const goRegisterBtn = document.getElementById('go-register')

// ========================
// Функции UI
// ========================

function showScreen(screen) {
  registerScreen.classList.add('hidden')
  loginScreen.classList.add('hidden')
  statusScreen.classList.add('hidden')
  
  if (screen) {
    screen.classList.remove('hidden')
  }
}

function showMessage(messageElement, text, isError = false) {
  messageElement.textContent = text
  messageElement.className = isError ? 'message error' : 'message success'
  messageElement.style.display = text ? 'block' : 'none'
}

function clearMessages() {
  showMessage(registerMessage, '')
  showMessage(loginMessage, '')
}

// ========================
// Обновление статуса
// ========================

async function updateAuthStatus() {
  try {
    const user = await getUser()
    
    if (user) {
      // Пользователь авторизован
      statusEmail.textContent = user.email
      showScreen(statusScreen)
    } else {
      // Пользователь не авторизован
      clearMessages()
      showScreen(registerScreen)
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса:', error)
    showScreen(registerScreen)
  }
}

// ========================
// Обработчики событий
// ========================

// Регистрация
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = registerEmail.value.trim()
  const password = registerPassword.value.trim()
  const phone = registerPhone.value.trim()
  
  if (!email || !password) {
    showMessage(registerMessage, 'Email и пароль обязательны', true)
    return
  }
  
  try {
    showMessage(registerMessage, 'Регистрация...')
    await signUp(email, password, phone || null)
    showMessage(registerMessage, 'Регистрация успешна! Проверьте email для подтверждения или войдите.')
    registerForm.reset()
    
    // Пытаемся получить пользователя (если email confirmation отключен)
    setTimeout(() => updateAuthStatus(), 1000)
  } catch (error) {
    showMessage(registerMessage, `Ошибка: ${error.message}`, true)
    console.error('Ошибка регистрации:', error)
  }
})

// Вход
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = loginEmail.value.trim()
  const password = loginPassword.value.trim()
  
  if (!email || !password) {
    showMessage(loginMessage, 'Email и пароль обязательны', true)
    return
  }
  
  try {
    showMessage(loginMessage, 'Вход...')
    await signIn(email, password)
    showMessage(loginMessage, 'Вход выполнен успешно!')
    loginForm.reset()
    
    // Обновляем статус и показываем экран статуса
    setTimeout(() => updateAuthStatus(), 500)
  } catch (error) {
    showMessage(loginMessage, `Ошибка: ${error.message}`, true)
    console.error('Ошибка входа:', error)
  }
})

// Выход
logoutBtn.addEventListener('click', async () => {
  try {
    logoutBtn.disabled = true
    await signOut()
    updateAuthStatus()
  } catch (error) {
    console.error('Ошибка выхода:', error)
    alert(`Ошибка выхода: ${error.message}`)
  } finally {
    logoutBtn.disabled = false
  }
})

// Переключение на форму входа
goLoginBtn.addEventListener('click', () => {
  clearMessages()
  registerForm.reset()
  showScreen(loginScreen)
})

// Переключение на форму регистрации
goRegisterBtn.addEventListener('click', () => {
  clearMessages()
  loginForm.reset()
  showScreen(registerScreen)
})

// ========================
// Инициализация
// ========================

// Подписываемся на изменения состояния аутентификации
onAuthStateChange(() => {
  updateAuthStatus()
})

// Проверяем начальное состояние
updateAuthStatus()
