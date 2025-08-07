import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organizationId') as string
    const organizationName = formData.get('organizationName') as string
    const name = formData.get('name') as string
    const category = formData.get('category') as string

    if (!file || !organizationId) {
      return NextResponse.json(
        { error: 'File and organization ID are required' },
        { status: 400 }
      )
    }

    console.log('📤 Uploading document:', file.name, 'for organization:', organizationId)

    // For now, just create a document record in the database
    // You can implement actual file upload logic later
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        organization_id: organizationId,
        title: name || file.name,
        name: name || file.name,
        description: `Uploaded document: ${file.name}`,
        category: category || 'general',
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        upload_status: 'completed'
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Document uploaded successfully:', data.id)
    
    return NextResponse.json({
      success: true,
      document: data
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
} 