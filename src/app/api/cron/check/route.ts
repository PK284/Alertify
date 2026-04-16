import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { scrape } from '@/lib/scrapers'
import { sendStockAlertEmail, sendPriceAlertEmail } from '@/lib/email'
import type { Alert, Site } from '@/lib/types'

// GET /api/cron/check
// Called by Vercel Cron on schedule. Secured with CRON_SECRET header.
export async function GET(request: Request) {
  // Security: verify cron secret
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log(`[CRON] Starting alert check at ${new Date().toISOString()}`)

  // Use service role key to bypass RLS for cron operations
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Fetch all active alerts with user emails
  const { data: alerts, error: fetchError } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')

  if (fetchError) {
    console.error('[CRON] Failed to fetch alerts:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!alerts || alerts.length === 0) {
    console.log('[CRON] No active alerts to process.')
    return NextResponse.json({ message: 'No active alerts', processed: 0 })
  }

  console.log(`[CRON] Processing ${alerts.length} active alerts...`)

  const results = {
    total: alerts.length,
    triggered: 0,
    failed: 0,
    unchanged: 0,
  }

  for (const alert of alerts as Alert[]) {
    try {
      console.log(`[CRON] Checking alert ${alert.id} (${alert.site} / ${alert.alert_type})`)

      // Scrape the URL
      const scraped = await scrape(alert.url, alert.site as Site)

      // Update last_checked_at regardless of outcome
      await supabase
        .from('alerts')
        .update({
          last_checked_at: new Date().toISOString(),
          current_price: scraped.price ?? alert.current_price,
          product_name: scraped.productName || alert.product_name,
          status: scraped.success ? 'active' : 'error',
        })
        .eq('id', alert.id)

      if (!scraped.success) {
        console.warn(`[CRON] Scrape failed for alert ${alert.id}:`, scraped.error)
        results.failed++
        continue
      }

      // Evaluate trigger condition
      let shouldTrigger = false
      let triggerValue = ''

      if (alert.alert_type === 'stock') {
        if (scraped.inStock === true) {
          shouldTrigger = true
          triggerValue = 'Back in stock'
        }
      } else if (alert.alert_type === 'price') {
        const price = scraped.price
        if (price !== null && price !== undefined) {
          const belowMin = alert.min_price !== null && price <= alert.min_price
          const aboveMax = alert.max_price !== null && price > alert.max_price

          if (belowMin && !aboveMax) {
            shouldTrigger = true
            triggerValue = `Price dropped to ₹${price.toLocaleString('en-IN')}`
          }
        }
      }

      if (!shouldTrigger) {
        results.unchanged++
        continue
      }

      // Get user email for the notification
      const { data: userData } = await supabase.auth.admin.getUserById(alert.user_id)
      const userEmail = userData?.user?.email

      if (!userEmail) {
        console.warn(`[CRON] No email found for user ${alert.user_id}`)
        results.failed++
        continue
      }

      // Send email
      console.log(`[CRON] Sending ${alert.alert_type} alert email to ${userEmail}`)
      try {
        if (alert.alert_type === 'stock') {
          await sendStockAlertEmail({
            to: userEmail,
            productName: scraped.productName || alert.product_name || 'Your product',
            url: alert.url,
            site: alert.site,
          })
        } else if (alert.alert_type === 'price' && scraped.price !== null && scraped.price !== undefined) {
          await sendPriceAlertEmail({
            to: userEmail,
            productName: scraped.productName || alert.product_name || 'Your product',
            price: scraped.price,
            url: alert.url,
            site: alert.site,
            targetPrice: alert.min_price ?? undefined,
          })
        }
      } catch (emailErr) {
        console.error(`[CRON] Email send failed for alert ${alert.id}:`, emailErr)
        results.failed++
        continue
      }

      // Update alert status to triggered + insert notification record
      await supabase
        .from('alerts')
        .update({ status: 'triggered' })
        .eq('id', alert.id)

      await supabase
        .from('notifications')
        .insert({
          alert_id: alert.id,
          user_id: alert.user_id,
          trigger_value: triggerValue,
          sent_at: new Date().toISOString(),
        })

      results.triggered++
      console.log(`[CRON] ✅ Alert ${alert.id} triggered: ${triggerValue}`)

    } catch (err) {
      console.error(`[CRON] Unexpected error processing alert ${alert.id}:`, err)
      results.failed++
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`[CRON] Done in ${duration}s. Results:`, results)

  return NextResponse.json({
    message: 'Cron completed',
    duration: `${duration}s`,
    ...results,
  })
}
