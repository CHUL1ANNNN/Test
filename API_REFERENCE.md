## 📖 API Справочник

Полное описание всех функций и их использования.

---

## 🔐 Функции аутентификации (src/auth.js)

### `signUp(email, password, phone = null)`

**Описание:** Регистрирует нового пользователя в Supabase Auth.

**Параметры:**
- `email` (string) — электронная почта (обязательно)
- `password` (string) — пароль (минимум 6 символов, обязательно)
- `phone` (string | null) — телефон (опционально)

**Возвращает:**
```javascript
{
  data: {
    user: { id, email, user_metadata: { phone }, ... },
    session: { access_token, ... }
  },
  error: null
}
```

**Выбрасывает:**
- Ошибка если email уже существует
- Ошибка если password < 6 символов
- Ошибка сети Supabase

**Пример:**
```javascript
try {
  const data = await signUp('user@example.com', 'password123', '+79991234567')
  console.log('Пользователь создан:', data.user.email)
} catch (error) {
  console.error('Ошибка регистрации:', error.message)
}
```

**Что происходит в Supabase:**
1. Создаётся новая запись в `auth.users`
2. Пароль хешируется
3. Телефон сохраняется в `user_metadata.phone`

---

### `signIn(email, password)`

**Описание:** Вход в аккаунт по email и пароля.

**Параметры:**
- `email` (string) — электронная почта (обязательно)
- `password` (string) — пароль (обязательно)

**Возвращает:**
```javascript
{
  data: {
    user: { id, email, user_metadata, ... },
    session: { access_token, refresh_token, ... }
  },
  error: null
}
```

**Выбрасывает:**
- Ошибка если email не существует
- Ошибка если пароль неверный
- Ошибка если email нужно подтвердить (зависит от настроек Supabase)

**Пример:**
```javascript
try {
  await signIn('user@example.com', 'password123')
  console.log('Вы вошли в систему')
} catch (error) {
  console.error('Неверные учётные данные')
}
```

**Что происходит в Supabase:**
1. Проверяется email
2. Проверяется пароль
3. Создаётся новая сессия (JWT токен)
4. Токен сохраняется локально в `localStorage`

---

### `signOut()`

**Описание:** Выход из текущей сессии.

**Параметры:** нет

**Возвращает:** Promise (тихий выход)

**Выбрасывает:**
- Ошибка сети (редко)

**Пример:**
```javascript
try {
  await signOut()
  console.log('Вы вышли из системы')
} catch (error) {
  console.error('Ошибка выхода:', error.message)
}
```

**Что происходит в Supabase:**
1. Текущая сессия аннулируется
2. JWT токен удаляется из `localStorage`
3. Пользователь становится "неавторизованным"

---

### `getUser()`

**Описание:** Получить текущего авторизованного пользователя.

**Параметры:** нет

**Возвращает:**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  user_metadata: {
    phone: "+79991234567",  // Если был задан при регистрации
    // Другие поля, заданные вами
  },
  app_metadata: { ... },
  created_at: "2026-02-05...",
  updated_at: "2026-02-05...",
  // ... Другие поля
}
// Или null если не авторизован
```

**Выбрасывает:**
- Ошибка если сессия истекла или нарушена

**Пример:**
```javascript
const user = await getUser()
if (user) {
  console.log(`Привет, ${user.email}!`)
  console.log(`Телефон: ${user.user_metadata.phone}`)
} else {
  console.log('Вы не авторизованы')
}
```

**Используется в:**
- Проверка авторизации
- Отображение информации о пользователе
- Определение, какой экран показывать

---

### `getSession()`

**Описание:** Получить текущую активную сессию (JWT).

**Параметры:** нет

**Возвращает:**
```javascript
{
  access_token: "eyJhbGci...",  // JWT токен
  refresh_token: "...",
  expires_in: 3600,            // Секунд до истечения
  token_type: "bearer",
  user: { ... }                // То же, что в getUser()
}
// Или null если нет сессии
```

**Выбрасывает:**
- Ошибка сети редко

**Пример:**
```javascript
const session = await getSession()
if (session) {
  console.log('Действующая сессия:', session.access_token.substring(0, 20) + '...')
  console.log('Истечёт через:', session.expires_in, 'секунд')
} else {
  console.log('Нет активной сессии')
}
```

**Используется в:**
- Проверка наличия активной сессии
- Получение JWT для API запросов (если будет бэкенд)

---

### `onAuthStateChange(callback)`

**Описание:** Подписаться на изменения состояния аутентификации.

**Параметры:**
- `callback` (function) — функция, вызываемая при изменениях

**Сигнатура callback:**
```javascript
callback({
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
  session: { ... } | null,
  user: { ... } | null
})
```

**Возвращает:**
```javascript
{
  subscription: {
    unsubscribe: () => void  // Функция отписки
  }
}
```

**Пример:**
```javascript
onAuthStateChange(({ event, session, user }) => {
  if (event === 'SIGNED_IN') {
    console.log('Пользователь вошёл:', user.email)
    showWelcomePage()
  } else if (event === 'SIGNED_OUT') {
    console.log('Пользователь вышел')
    showLoginPage()
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Токен обновлен')
  }
})
```

**События:**
| События | Когда | Данные |
|---------|-------|--------|
| `SIGNED_IN` | После успешного входа (signIn/signUp) | user, session |
| `SIGNED_OUT` | После выхода (signOut) | user=null, session=null |
| `TOKEN_REFRESHED` | Токен автоматически обновлён | user, session (новые) |
| `USER_UPDATED` | Профиль пользователя обновлён | user |

**Используется в:**
- Обновление UI при входе/выходе
- Синхронизация состояния между вкладками браузера
- Проверка валидности сессии

---

## 🌐 Функции Supabase клиента (src/supabaseClient.js)

### `supabase` (объект)

**Описание:** Инициализированный клиент Supabase.

**Свойства:**
- `supabase.auth` — API аутентификации
- `supabase.from(tableName)` — доступ к таблицам (если добавим)

**Пример:**
```javascript
import { supabase } from './src/supabaseClient.js'

