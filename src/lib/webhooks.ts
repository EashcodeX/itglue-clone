import crypto from 'crypto'

export type WebhookEvent = 
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'tis_exception.created'
  | 'tis_exception.updated'
  | 'tis_exception.approved'
  | 'user.created'
  | 'user.updated'

// Utility function to trigger webhooks from other parts of the app
export async function triggerWebhook(event: WebhookEvent, data: any) {
  try {
    await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    })
  } catch (error) {
    console.error('Failed to trigger webhook:', error)
  }
}

// Webhook verification utility
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  )
}
