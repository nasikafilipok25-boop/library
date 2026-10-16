'use client'
import { useRef, useState } from 'react'

export default function ConfirmDelete({ label = 'Удалить', message, onConfirm, className = 'btn soft' }: {
  label?: string; message: string; onConfirm: () => Promise<void>; className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function go() {
    setBusy(true); setErr('')
    try { await onConfirm(); ref.current?.close() }
    catch (e: any) { setErr(e?.message ?? 'Не получилось удалить. Попробуйте ещё раз.') }
    setBusy(false)
  }
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>{label}</button>
      <dialog ref={ref}>
        <h2>Удалить?</h2>
        <p style={{ margin: 0 }}>{message}</p>
        {err && <p className="err">{err}</p>}
        <div className="dlg-actions">
          <button type="button" className="btn soft" onClick={() => ref.current?.close()}>Отмена</button>
          <button type="button" className="btn" onClick={go} disabled={busy}>{busy ? 'Удаляем…' : 'Да, удалить'}</button>
        </div>
      </dialog>
    </>
  )
}
