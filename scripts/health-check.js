#!/usr/bin/env node

const https = require('https')
const http = require('http')

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const HEALTH_ENDPOINT = '/api/health'

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        })
      })
    })
    
    req.on('error', (err) => {
      reject(err)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function healthCheck() {
  console.log('🏥 Starting health check...')
  console.log(`📍 Checking: ${APP_URL}${HEALTH_ENDPOINT}`)
  
  try {
    const response = await makeRequest(`${APP_URL}${HEALTH_ENDPOINT}`)
    
    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.data)
      
      console.log('✅ Health check passed!')
      console.log('📊 Health status:', JSON.stringify(healthData, null, 2))
      
      // Additional checks
      if (healthData.status === 'healthy') {
        console.log('🟢 Application is healthy')
        
        if (healthData.database === 'connected') {
          console.log('🗄️  Database connection: OK')
        } else {
          console.log('🔴 Database connection: FAILED')
          process.exit(1)
        }
        
        if (healthData.memory) {
          console.log(`💾 Memory usage: ${healthData.memory.used}MB / ${healthData.memory.total}MB`)
        }
        
        if (healthData.uptime) {
          console.log(`⏱️  Uptime: ${Math.round(healthData.uptime)}s`)
        }
        
        process.exit(0)
      } else {
        console.log('🔴 Application is unhealthy')
        console.log('❌ Error:', healthData.error)
        process.exit(1)
      }
    } else {
      console.log(`🔴 Health check failed with status: ${response.statusCode}`)
      console.log('📄 Response:', response.data)
      process.exit(1)
    }
  } catch (error) {
    console.log('🔴 Health check failed!')
    console.log('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run health check
healthCheck()
