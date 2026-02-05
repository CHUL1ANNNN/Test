## 📚 Описание компонентов проекта

Подробное описание каждого файла и его роль в системе.

---

## 📄 Основные файлы

### `config.js` ⚙️ КОНФИГ
```javascript
export const SUPABASE_URL = '...'
export const SUPABASE_ANON_KEY = '...'
```

**Роль:** Хранит ключи подключения к Supabase.

**Почему?** 
- Anon Key безопасна для фронтенда (ограничена RLS)
- Отделена от кода для удобства конфигурации

**Использует:**
- `src/supabaseClient.js` (импортирует ключи)

---

### `src/supabaseClient.js` 🌐 ИНИЦИАЛИЗАЦИЯ КЛИЕНТА
```javascript
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js'

function waitForSupabase() { ... }
export const supabasePromise = initSupabase()
export let supabase
```

**Роль:** Создаёт Supabase клиента из CDN.

**Что делает?**
1. Ждёт загрузки `window.supabase` из CDN
2. Создаёт клиента: `createClient(URL, KEY)`
3. Экспортирует `supabasePromise` для ожидания в app.js
4. Экспортирует `supabase` для использования в auth.js

**Почему асинхронно?**
- CDN скрипт может загружаться после импорта модуля
- Нужно ждать `window.supabase` перед `createClient()`

**Использует:**
- config.js (ключи)
- index.html (CDN скрипт)

**Используют:**
- auth.js (использует `supabase`)
- app.js (ждёт `supabasePromise`)

---

### `src/auth.js` 🔐 ФУНКЦИИ АУТЕНТИФИКАЦИИ
```javascript
export async function signUp(email, password, phone = null)
export async function signIn(email, password)
export async function signOut()
export async function getUser()
export async function getSession()
export function onAuthStateChange(callback)
```

**Роль:** Вся логика работы с Supabase Auth.

**Функции:**

| Функция | Что делает | Для чего |
|---------|-----------|---------|
| `signUp(email, password, phone)` | Регистрирует нового пользователя | Форма регистрации |
| `signIn(email, password)` | Вход в аккаунт | Форма входа |
| `signOut()` | Выход из аккаунта | Кнопка "Выйти" |
| `getUser()` | Получить текущего юзера | Показ email в UI |
| `getSession()` | Получить JWT сессию | Проверка авторизации |
| `onAuthStateChange()` | Слушать изменения | Обновление UI |

**Особенности:**
- Не работает с таблицей `profiles`
- Пароли не сохраняются (только в Supabase Auth)
- Все ошибки выбрасываются как исключения

**Использует:**
- supabaseClient.js (клиент)

**Используют:**
- app.js (вызывает все функции)

---

### `app.js` 🎮 ОСНОВНАЯ ЛОГИКА UI
```javascript
// 1. Импорты
import { signUp, signIn, signOut, getUser, onAuthStateChange } from './src/auth.js'
import { supabasePromise } from './src/supabaseClient.js'

// 2. Ждём инициализации
await supabasePromise

// 3. Работа с DOM элементами
const registerForm = document.getElementById('register-form')
const loginForm = document.getElementById('login-form')

// 4. Обработчики событий
registerForm.addEventListener('submit', async (e) => { ... })

// 5. Слушание изменений авторизации
onAuthStateChange(() => updateAuthStatus())
```

**Роль:** Приложение, которое связывает UI и функции аутентификации.

**Что делает?**

1. **Инициализация:**
   - Импортирует функции из auth.js
   - Ждёт загрузки Supabase (supabasePromise)

2. **Работа с DOM:**
   - Получает все элементы формы и кнопок
   - Вешает обработчики на события

3. **Обработка форм:**
   - Форма регистрации → signUp()
   - Форма входа → signIn()
   - Кнопка выхода → signOut()

4. **Обновление UI:**
   - showScreen() — переключает между экранами
   - showMessage() — показывает ошибки/успех
   - updateAuthStatus() — показывает текущего пользователя

