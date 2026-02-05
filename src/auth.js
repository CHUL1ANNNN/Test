import { supabase } from './supabaseClient.js'

// Регистрация: email + password + опциональный phone
export async function signUp(email, password, phone = null) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        phone: phone || undefined
      }
    }
  })

  if (error) throw error
  return data
}

// Вход по email и password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

// Выход из аккаунта
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Получить текущую сессию
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Получить текущего пользователя
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Подписаться на изменения состояния аутентификации
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback({ event, session, user: session?.user || null })
  })
}
