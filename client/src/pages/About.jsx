import { useContext } from 'react'
import { ContentContext, ModalContext } from '../App.jsx'
import Reveal from '../components/Reveal.jsx'
import SheetHead from '../components/SheetHead.jsx'

export default function About() {
  const { stages } = useContext(ContentContext)
  const { openBookCall } = useContext(ModalContext)

  return (
    <>
      <section className="pagehero grid-d">
        <div className="container">
          <p className="mono">SHT 08 — FIRM PROFILE</p>
          <Reveal as="h1">
            We build spans,
            <br />
            not campaigns.
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              Revenue Bridge exists because most B2B pipelines fail in the middle: good companies on one side, real
              buyers on the other, and nothing engineered to carry the weight between them. We build that structure —
              research-first, accountable end to end, and honest enough to publish empty proof frames until the numbers
              are real.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section grid-l">
        <div className="container split">
          <div className="sticky">
            <SheetHead sheet="SHT 08.1 — METHOD" title="The load path, in order" />
            <p style={{ color: 'var(--muted-on-paper)', maxWidth: '38ch' }}>
              Every engagement crosses the same seven stages. The order never changes, because load paths do not
              negotiate.
            </p>
          </div>
          <div className="spec-list">
            {stages.map((s) => (
              <Reveal key={s.id} className="spec-row">
                <span className="n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section on-ink grid-d">
        <div className="container">
          <SheetHead sheet="SHT 08.2 — DESIGN PRINCIPLES" title="What we hold ourselves to" />
          <div className="whygrid">
            {[
              { t: 'Truth in materials', d: 'No invented statistics, no borrowed logos, no stock testimonials. If a number appears on this site, it happened.' },
              { t: 'Named accountability', d: 'You always know exactly who is on your account and who answers for it. No rotating cast, no anonymous "team".' },
              { t: 'Handover by design', d: 'Playbooks, lists, and learnings are built to be yours. A good bridge does not need its engineer standing on it.' },
              { t: 'Straight answers', d: 'If outbound is not your best lever right now, we say so on the first call — and tell you what is.' }
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 0.07} className="why">
                <span className="mark" aria-hidden="true" />
                <div>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} style={{ marginTop: '2.4rem' }}>
            <button className="btn btn-brass inv" onClick={openBookCall}>
              Meet us on a call <span className="arr">→</span>
            </button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
