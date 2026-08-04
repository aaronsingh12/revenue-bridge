import { useEffect, useRef, useState } from 'react'
import SheetHead from './SheetHead.jsx'
import Reveal from './Reveal.jsx'

/**
 * The signature section: a suspension bridge drawn by scroll.
 *
 * Layout contract (the previous version broke here):
 *   - The section heading sits OUTSIDE the pinned viewport, so the pin only has to
 *     hold three things: the stage panel, the drawing, and the progress rule.
 *   - `.bridge-pane` is a 3-row grid (auto / 1fr / auto). The drawing lives in the
 *     1fr row with `min-height: 0`, so it shrinks to whatever height is left over
 *     instead of overflowing and being clipped by the sticky container.
 *   - The SVG scales with `preserveAspectRatio="xMidYMid meet"`, so it is always
 *     fully visible — on a 1440x900 desktop and on a short laptop window alike.
 *
 * Scroll 0 -> 1 draws the deck + cable, raises the hangers, lights the seven
 * stage nodes and walks a load across the span. Narrow or short viewports drop
 * to a vertical timeline (see `.bridge-list`), where the drawing would be
 * illegible anyway.
 */

// Stage x-positions along the 1200-wide viewBox deck
const XS = [120, 280, 440, 600, 760, 920, 1080]
const DECK_Y = 400
const CABLE_D =
  'M40 340 C140 220 240 190 320 190 C430 190 500 300 600 300 C700 300 770 190 880 190 C960 190 1060 220 1160 340'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