const { data, error } = await supabase.auth.getUser()
```

---

### `supabasePromise` (Promise)

**Описание:** Promise, который резолвится после инициализации Supabase.

**Используется в:**
```javascript
// В app.js ждём загрузки Supabase перед началом
await supabasePromise
```

---

## 📝 Примеры использования

### Полный цикл регистрация → вход → выход

```javascript
import { signUp, signIn, signOut, getUser, onAuthStateChange } from './src/auth.js'

// 1. Регистрация
await signUp('new@example.com', 'password123', '+79991234567')
// → Пользователь создан в Supabase

// 2. Вход
await signIn('new@example.com', 'password123')
// → Создана сессия, JWT в localStorage

// 3. Получить текущего пользователя
const user = await getUser()
console.log(user.email)  // → "new@example.com"
console.log(user.user_metadata.phone)  // → "+79991234567"

// 4. Слушать изменения
onAuthStateChange(({ event, user }) => {
  if (event === 'SIGNED_IN') {
    document.getElementById('email').textContent = user.email
  }
})

// 5. Выход
await signOut()
// → Сессия удалена, пользователь не авторизован
```

---

### Проверка авторизации

```javascript
const user = await getUser()

if (user) {
  // Пользователь авторизован
  showUserProfile(user.email)
} else {
  // Пользователь не авторизован
  showLoginForm()
}
```

---

### Синхронизация с UI

```javascript
onAuthStateChange(({ event, user }) => {
  // Это вызовется:
  // 1. При загрузке страницы (текущее состояние)
  // 2. При входе (SIGNED_IN)
  // 3. При выходе (SIGNED_OUT)
  // 4. При обновлении токена (TOKEN_REFRESHED)

  if (user) {
    // Показать профиль и кнопку выхода
    document.getElementById('status-screen').classList.remove('hidden')
    document.getElementById('login-screen').classList.add('hidden')
    document.getElementById('status-email').textContent = user.email
  } else {
    // Показать форму входа
    document.getElementById('login-screen').classList.remove('hidden')
    document.getElementById('status-screen').classList.add('hidden')
  }
})
```

---

### Обработка ошибок

```javascript
try {
  await signUp('test@example.com', 'password123')
} catch (error) {
  // error.message может быть:
  // "User already registered"
  // "Password should be minimum 6 characters"
  // "Unable to validate email address"
  console.error(`Ошибка: ${error.message}`)
  
  // Показать ошибку пользователю
  document.getElementById('error').textContent = error.message
}
```

---

## ⚙️ Конфиги и переменные

### config.js

```javascript
export const SUPABASE_URL = 'https://project.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Где взять?**
1. https://supabase.com → ваш проект
2. Settings → API
3. Project URL → `SUPABASE_URL`
4. anon public → `SUPABASE_ANON_KEY`

---

## 🔍 Отладка

### Посмотреть текущую сессию в консоли браузера

```javascript
const session = await getSession()
console.log(session)
```

### Посмотреть текущего пользователя

```javascript
const user = await getUser()
console.log(user)
```

### Посмотреть localStorage

```javascript
// В консоли браузера (F12)
localStorage.getItem('supabase.auth.token')
```

### Очистить сессию (для теста)

```javascript
// В консоли браузера
localStorage.removeItem('supabase.auth.token')
await signOut()
location.reload()
```

---

## 🚨 Ошибки и их решение

| Ошибка | Причина | Решение |
|--------|--------|--------|
| "User already registered" | Email уже зарегистрирован | Используйте другой email |
| "Invalid login credentials" | Email/пароль неверны | Проверьте email и пароль |
| "Password should be minimum 6 characters" | Пароль < 6 символов | Используйте пароль длиннее |
| "Unable to validate email address" | Email неверный | Используйте валидный email |
| "Cannot read property 'createClient'" | CDN не загрузился | Перезагрузите страницу |

---

## 📱 Типы данных

### User объект

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  email: "user@example.com",
  email_confirmed_at: "2026-02-05T12:34:56Z",
  phone: "+79991234567",
  confirmed_at: "2026-02-05T12:34:56Z",
  last_sign_in_at: "2026-02-05T14:30:00Z",
  app_metadata: { ... },
  user_metadata: {
    phone: "+79991234567",  // Из signUp options.data
    // Другие поля
  },
  identities: [ ... ],
  created_at: "2026-02-05T12:34:56Z",
  updated_at: "2026-02-05T14:30:00Z"
}
```

### Session объект

```javascript
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "...",
  user: { ... }  // User объект выше
}
```

---

**Это всё, что нужно для работы с аутентификацией через Supabase!** 🔐
