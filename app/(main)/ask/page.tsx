import Link from 'next/link'
export default function Ask() {
  return (
    <>
      <header className="top"><h1>Спросить базу</h1><p>Ответы только из ваших конспектов</p></header>
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 26, marginBottom: 8 }}>Скоро здесь появится ИИ</h3>
        <p style={{ margin: '0 0 16px', color: 'var(--ink2)' }}>Он будет отвечать только по опубликованным материалам и показывать источники. Пока можно пользоваться обычным поиском.</p>
        <Link href="/library" className="btn">Открыть поиск</Link>
      </div>
    </>
  )
}
