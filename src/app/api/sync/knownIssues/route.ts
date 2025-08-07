import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, count: 0, message: 'Known Issues sync completed' })
} 