5. **Слушание изменений:**
   - onAuthStateChange() обновляет UI при входе/выходе

**Используемые функции:**

```javascript
// Из auth.js
signUp, signIn, signOut, getUser, onAuthStateChange

// Свои
showScreen()     // Показать экран
showMessage()    // Показать сообщение
clearMessages()  // Очистить сообщения
updateAuthStatus() // Обновить статус пользователя
```

**Используют:**
- index.html (DOM элементы)
- src/auth.js (функции аутентификации)
- src/supabaseClient.js (промис инициализации)

---

## 🎨 UI Файлы

### `index.html` 🏠 СТРАНИЦА

**Структура:**

```html
<html>
  <head>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- 3 экрана -->
    <section id="register-screen">...</section>  <!-- Форма регистрации -->
    <section id="login-screen">...</section>     <!-- Форма входа -->
    <section id="status-screen">...</section>    <!-- Статус пользователя -->
    
    <!-- CDN Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Приложение -->
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

**Элементы:**

| ID | Тип | Роль |
|----|-----|------|
| `register-screen` | Section | Экран регистрации |
| `register-form` | Form | Форма регистрации |
| `register-email` | Input | Email для регистрации |
| `register-password` | Input | Пароль для регистрации |
| `register-phone` | Input | Телефон (опционально) |
| `register-message` | P | Сообщение об ошибке/успехе |
| `go-login` | Button | Перейти на вход |
| `login-screen` | Section | Экран входа |
| `login-form` | Form | Форма входа |
| `login-email` | Input | Email для входа |
| `login-password` | Input | Пароль для входа |
| `login-message` | P | Сообщение об ошибке/успехе |
| `go-register` | Button | Перейти на регистрацию |
| `status-screen` | Section | Экран статуса |
| `status-email` | P | Email пользователя |
| `logout-btn` | Button | Кнопка выхода |

---

### `styles.css` 🎨 СТИЛИ

**Основные классы:**

```css
.app-shell        /* Контейнер приложения */
.screen           /* Экран (видимый или скрытый) */
.hidden           /* Скрыть элемент */
.message          /* Сообщение об ошибке/успехе */
.message.error    /* Красное сообщение об ошибке */
.message.success  /* Зелёное сообщение об успехе */
.status-info      /* Блок информации о пользователе */
.link-btn         /* Кнопка-ссылка */
```

**Используются в:**
- app.js (showScreen, showMessage, showScreen)
- index.html (классы элементов)

---

## 🖥️ Локальная разработка

### `server.js` 🖥️ ЛОКАЛЬНЫЙ СЕРВЕР
```javascript
http.createServer((req, res) => {
  // Читает файлы из корня проекта
  // Сервирует на http://localhost:4173
})
```

**Роль:** Запуск приложения локально для разработки.

**Используется в:**
- `npm start`

**Не используется на:**
- Vercel (встроенный статический хостинг)

---

### `package.json` 📦 NPM КОНФИГ

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**Роль:** Конфигурация проекта и скрипты.

**Особенности:**
- Никаких npm зависимостей (Supabase через CDN)
- Только `server.js` для локальной разработки

---

## ☁️ Деплой

### `vercel.json` ☁️ КОНФИГ VERCEL

```json
{
  "buildCommand": "echo 'Static site - no build needed'",
  "outputDirectory": "."
}
```

**Роль:** Сообщить Vercel, что это статический сайт.

**Особенности:**
- Никаких build команд
- outputDirectory = "." (весь проект как есть)

---

## 📖 Документация

### `README.md` 📌 ГЛАВНАЯ ИНСТРУКЦИЯ
Краткое описание проекта и как запустить.

### `SETUP.md` 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ
Подробная инструкция:
- Быстрый старт
- Как работает
- Деплой на Vercel
- FAQ

### `TESTING_CHECKLIST.md` ✅ ЧЕК-ЛИСТ
Шаги для проверки, что всё работает.

### `IMPLEMENTATION_SUMMARY.md` 📋 РЕЗЮМЕ РЕАЛИЗАЦИИ
Что было реализовано и почему.

### `COMPONENTS.md` 📚 ОПИСАНИЕ КОМПОНЕНТОВ
Этот файл — описание каждого компонента.

---

## 🔄 Поток данных

```
┌──────────────────────────────────────────────────────────────────┐
│ ПОЛЬЗОВАТЕЛЬ кликает форму Регистрация                           │
└────────────────────┬─────────────────────────────────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ app.js обработчик submit       │
        │ registerForm.addEventListener  │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ signUp(email, password, phone) │  (из auth.js)
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────────────────────────┐
        │ supabase.auth.signUp({email, password, ...})      │
        │ (используя клиента из supabaseClient.js)          │
        └────────────┬──────────────────────────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Supabase Auth обрабатывает    │
        │ (создаёт пользователя)        │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Return data или error          │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ showMessage() показывает ответ │
        │ updateAuthStatus() обновляет UI│
        └────────────┬──────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ ПОЛЬЗОВАТЕЛЬ видит результат   │
        └────────────────────────────────┘