export default function BridgeDiagram({ stages = [] }) {
  const trackRef = useRef(null)
  const stickyRef = useRef(null)
  const deckRef = useRef(null)
  const cableRef = useRef(null)
  const loadRef = useRef(null)
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const hangerRefs = useRef([])
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  /* Hangers must land exactly on the cable. Rather than hard-coding y values that
     drift whenever the curve is retuned, sample the real path geometry once. */
  useEffect(() => {
    const path = cableRef.current
    if (!path || typeof path.getTotalLength !== 'function') return
    let total
    try {
      total = path.getTotalLength()
    } catch {
      return
    }
    if (!total) return

    const SAMPLES = 360
    const pts = []
    for (let i = 0; i <= SAMPLES; i++) pts.push(path.getPointAtLength((i / SAMPLES) * total))

    XS.forEach((x, i) => {
      const h = hangerRefs.current[i]
      if (!h) return
      let best = pts[0]
      let bestD = Infinity
      for (const p of pts) {
        const d = Math.abs(p.x - x)
        if (d < bestD) {
          bestD = d
          best = p
        }
      }
      h.setAttribute('y1', String(best.y + 1))
    })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    const sticky = stickyRef.current
    if (!track || !sticky || !stages.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = null
    const update = () => {
      raf = null
      const paneH = sticky.offsetHeight
      // Fallback timeline is showing (pane display:none) — nothing to drive.
      if (!paneH) return

      const stickTop = parseFloat(getComputedStyle(sticky).top) || 0
      const rect = track.getBoundingClientRect()
      const total = Math.max(1, rect.height - paneH)
      const p = reduced ? 1 : clamp01((stickTop - rect.top) / total)

      // deck draws first (0 -> .45), the cable follows it across (.10 -> .60)
      const deckP = clamp01(p / 0.45)
      const cableP = clamp01((p - 0.1) / 0.5)
      if (deckRef.current) deckRef.current.style.strokeDashoffset = String(1 - deckP)
      if (cableRef.current) cableRef.current.style.strokeDashoffset = String(1 - cableP)

      // hangers drop in behind the cable, one span at a time
      hangerRefs.current.forEach((h, i) => {
        if (!h) return
        h.style.opacity = String(clamp01((cableP - i / 8) * 7))
      })

      // the load walks the deck for the whole scroll
      // (SVG attribute rather than CSS transform: identical result, no browser caveats)
      if (loadRef.current) {
        loadRef.current.setAttribute('transform', `translate(${(40 + p * 1120).toFixed(1)} 0)`)
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (pctRef.current) pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`

      const idx = Math.min(stages.length - 1, Math.floor(p * stages.length))
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
    }

    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('orientationchange', onScroll)
    // the pane height changes when the URL bar collapses / the fallback kicks in
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null
    ro?.observe(sticky)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('orientationchange', onScroll)
      ro?.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [stages.length])

  const stage = stages[active] || {}

  return (
    <section className="bridge-wrap grid-d" id="how-we-work">
      <div className="container bridge-head">
        <SheetHead
          sheet="SHT 02 — LOAD PATH / HOW WE WORK"
          title="Seven stages. One span."
          lede="Scroll to cross the bridge — every engagement moves left to right, and nothing skips a stage."
        />
      </div>

      <div className="bridge-track" ref={trackRef}>
        <div className="bridge-sticky" ref={stickyRef}>
          <div className="container bridge-pane">
            <div className="bridge-stage-panel" aria-live="polite">
              <div className="big-n stage-swap" key={`n-${active}`}>
                {stage.n}
              </div>
              <div className="stage-swap" key={`t-${active}`}>
                <h3>{stage.title}</h3>
                <p>{stage.desc}</p>
              </div>
            </div>

            <div className="bridge-canvas" aria-hidden="true">
              {/* viewBox is cropped tight to the drawing (y 150→490): a 3.5:1 box keeps the
                  bridge and its labels at full size even in a short browser window */}
              <svg viewBox="0 150 1200 340" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="cableGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--brass)" />
                    <stop offset="50%" stopColor="var(--brass-2)" />
                    <stop offset="100%" stopColor="var(--brass)" />
                  </linearGradient>
                  <filter id="loadGlow" x="-120%" y="-120%" width="340%" height="340%">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* water line */}
                <line x1="0" y1="472" x2="1200" y2="472" stroke="var(--line-d)" strokeDasharray="2 8" />

                {/* towers (cross-braced, standing in the water) */}
                {[320, 880].map((x) => (
                  <g key={x} className="tower">
                    <line x1={x} y1="190" x2={x} y2="472" stroke="var(--paper)" strokeOpacity="0.8" strokeWidth="3" />
                    <line x1={x - 26} y1="252" x2={x + 26} y2="252" stroke="var(--paper)" strokeOpacity="0.35" strokeWidth="2" />
                    <line x1={x - 22} y1="330" x2={x + 22} y2="330" stroke="var(--paper)" strokeOpacity="0.22" strokeWidth="2" />
                  </g>
                ))}

                {/* main cable — drawn by scroll */}
                <path ref={cableRef} className="draw" pathLength="1" d={CABLE_D} stroke="url(#cableGrad)" strokeWidth="2.5" />

                {/* Hangers. y1 is corrected to the real cable geometry on mount, and
                    opacity is owned entirely by the scroll handler — it must NOT be a
                    React style prop, or every stage change would reset it to hidden. */}
                {XS.map((x, i) => (
                  <line
                    key={x}
                    className="hanger"
                    ref={(el) => (hangerRefs.current[i] = el)}
                    x1={x}
                    y1="300"
                    x2={x}
                    y2={DECK_Y}
                    stroke="rgba(236, 230, 217, 0.42)"
                    strokeWidth="1.5"
                  />
                ))}

                {/* cable anchorages */}
                {[40, 1160].map((x) => (
                  <rect key={x} x={x - 11} y="336" width="22" height="14" fill="var(--ink-3)" stroke="var(--line-d)" />
                ))}

                {/* deck — drawn by scroll */}
                <path ref={deckRef} className="draw" pathLength="1" d={`M40 ${DECK_Y} H 1160`} stroke="var(--paper)" strokeWidth="3" />

                {/* travelling load */}
                <g ref={loadRef} className="bridge-load">
                  <line x1="0" y1={DECK_Y - 20} x2="0" y2={DECK_Y} stroke="var(--brass-2)" strokeWidth="1.5" strokeOpacity="0.7" />
                  <circle cx="0" cy={DECK_Y - 26} r="6" fill="var(--brass-2)" filter="url(#loadGlow)" />
                </g>

                {/* stage nodes */}
                {XS.map((x, i) => {
                  const s = stages[i] || {}
                  const isOn = i <= active
                  const isNow = i === active
                  return (
                    <g key={x} className={`stage-node ${isOn ? 'active' : ''} ${isNow ? 'now' : ''}`}>
                      {isNow && <circle className="ring" cx={x} cy={DECK_Y} r="10" stroke="var(--brass-2)" strokeWidth="1.5" fill="none" />}
                      <circle
                        cx={x}
                        cy={DECK_Y}
                        r="7"
                        fill={isOn ? 'var(--brass)' : 'var(--ink)'}
                        stroke={isOn ? 'var(--brass-2)' : 'var(--line-d)'}
                        strokeWidth="2"
                      />
                      <text className="n" x={x} y={DECK_Y + 32} textAnchor="middle">
                        {s.n}
                      </text>
                      <text className="t" x={x} y={DECK_Y + 52} textAnchor="middle">
                        {s.title}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="bridge-foot">
              <div className="bridge-progressbar">
                <span ref={barRef} />
              </div>
              <p className="mono bridge-pct">
                <span ref={pctRef}>000%</span> crossed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* narrow / short viewports: the drawing is replaced by a readable timeline */}
      <div className="container bridge-list">
        {stages.map((s, i) => (
          <Reveal className="stage" key={s.id} delay={i * 0.05}>
            <p className="mono">Stage {s.n}</p>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
