import { Resend } from 'resend'

type OrderLine = {
  name: string
  quantity: number
  unitCents: number
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendOrderConfirmation(opts: {
  to: string
  storeName: string
  storeSlug?: string
  orderId: string
  currency: string
  lines: OrderLine[]
  totalCents: number
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY missing — skipping send')
    return
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'orders@resend.dev'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resend = new Resend(apiKey)

  const html = renderOrderEmail({ ...opts, appUrl })

  try {
    await resend.emails.send({
      from,
      to: opts.to,
      subject: `Order confirmed — ${opts.storeName}`,
      html,
    })
  } catch (err) {
    console.error('[email] send failed', err)
  }
}

function renderOrderEmail(opts: {
  storeName: string
  storeSlug?: string
  orderId: string
  currency: string
  lines: OrderLine[]
  totalCents: number
  appUrl: string
}) {
  const storeName = escapeHtml(opts.storeName)
  const shortId = escapeHtml(opts.orderId.slice(0, 8))
  const backHref = opts.storeSlug
    ? `${opts.appUrl}/s/${encodeURIComponent(opts.storeSlug)}`
    : opts.appUrl

  const rows = opts.lines
    .map((l) => {
      const name = escapeHtml(l.name)
      const lineTotal = formatPrice(l.unitCents * l.quantity, opts.currency)
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eef2f7;vertical-align:top;">
            <div style="font-size:14px;font-weight:600;color:#111827;">${name}</div>
            <div style="margin-top:2px;font-size:12px;color:#6b7280;">Quantity ${l.quantity}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eef2f7;text-align:right;vertical-align:top;font-size:14px;font-weight:500;color:#111827;white-space:nowrap;">
            ${lineTotal}
          </td>
        </tr>
      `
    })
    .join('')

  const total = formatPrice(opts.totalCents, opts.currency)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order confirmed</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Your order from ${storeName} is confirmed. Total ${total}.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5 0%,#a855f7 60%,#ec4899 100%);padding:28px 32px;color:#ffffff;">
                <div style="font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">
                  ${storeName}
                </div>
                <div style="margin-top:6px;font-size:22px;font-weight:600;line-height:1.25;">
                  Order confirmed
                </div>
                <div style="margin-top:4px;font-size:13px;opacity:0.9;">
                  Order #${shortId}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                  Thanks for your order! We&rsquo;ve received your payment and are getting it ready to ship.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  ${rows}
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  <tr>
                    <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#111827;">
                      Total
                    </td>
                    <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#111827;text-align:right;white-space:nowrap;">
                      ${total}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;">
                <a href="${backHref}" style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">
                  Visit ${storeName}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;font-size:12px;color:#6b7280;line-height:1.5;">
                Questions about this order? Just reply to this email &mdash; ${storeName} will get back to you.
              </td>
            </tr>
          </table>
          <div style="margin-top:20px;font-size:11px;color:#94a3b8;">
            Powered by Storefront
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
