import { useEffect } from 'react'
import LeadForm from './LeadForm.jsx'

export default function BookCallModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-veil" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Book a call">
        <button className="modal-close" onClick={onClose}>
          Close ✕
        </button>
        <p className="mono" style={{ color: 'var(--brass)', marginBottom: '0.6rem' }}>
          Site inspection — 30 min
        </p>
        <h3>Book a call</h3>
        <p className="modal-sub">
          A working session on your pipeline, not a pitch. We look at your ICP and current numbers, and tell you honestly
          whether outbound is the right lever.
        </p>
        <LeadForm
          endpoint="book-call"
          submitLabel="Request the call"
          successNote="Slot request logged. You will hear from us with times shortly."
          fields={[
            { name: 'name', label: 'Your name', required: true, half: true },
            { name: 'email', label: 'Work email', type: 'email', required: true, half: true },
            { name: 'company', label: 'Company', half: true },
            { name: 'preferredTime', label: 'Preferred time / timezone', half: true },
            { name: 'message', label: 'What should we look at first?', textarea: true }
          ]}
        />
      </div>
    </div>
  )
}
