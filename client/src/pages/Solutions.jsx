import { useContext } from 'react'
import { ContentContext, ModalContext } from '../App.jsx'
import Reveal from '../components/Reveal.jsx'
import SheetHead from '../components/SheetHead.jsx'
import useMagnetic from '../hooks/useMagnetic.js'

export default function Solutions() {
  const { solutions } = useContext(ContentContext)
  const { openBookCall } = useContext(ModalContext)
  const magnet = useMagnetic(0.25)

  return (
    <>
      <section className="pagehero grid-d">
        <div className="container">
          <p className="mono">SHT 04 — FULL STRUCTURAL DRAWINGS</p>
          <Reveal as="h1">Solutions</Reveal>
          <Reveal delay={0.1}>
            <p className="lede">
              Eight structural members. Every engagement is assembled from them — a single member where that is all you
              need, the full span where it is not.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section grid-l">
        <div className="container">
          <div className="solgrid">
            {solutions.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 0.08}>
                <div className="sol">
                  <span className="idx">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <ul>
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="on-ink ctaband grid-d">
        <div className="container">
          <Reveal>
            <p className="bigline">
              Not sure which
              <br />
              members <em>you need?</em>
            </p>
            <p className="sub">That is exactly what the first call is for. Bring your numbers; we will bring the drawings.</p>
            <button ref={magnet} className="btn btn-brass inv" onClick={openBookCall}>
              Book a call <span className="arr">→</span>
            </button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
