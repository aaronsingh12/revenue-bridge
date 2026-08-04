import { useEffect, useState } from 'react'
import logo from '../../asset/logo_revenuebridge.jpg'

export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('rb-loaded')) {
      setDone(true)
      onDone?.()
      return
    }
    let raf
    const t0 = performance.now()
    const DUR = 1300
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DUR)
      setPct(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        sessionStorage.setItem('rb-loaded', '1')
        setTimeout(() => {
          setDone(true)
          setTimeout(() => onDone?.(), 700)
        }, 180)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className={`preloader ${done ? 'done' : ''}`} aria-hidden="true">
      <div className="preloader-inner">
        <img className="brand-logo brand-logo-preloader" src={logo} alt="" />
        <div className="rule">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <div className="pct">Drafting sheet 01 — {String(pct).padStart(3, '0')}%</div>
      </div>
    </div>
  )
}
