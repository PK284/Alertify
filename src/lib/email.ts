import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface StockAlertEmailProps {
  to: string
  productName: string
  url: string
  site: string
}

interface PriceAlertEmailProps {
  to: string
  productName: string
  price: number
  url: string
  site: string
  targetPrice?: number
}

function stockAlertHtml({ productName, url, site }: StockAlertEmailProps) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Back in Stock Alert</title>
</head>
<body style="margin:0;padding:0;background:#060911;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:12px 20px;">
        <span style="font-size:20px;">🔔</span>
        <span style="color:#f1f5f9;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Alertify</span>
      </div>
    </div>
    
    <!-- Card -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
      <!-- Green top bar -->
      <div style="height:3px;background:linear-gradient(90deg,#10b981,#34d399);"></div>
      
      <div style="padding:32px;">
        <!-- Icon -->
        <div style="width:56px;height:56px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px;">✅</div>
        
        <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">Back in Stock!</h1>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
          Great news! The item you were watching on <strong style="color:#f1f5f9;">${site}</strong> is now available.
        </p>
        
        <!-- Product Box -->
        <div style="background:#0c1118;border:1px solid #1f2937;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#4b5563;margin-bottom:6px;">Product</div>
          <div style="color:#f1f5f9;font-size:15px;font-weight:600;">${productName || 'Your tracked product'}</div>
        </div>
        
        <!-- CTA Button -->
        <a href="${url}" style="display:block;text-align:center;background:#10b981;color:#fff;font-size:14px;font-weight:600;padding:14px 24px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">
          Buy Now →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#4b5563;font-size:12px;margin:0;">
        You received this because you set up an Alertify alert.<br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#3b82f6;text-decoration:none;">Manage your alerts</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function priceAlertHtml({ productName, price, url, site, targetPrice }: PriceAlertEmailProps) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Price Drop Alert</title>
</head>
<body style="margin:0;padding:0;background:#060911;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:12px 20px;">
        <span style="font-size:20px;">🔔</span>
        <span style="color:#f1f5f9;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Alertify</span>
      </div>
    </div>
    
    <!-- Card -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
      <!-- Blue top bar -->
      <div style="height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);"></div>
      
      <div style="padding:32px;">
        <!-- Icon -->
        <div style="width:56px;height:56px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px;">📉</div>
        
        <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">Price Drop Alert!</h1>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
          The price on <strong style="color:#f1f5f9;">${site}</strong> has hit your target range.
        </p>
        
        <!-- Product Box -->
        <div style="background:#0c1118;border:1px solid #1f2937;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#4b5563;margin-bottom:6px;">Product</div>
          <div style="color:#f1f5f9;font-size:15px;font-weight:600;">${productName || 'Your tracked product'}</div>
        </div>
        
        <!-- Price Box -->
        <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#4b5563;margin-bottom:4px;">Current Price</div>
            <div style="color:#3b82f6;font-size:28px;font-weight:800;letter-spacing:-1px;">₹${price.toLocaleString('en-IN')}</div>
          </div>
          ${targetPrice ? `<div style="text-align:right;">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#4b5563;margin-bottom:4px;">Your Target</div>
            <div style="color:#94a3b8;font-size:16px;font-weight:600;">₹${targetPrice.toLocaleString('en-IN')}</div>
          </div>` : ''}
        </div>
        
        <!-- CTA Button -->
        <a href="${url}" style="display:block;text-align:center;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:14px;font-weight:600;padding:14px 24px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">
          Buy Now at ₹${price.toLocaleString('en-IN')} →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#4b5563;font-size:12px;margin:0;">
        You received this because you set up an Alertify alert.<br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#3b82f6;text-decoration:none;">Manage your alerts</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function sendStockAlertEmail({ to, productName, url, site }: StockAlertEmailProps) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Alertify <alerts@alertify.app>',
    to,
    subject: `🟢 ${productName || 'Product'} is Back in Stock on ${site}!`,
    html: stockAlertHtml({ to, productName, url, site }),
  })

  if (error) {
    console.error('Resend error (stock alert):', error)
    throw error
  }

  return data
}

export async function sendPriceAlertEmail({ to, productName, price, url, site, targetPrice }: PriceAlertEmailProps) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Alertify <alerts@alertify.app>',
    to,
    subject: `💰 Price Drop: ${productName || 'Your product'} is now ₹${price.toLocaleString('en-IN')} on ${site}!`,
    html: priceAlertHtml({ to, productName, price, url, site, targetPrice }),
  })

  if (error) {
    console.error('Resend error (price alert):', error)
    throw error
  }

  return data
}
