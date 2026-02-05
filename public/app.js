// Simple SPA for Register / Login / Welcome

function qs(selector, root=document) { return root.querySelector(selector); }
function el(tag, attrs={}, children=[]) { const e = document.createElement(tag); for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'onclick') e.onclick = attrs[k]; else e.setAttribute(k, attrs[k]); } (Array.isArray(children)?children:[children]).forEach(c => { if (typeof c === 'string') e.appendChild(document.createTextNode(c)); else if (c) e.appendChild(c); }); return e }

const appRoot = qs('#app');

function setRoute(route) { location.hash = route; }

function renderRegister() {
  appRoot.innerHTML = '';
  const c = el('div', {class:'container'});
  c.appendChild(el('h1', {}, 'Регистрация'));
  const msg = el('div', {id:'message'});
  c.appendChild(msg);

  const emailField = el('div', {class:'field'}, [ el('label', {}, 'Email'), el('input', {id:'email', type:'email'}) ]);
  const phoneField = el('div', {class:'field'}, [ el('label', {}, 'Телефон'), el('input', {id:'phone', type:'tel'}) ]);
  const passField = el('div', {class:'field'}, [ el('label', {}, 'Пароль'), el('input', {id:'password', type:'password'}) ]);
  c.appendChild(emailField); c.appendChild(phoneField); c.appendChild(passField);

  const btn = el('button', {class:'button'}, 'Зарегистрироваться');
  btn.addEventListener('click', async () => {
    msg.innerHTML = '';
    const email = qs('#email', c).value.trim();
    const phone = qs('#phone', c).value.trim();
    const password = qs('#password', c).value;
    const errors = [];
    if (!email) errors.push('Email не может быть пустым');
    else if (!email.includes('@')) errors.push('Email должен содержать @');
    if (!phone) errors.push('Телефон не может быть пустым');
    else if (phone.replace(/\D/g,'').length < 10) errors.push('Телефон должен содержать минимум 10 цифр');
    if (!password) errors.push('Пароль не может быть пустым');
    else if (password.length < 6) errors.push('Пароль минимум 6 символов');
    if (errors.length) { errors.forEach(e => msg.appendChild(el('div',{class:'error'}, e))); return; }

    try {
      const res = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, phone, password }) });
      const body = await res.json();
      if (!res.ok) {
        msg.innerHTML = '';
        if (body.error === 'email_taken') msg.appendChild(el('div',{class:'error'}, 'Email занят'));
        else if (body.error === 'phone_taken') msg.appendChild(el('div',{class:'error'}, 'Телефон занят'));
        else msg.appendChild(el('div',{class:'error'}, 'Ошибка регистрации'));
        return;
      }
      msg.innerHTML = ''; msg.appendChild(el('div',{class:'success'}, 'Успешно зарегистрированы'));
      setTimeout(() => setRoute('/login'), 900);
    } catch (e) {
      msg.innerHTML = ''; msg.appendChild(el('div',{class:'error'}, 'Ошибка сети'));
    }
  });

  const switchLink = el('div', {class:'small'}, [ el('span', {}, 'Уже есть аккаунт? '), el('span', {class:'link', onclick:()=>setRoute('/login')}, 'Войти') ]);
  c.appendChild(btn); c.appendChild(el('div', {style:'height:10px'})); c.appendChild(switchLink);
  appRoot.appendChild(c);
}

function renderLogin() {
  appRoot.innerHTML = '';
  const c = el('div', {class:'container'});
  c.appendChild(el('h1', {}, 'Вход'));
  const msg = el('div', {id:'message'});
  c.appendChild(msg);

  const loginField = el('div', {class:'field'}, [ el('label', {}, 'Email или телефон'), el('input', {id:'login', type:'text'}) ]);
  const passField = el('div', {class:'field'}, [ el('label', {}, 'Пароль'), el('input', {id:'password', type:'password'}) ]);
  c.appendChild(loginField); c.appendChild(passField);

  const btn = el('button', {class:'button'}, 'Войти');
  btn.addEventListener('click', async () => {
    msg.innerHTML = '';
    const login = qs('#login', c).value.trim();
    const password = qs('#password', c).value;
    const errors = [];
    if (!login) errors.push('Email или телефон не может быть пустым');
    if (!password) errors.push('Пароль не может быть пустым');
    if (errors.length) { errors.forEach(e => msg.appendChild(el('div',{class:'error'}, e))); return; }

    try {
      const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ login, password }) });
      const body = await res.json();
      if (!res.ok) {
        msg.appendChild(el('div',{class:'error'}, 'Неверные данные'));
        return;
      }
      msg.appendChild(el('div',{class:'success'}, 'Успешный вход'));
      setTimeout(() => setRoute('/welcome'), 600);
    } catch (e) {
      msg.appendChild(el('div',{class:'error'}, 'Ошибка сети'));
    }
  });

  const switchLink = el('div', {class:'small'}, [ el('span', {}, 'Нет аккаунта? '), el('span', {class:'link', onclick:()=>setRoute('/register')}, 'Регистрация') ]);
  c.appendChild(btn); c.appendChild(el('div', {style:'height:10px'})); c.appendChild(switchLink);
  appRoot.appendChild(c);
}

function renderWelcome() {
  appRoot.innerHTML = '';
  const c = el('div', {class:'container'});
  c.appendChild(el('h1', {}, 'Добро пожаловать'));
  c.appendChild(el('p', {}, 'Вы вошли в систему.'));
  const btn = el('button', {class:'button'}, 'Выйти');
  btn.addEventListener('click', () => setRoute('/login'));
  c.appendChild(btn);
  appRoot.appendChild(c);
}

function router() {
  const route = location.hash.replace('#','') || '/login';
  if (route.startsWith('/register')) renderRegister();
  else if (route.startsWith('/welcome')) renderWelcome();
  else renderLogin();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);