```

---

## 🔗 Зависимости между файлами

```
┌─────────────────┐
│   index.html    │  ◄── Подключает scripts + styles
└────────┬────────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
┌──────────────┐             ┌────────────────┐
│  styles.css  │             │  CDN Supabase  │
│              │             │ (window.supabase)
└──────────────┘             └────────┬───────┘
                                      │
                  ┌───────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │   app.js (type=  │
         │    module)       │
         └────────┬─────────┘
                  │
        ┌─────────┴──────────────┐
        │                        │
        ▼                        ▼
   ┌──────────────┐        ┌──────────────┐
   │  src/auth.js │        │  src/        │
   │              │        │  supabase    │
   └──────┬───────┘        │  Client.js   │
          │                └────────┬─────┘
          │                         │
          └──────────────┬──────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ config.js   │
                  │  (ключи)    │
                  └─────────────┘
```

---

## 🎯 Вызовы функций

```
User Actions          JavaScript           Supabase API
────────────────────────────────────────────────────────

Нажать "Зарегистр"    form submit ──►     signUp()
                      event handler │
                      app.js        └──►   supabase.auth.signUp
                                          │
                                   ◄──────┘
                                   
Нажать "Войти"        form submit ──►     signIn()
                      event handler │
                      app.js        └──►   supabase.auth.signInWithPassword
                                          │
                                   ◄──────┘

Нажать "Выйти"        click event ──►     signOut()
                      event handler │
                      app.js        └──►   supabase.auth.signOut
                                          │
                                   ◄──────┘

Загрузка страницы     onAuthStateChange─► supabase.auth.onAuthStateChange
                      app.js        │
                      listen        └──►  слушает события
```

---

## 💾 Где хранятся данные

| Данные | Где? | Персистентность | Видимость |
|--------|------|-----------------|-----------|
| Email | Supabase Auth | 🔒 Зашифровано | ✅ После входа |
| Пароль | Supabase Auth | 🔒 Хеш, не видим | ❌ Никогда |
| Сессия JWT | localStorage | 📝 Текст | ✅ DevTools |
| Метаданные (phone) | Supabase Auth | 📝 JSON | ✅ user.user_metadata |
| Ошибки в UI | DOM | 📝 Временно | ✅ Видимы |

---

## ✅ Проверка интеграции

```bash
# Структура правильна?
ls -la config.js src/auth.js src/supabaseClient.js app.js

# Импорты верные?
grep -n "import.*auth.js" app.js
grep -n "import.*config.js" src/supabaseClient.js

# CDN подключен?
grep -n "supabase-js" index.html

# Модули загружаются?
npm start  # Проверить console в браузере
```

---

**Все компоненты работают вместе, чтобы создать простую, но мощную систему аутентификации без бэкенда!** 🚀
