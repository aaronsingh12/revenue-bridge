import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentContext, ModalContext } from '../App.jsx'
import Reveal from '../components/Reveal.jsx'
import SheetHead from '../components/SheetHead.jsx'
import Marquee from '../components/Marquee.jsx'
import TiltCard from '../components/TiltCard.jsx'
import Accordion from '../components/Accordion.jsx'
import BridgeDiagram from '../components/BridgeDiagram.jsx'
import useMagnetic from '../hooks/useMagnetic.js'
import useParallax from '../hooks/useParallax.js'

function HeroBackground() {
  // faint drafting grid + a slow-drifting cable line, lagging the scroll slightly
  const layer = useParallax(0.18)
  return (
    <div className="hero-bg" ref={layer} aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="gridp" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="rgba(236,230,217,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#gridp)" />
        <path
          d="M-40 640 C260 380 520 360 720 500 C920 640 1180 620 1480 380"
          stroke="rgba(180,136,59,0.35)"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          fill="none"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-160" dur="9s" repeatCount="indefinite" />
        </path>
        <path
          d="M-40 720 C300 500 620 470 820 580 C1040 700 1240 690 1480 470"
          stroke="rgba(236,230,217,0.12)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  )
}

function Rotator({ words = [] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [words.length])
  if (!words.length) return null
  return (
    <p className="hero-rotator">
      Engineered for
      <span className="word">
        <span key={i}>{words[i]}</span>
      </span>
    </p>
  )
}

function Hero() {
  const { brand } = useContext(ContentContext)
  const { openBookCall } = useContext(ModalContext)
  const magnet = useMagnetic(0.28)

  return (
    <section className="hero">
      <HeroBackground />
      <div className="container" style={{ position: 'relative' }}>
        <p className="mono hero-eyebrow">{brand.heroEyebrow}</p>
        <h1>
          <span className="line">
            <span>{brand.heroTitleTop}</span>
          </span>
          <span className="line">
            <span>{brand.heroTitleBottom}</span>
          </span>
        </h1>
        <div className="hero-foot">
          <div>
            <p className="hero-sub">{brand.heroSub}</p>
            <Rotator words={brand.heroRotating} />
          </div>
          <div className="hero-cta">
            <button ref={magnet} className="btn btn-brass inv" onClick={openBookCall}>
              Book a call <span className="arr">→</span>
            </button>
            <Link to="/solutions" className="btn btn-ghost">
              See solutions
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-scrollhint" aria-hidden="true">
        <span className="mono">Scroll</span>
        <span className="rope" />
      </div>
    </section>
  )
}

function Challenges() {
  const { challenges } = useContext(ContentContext)
  return (
    <section className="section grid-l">
      <div className="container">
        <SheetHead
          sheet="SHT 03 — SITE CONDITIONS"
          title="The gaps we get called in for"
          lede="If any of these read like your quarter, the span is missing — not the market."
        />
        <div className="cardgrid">
          {challenges.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <TiltCard className="card" max={5}>
                <span className="corner" aria-hidden="true" />
                <p className="idx">COND. {String(i + 1).padStart(2, '0')}</p>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionsPreview() {
  const { solutions } = useContext(ContentContext)
  return (
    <section className="section">
      <div className="container">
        <SheetHead
          sheet="SHT 04 — STRUCTURAL MEMBERS / SOLUTIONS"
          title="Eight members carry the load"
          lede="Engagements are assembled from these — alone or as a full span."
        />
        <div className="solgrid">
          {solutions.map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 0.08}>
              <Link to="/solutions" className="sol" style={{ display: 'grid' }}>
                <span className="idx">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15} style={{ marginTop: '1.6rem' }}>
          <Link to="/solutions" className="btn btn-ghost">
            Open the full drawings <span className="arr">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function Why() {
  const { differentiators } = useContext(ContentContext)
  return (
    <section className="section on-ink grid-d">
      <div className="container">
        <SheetHead
          sheet="SHT 05 — ENGINEERING NOTES"
          title="Why this bridge holds"
          lede="Not promises — construction decisions."
        />
        <div className="whygrid">
          {differentiators.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.07} className="why">
              <span className="mark" aria-hidden="true" />
              <div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FactoTeaser() {
  const { facto } = useContext(ContentContext)
  return (
    <section className="section on-ink">
      <div className="container">
        <Reveal variant="scale">
          <div className="facto">
            <p className="mono" style={{ color: 'var(--muted-on-ink)', marginBottom: '0.8rem' }}>
              {facto.eyebrow}
            </p>
            <h3>{facto.title}</h3>
            <p>{facto.desc}</p>
            <span className="status">
              <span className="dot" aria-hidden="true" />
              {facto.status}
            </span>
            <div style={{ marginTop: '1.8rem' }}>
              <Link to="/partners" className="btn btn-ghost">
                View partners <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Faq() {
  const { faqs } = useContext(ContentContext)
  return (
    <section className="section">
      <div className="container split">
        <div className="sticky">
          <SheetHead sheet="SHT 07 — RFI / QUESTIONS" title="Asked before every build" />
          <p style={{ color: 'var(--muted-on-paper)', maxWidth: '38ch' }}>
            Anything missing? Bring it to the call — unanswered questions are how bad engagements start.
          </p>
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  )
}

function CtaBand() {
  const { openBookCall } = useContext(ModalContext)
  const magnet = useMagnetic(0.25)
  return (
    <section className="on-ink ctaband grid-d">
      <div className="container">
        <Reveal>
          <p className="bigline">
            Your next quarter is
            <br />
            on the <em>other side.</em>
          </p>
          <p className="sub">
            One working session. Your numbers, your ICP, and a straight answer about whether we should build together.
          </p>
          <button ref={magnet} className="btn btn-brass inv" onClick={openBookCall}>
            Book a call <span className="arr">→</span>
          </button>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  const { marquee, stages } = useContext(ContentContext)
  return (
    <>
      <Hero />
      <Marquee items={marquee} />
      <Challenges />
      <BridgeDiagram stages={stages} />
      <SolutionsPreview />
      <Why />
      <FactoTeaser />
      <Faq />
      <CtaBand />
    </>
  )
}
