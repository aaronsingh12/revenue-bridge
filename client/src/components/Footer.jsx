import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ContentContext, ModalContext } from '../App.jsx'
import logo from '../../asset/logo_revenuebridge.jpg'

export default function Footer() {
  const { openBookCall } = useContext(ModalContext)
  const { contact } = useContext(ContentContext)
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <div className="nav-logo" style={{ color: 'var(--paper)' }}>
            <img className="brand-logo brand-logo-footer" src={logo} alt="Revenue Bridge" />
          </div>
          <p className="footer-brandline">
            B2B pipeline engineering. We build the span between your business and its next revenue — and hand you the
            blueprints.
          </p>
        </div>
        <div className="footer-col">
          <h4>Site</h4>
          <Link to="/solutions">Solutions</Link>
          <a href="/#how-we-work">How we work</a>
          <Link to="/partners">Partner Companies</Link>
          <Link to="/about">About</Link>
        </div>
        <div className="footer-col">
          <h4>Engage</h4>
          <button className="footer-link" onClick={openBookCall}>
            Book a call
          </button>
          <Link to="/work-with-us">Work with us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Reach us</h4>
          {/*
            DEMO EMAIL. Comes from `contact.email` in server/data/content.json
            (mirrored in client/src/lib/fallbackContent.json). Swap it there for
            the real address at launch — and set CONTACT_EMAIL in server/.env,
            which is what actually decides where form submissions are delivered.
          */}
          <a className="contact-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <p className="footer-brandline" style={{ marginTop: '0.9rem' }}>
            Every form on this site lands with a real person. No autoresponders pretending to be humans.
          </p>
        </div>
      </div>

      <div className="footer-word" aria-hidden="true">
        <div className="word">Bridge</div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} Revenue Bridge. All rights reserved.</span>
        <span>Business → Research → Targeting → Connection → Qualification → Opportunity → Revenue</span>
      </div>
    </footer>
  )
}
