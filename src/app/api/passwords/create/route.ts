import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔐 Creating password with data:', body)

    // Validate required fields
    if (!body.name || !body.password_value) {
      return NextResponse.json(
        { success: false, error: 'Name and password are required' },
        { status: 400 }
      )
    }

    // Insert password into database
    const { data, error } = await supabase
      .from('passwords')
      .insert([{
        organization_id: body.organization_id,
        name: body.name,
        username: body.username || null,
        password_value: body.password_value,
        password_type: body.password_type || 'general',
        category: body.category || null,
        shared_safe: body.shared_safe || null,
        url: body.url || null,
        notes: body.notes || null,
        otp_enabled: body.otp_enabled || false,
        otp_secret: body.otp_secret || null,
        archived: false
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Password created successfully:', data.id)
    
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error: any) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 