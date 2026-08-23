import { useContext } from 'react'
import { ContentContext, ModalContext } from '../App.jsx'
import Reveal from '../components/Reveal.jsx'
import SheetHead from '../components/SheetHead.jsx'
import LeadForm from '../components/LeadForm.jsx'

export default function Contact() {
  const { contact } = useContext(ContentContext)
  const { openBookCall } = useContext(ModalContext)

  return (
    <>
      <section className="pagehero grid-d">
        <div className="container">
          <p className="mono">SHT 10 — CORRESPONDENCE</p>
          <Reveal as="h1">Contact</Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              For anything that is not a call booking — questions, press, or a note you want a human to read. If you are
              ready to talk pipeline, the faster route is booking a call.
            </p>
          </Reveal>
          <Reveal delay={0.18} style={{ marginTop: '1.4rem' }}>
            <button className="btn btn-brass inv" onClick={openBookCall}>
              Book a call instead <span className="arr">→</span>
            </button>
          </Reveal>
        </div>
      </section>

      <section className="section grid-l">
        <div className="container split">
          <div className="sticky">
            <SheetHead sheet="SHT 10.1 — DETAILS" title="Where we work" />
            <p style={{ color: 'var(--muted-on-paper)', maxWidth: '40ch' }}>{contact.location}</p>

            {/*
              DEMO EMAIL — displayed here and in the footer.
              Source of truth: `contact.email` in server/data/content.json
              (offline mirror: client/src/lib/fallbackContent.json).
              Where form submissions are DELIVERED is a separate setting:
              CONTACT_EMAIL in server/.env. Change both before launch.
            */}
            <div className="contact-mail">
              {contact.email.split(',').map((address) => {
                const trimmedAddress = address.trim()
                return (
                  <a key={trimmedAddress} href={`mailto:${trimmedAddress}`}>
                    {trimmedAddress}
                  </a>
                )
              })}
            </div>

            <p style={{ color: 'var(--muted-on-paper)', maxWidth: '40ch', marginTop: '0.8rem' }}>
              Every message below is stored, routed to the team inbox, and answered by a person — not a sequence.
            </p>
          </div>
          <Reveal delay={0.1}>
            <SheetHead sheet="FORM 10-A" title="Write to us" />
            <LeadForm
              endpoint="contact"
              submitLabel="Send message"
              fields={[
                { name: 'name', label: 'Your name', required: true, half: true },
                { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                { name: 'company', label: 'Company', half: true },
                { name: 'phone', label: 'Phone (optional)', half: true },
                { name: 'message', label: 'Your message', textarea: true, required: true }
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  )
}
