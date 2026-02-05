import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js'

// Ждём загрузки Supabase из CDN
function waitForSupabase() {
  return new Promise((resolve) => {
    if (window.supabase) {
      resolve(window.supabase)
    } else {
      const checkInterval = setInterval(() => {
        if (window.supabase) {
          clearInterval(checkInterval)
          resolve(window.supabase)
        }
      }, 10)
    }
  })
}

// Инициализируем клиента при импорте
let supabaseInstance

async function initSupabase() {
  const supabaseModule = await waitForSupabase()
  return supabaseModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Promise для синхронного доступа (работает в async контексте)
export const supabasePromise = initSupabase()

// Синхронный экспорт (для совместимости)
export let supabase

// Инициализируем сразу
initSupabase().then((client) => {
  supabase = client
})
