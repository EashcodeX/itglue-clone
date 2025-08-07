import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing documents...')
    
    return NextResponse.json({
      success: true,
      count: 0,
      message: 'Documents sync completed'
    })

  } catch (error: any) {
    console.error('❌ Documents sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
} 