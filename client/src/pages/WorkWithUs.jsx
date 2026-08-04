import Reveal from '../components/Reveal.jsx'
import SheetHead from '../components/SheetHead.jsx'
import LeadForm from '../components/LeadForm.jsx'

export default function WorkWithUs() {
  return (
    <>
      <section className="pagehero grid-d">
        <div className="container">
          <p className="mono">SHT 09 — CREW & PARTNERS</p>
          <Reveal as="h1">Work with us</Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              Two ways onto the build: join the crew, or partner with the firm. Either way, start below — every
              submission is read by a person.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section grid-l">
        <div className="container split">
          <div className="sticky">
            <SheetHead sheet="SHT 09.1 — OPENINGS" title="Who we look for" />
            <div className="spec-list">
              {[
                { n: 'CREW', t: 'Researchers & SDRs', d: 'People who treat a prospect list like evidence, not inventory — meticulous, curious, allergic to spray-and-pray.' },
                { n: 'CREW', t: 'Writers', d: 'Outbound copy that reads like one person wrote it to one person. If that sentence made you nod, write to us.' },
                { n: 'PARTNER', t: 'Complementary firms', d: 'Agencies, consultancies, and platforms whose clients need pipeline — and who want a builder they can vouch for.' }
              ].map((r, i) => (
                <Reveal key={i} className="spec-row">
                  <span className="n">{r.n}</span>
                  <h3>{r.t}</h3>
                  <p>{r.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}>
            <SheetHead sheet="FORM 09-A" title="Introduce yourself" />
            <LeadForm
              endpoint="work-with-us"
              submitLabel="Send introduction"
              successNote="Introduction received. If there is a fit, a real person will write back."
              fields={[
                { name: 'name', label: 'Your name', required: true, half: true },
                { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                { name: 'role', label: 'Role / partnership interest', half: true },
                { name: 'linkedin', label: 'LinkedIn or portfolio URL', half: true },
                { name: 'message', label: 'Tell us what you build best', textarea: true, required: true }
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  )
}
