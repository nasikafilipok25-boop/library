import RegisterForm from '@/components/RegisterForm'

export default function Register() {
  return (
    <main className="app" style={{ maxWidth: 460, marginLeft: 'auto' }}>
      <header className="top" style={{ marginTop: 40 }}>
        <h1>Регистрация</h1>
        <p>Доступ к библиотеке для чтения</p>
      </header>
      <RegisterForm />
    </main>
  )
}
