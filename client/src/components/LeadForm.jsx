import { useState } from 'react'
import { submitLead } from '../lib/api.js'

function Field({ name, label, value, onChange, type = 'text', textarea = false, required = false, rows = 4 }) {
  const filled = value && value.length > 0
  return (
    <div className={`field ${filled ? 'filled' : ''}`}>
      {textarea ? (
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} required={required} />
      ) : (
        <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} />
      )}
      <label htmlFor={name}>
        {label}
        {required ? ' *' : ''}
      </label>
    </div>
  )
}

/**
 * fields: array of { name, label, type?, textarea?, required?, half? }
 * Pairs of consecutive `half: true` fields render side by side.
 */
export default function LeadForm({ endpoint, fields, submitLabel = 'Send', successNote }) {
  const initial = Object.fromEntries(fields.map((f) => [f.name, '']))
  const [values, setValues] = useState(initial)
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [error, setError] = useState('')
  // dev only: the API returns a link to the captured email so the mail path is verifiable
  const [previewUrl, setPreviewUrl] = useState(null)

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = async () => {
    setError('')
    for (const f of fields) {
      if (f.required && !values[f.name].trim()) {
        setError(`Please fill in "${f.label}".`)
        return
      }
    }
    setStatus('loading')
    try {
      const data = await submitLead(endpoint, { ...values, website: hp })
      setPreviewUrl(data?.previewUrl || null)
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="form-success" role="status">
        <svg className="check" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M8 21 L17 30 L33 11" />
        </svg>
        <h4>Received.</h4>
        <p>{successNote || 'Your message is logged and on its way to the team. We reply to every serious inquiry.'}</p>
        {previewUrl && (
          <a className="mail-preview" href={previewUrl} target="_blank" rel="noreferrer">
            Dev preview — read the email that was just sent <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    )
  }

  // group half-width fields into rows
  const rows = []
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    if (f.half && fields[i + 1]?.half) {
      rows.push([f, fields[i + 1]])
      i++
    } else {
      rows.push([f])
    }
  }

  return (
    <div className="form">
      {rows.map((row, i) =>
        row.length === 2 ? (
          <div className="form-row" key={i}>
            {row.map((f) => (
              <Field key={f.name} {...f} value={values[f.name]} onChange={onChange} />
            ))}
          </div>
        ) : (
          <Field key={row[0].name} {...row[0]} value={values[row[0].name]} onChange={onChange} />
        )
      )}

      {/* honeypot — humans never see or fill this */}
      <div className="hp" aria-hidden="true">
        <input tabIndex="-1" autoComplete="off" name="website" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <p className={`form-status ${error ? 'err' : ''}`} role="alert">
        {error}
      </p>

      <div>
        <button className={`btn btn-brass ${status === 'loading' ? 'loading' : ''}`} onClick={onSubmit}>
          {status === 'loading' ? <span className="spinner" aria-hidden="true" /> : null}
          {status === 'loading' ? 'Sending…' : submitLabel}
          <span className="arr" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </div>
  )
}
