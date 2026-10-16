import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Сюда пользователь попадает по ссылке из письма с подтверждением почты
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/`)
    // Ссылку открыли на другом устройстве: почта подтверждена, но войти нужно вручную
    return NextResponse.redirect(`${origin}/login?notice=confirmed`)
  }
  return NextResponse.redirect(`${origin}/login?notice=expired`)
}
