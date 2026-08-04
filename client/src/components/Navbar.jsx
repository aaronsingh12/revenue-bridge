import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ModalContext } from '../App.jsx'
import logo from '../../asset/logo_revenuebridge.jpg'

const LINKS = [
  { to: '/solutions', label: 'Solutions' },
  { to: '/#how-we-work', label: 'How we work', hash: true },
  { to: '/about', label: 'About' },
  { to: '/work-with-us', label: 'Work with us' }
]

export default function Navbar() {
  const { openBookCall } = useContext(ModalContext)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const progressRef = useRef(null)

  useEffect(() => {
    let raf
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        const h = document.documentElement
        const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <header className={`nav ${scrolled || open ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" onClick={close} aria-label="Revenue Bridge — home">
            <img className="brand-logo" src={logo} alt="Revenue Bridge" />
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) =>
              l.hash ? (
                <a key={l.label} href={l.to} className="nav-link">
                  {l.label}
                </a>
              ) : (
                <NavLink key={l.label} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              )
            )}
            <button className="btn btn-brass" onClick={openBookCall}>
              Book a call
            </button>
          </nav>

          <button
            className={`nav-burger ${open ? 'open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div ref={progressRef} className="nav-progress" aria-hidden="true" />
      </header>

      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <p className="mono">Revenue Bridge — Index</p>
        {LINKS.map((l, i) =>
          l.hash ? (
            <a key={l.label} href={l.to} onClick={close} style={{ transitionDelay: `${0.08 + i * 0.06}s` }}>
              {l.label}
            </a>
          ) : (
            <Link key={l.label} to={l.to} onClick={close} style={{ transitionDelay: `${0.08 + i * 0.06}s` }}>
              {l.label}
            </Link>
          )
        )}
        <a
          href="#book"
          onClick={(e) => {
            e.preventDefault()
            close()
            openBookCall()
          }}
          style={{ transitionDelay: `${0.08 + LINKS.length * 0.06}s`, color: 'var(--brass-2)' }}
        >
          Book a call
        </a>
      </div>
    </>
  )
}
