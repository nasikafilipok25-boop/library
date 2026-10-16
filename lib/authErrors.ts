export function authError(message: string): string {
  const m = (message || '').toLowerCase()
  if (m.includes('invalid login')) return 'Неверная почта или пароль'
  if (m.includes('not confirmed')) return 'Почта ещё не подтверждена. Откройте письмо от нас и перейдите по ссылке.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Эта почта уже зарегистрирована. Попробуйте войти.'
  if (m.includes('at least') || m.includes('weak') || m.includes('password should')) return 'Пароль слишком простой. Используйте не меньше 8 символов, буквы и цифры.'
  if (m.includes('rate limit') || m.includes('too many') || m.includes('seconds')) return 'Слишком много попыток. Подождите немного и попробуйте снова.'
  if (m.includes('not authorized')) return 'Письмо с подтверждением сейчас нельзя отправить на этот адрес. Напишите администратору.'
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) return 'Регистрация сейчас закрыта.'
  if (m.includes('valid email') || m.includes('invalid email') || m.includes('invalid format')) return 'Проверьте адрес почты'
  return 'Не получилось выполнить действие. Попробуйте ещё раз.'
}
