# Simple Auth UI (branch: feature/simple-auth-ui)

How to run
1. Switch to branch:
   git fetch origin
   git checkout feature/simple-auth-ui

2. Install and start:
   npm install
   npm start

3. Open in browser:
   http://localhost:3000
   - Register: http://localhost:3000/#/register
   - Login: http://localhost:3000/#/login
   - Welcome: http://localhost:3000/#/welcome

Manual test (Register → Login → Welcome)
1. Откройте /#/register и зарегистрируйте новый аккаунт:
   - Email (с @), Phone (10+ цифр), Password (6+ символов)
   - Должно появиться сообщение об успехе и перенаправление на /#/login
2. Попробуйте зарегистрироваться тем же email (другой phone) — должно показать «Email занят»
3. Перейдите на /#/login и войдите корректными данными — попадёте на /#/welcome
4. Попробуйте войти с неверным паролем — увидите «Неверные данные»

Notes / Limitations
- Пароли сохраняются в plaintext в server/data/users.json исключительно для демонстрации.
- Не реализована настоящая сессия/токены/хэширование/проверка email и т.д.
