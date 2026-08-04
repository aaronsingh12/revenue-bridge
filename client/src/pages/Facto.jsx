import { useContext } from 'react'
import { ContentContext, ModalContext } from '../App.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Facto() {
  const { facto } = useContext(ContentContext)
  const { openBookCall } = useContext(ModalContext)

  const slots = [
    { n: 'PARTNER 01', t: 'Facto Technology', d: 'A B2B technology company focused on practical business solutions.' },
    { n: 'PARTNER 02', t: 'Zoho', d: 'A global B2B software company supporting sales, marketing, and operations teams.' },
    { n: 'PARTNER 03', t: 'Freshworks', d: 'A B2B software company helping teams deliver better customer and employee experiences.' }
  ]

  return (
    <>
      <section className="pagehero grid-d">
        <div className="container">
          <p className="mono">{facto.eyebrow}</p>
          <Reveal as="h1">Partner Companies</Reveal>
          <Reveal delay={0.1}>
            <p className="lede">{facto.desc}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <span className="status" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.18em', color: 'var(--brass-2)', border: '1px dashed rgba(216,169,79,0.5)', padding: '0.5rem 0.8rem' }}>
              <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brass-2)' }} aria-hidden="true" />
              {facto.status}
            </span>
          </Reveal>
        </div>
      </section>

      <section className="section grid-l">
        <div className="container">
          <div className="proofgrid">
            {slots.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07} className="proof">
                <p className="tag">{s.n}</p>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.35rem', marginBottom: '0.4rem' }}>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
                <span className="stamp">Partner company</span>
              </Reveal>
            ))}
          </div>
          <p className="proof-note">
            We are proud to work alongside companies that share our focus on meaningful, measurable growth.
          </p>
          <div style={{ marginTop: '1.4rem' }}>
            <button className="btn btn-brass" onClick={openBookCall}>
              Ask about partnerships <span className="arr">→</span>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
