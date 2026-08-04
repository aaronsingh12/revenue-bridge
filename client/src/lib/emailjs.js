import emailjs from '@emailjs/browser'

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const recipient = import.meta.env.VITE_CONTACT_EMAIL || ''

if (publicKey) {
  emailjs.init(publicKey)
}

export async function sendContactEmail(values) {
  if (!serviceId || !templateId || !publicKey) {
    return { ok: false, skipped: true, reason: 'missing-config' }
  }

  const templateParams = {
    ...values,
    to_email: recipient,
    reply_to: values.email || '',
    from_name: values.name || 'Website form',
    company: values.company || '',
    role: values.role || '',
    phone: values.phone || '',
    preferred_time: values.preferredTime || '',
    linkedin: values.linkedin || '',
    message: values.message || '',
    source: values.source || 'website',
    type: values.type || 'contact',
    subject: `New ${values.type || 'inquiry'} from ${values.name || 'website'}`
  }

  try {
    await emailjs.send(serviceId, templateId, templateParams)
    return { ok: true, skipped: false }
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      reason: error?.text || error?.message || 'EmailJS delivery failed'
    }
  }
}
