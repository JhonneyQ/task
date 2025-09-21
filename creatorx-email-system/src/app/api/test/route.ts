import { NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('profiles').select('*').limit(5)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
