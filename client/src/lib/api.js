// import fallback from './fallbackContent.json'

// export async function fetchContent() {
//   try {
//     const res = await fetch('/api/content')
//     if (!res.ok) throw new Error('bad status')
//     const data = await res.json()
//     if (data && data.ok && data.content) return data.content
//     throw new Error('bad payload')
//   } catch {
//     // API unreachable (e.g. server not started yet) — render from bundled fallback
//     return fallback
//   }
// }

// export async function submitLead(endpoint, payload) {
//   const res = await fetch(`/api/${endpoint}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   })
//   const data = await res.json().catch(() => ({}))
//   if (!res.ok || !data.ok) {
//     throw new Error(data.error || 'Submission failed. Please try again.')
//   }
//   return data
// }


import fallback from './fallbackContent.json'

const API = import.meta.env.VITE_API_URL || ''

export async function fetchContent() {
  try {
    const res = await fetch(`${API}/api/content`)
    if (!res.ok) throw new Error('bad status')

    const data = await res.json()

    if (data && data.ok && data.content)
      return data.content

    throw new Error('bad payload')
  } catch {
    return fallback
  }
}

export async function submitLead(endpoint, payload) {
  const res = await fetch(`${API}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Submission failed. Please try again.')
  }

  return data
}