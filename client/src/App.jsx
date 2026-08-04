import { createContext, useCallback, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { fetchContent } from './lib/api.js'
import fallback from './lib/fallbackContent.json'
import Preloader from './components/Preloader.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookCallModal from './components/BookCallModal.jsx'
import Home from './pages/Home.jsx'
import Solutions from './pages/Solutions.jsx'
import Facto from './pages/Facto.jsx'
import About from './pages/About.jsx'
import WorkWithUs from './pages/WorkWithUs.jsx'
import Contact from './pages/Contact.jsx'

export const ContentContext = createContext(fallback)
export const ModalContext = createContext({ openBookCall: () => {} })

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const [content, setContent] = useState(fallback)
  const [modalOpen, setModalOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetchContent().then(setContent)
  }, [])

  const openBookCall = useCallback(() => setModalOpen(true), [])
  const closeBookCall = useCallback(() => setModalOpen(false), [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  return (
    <ContentContext.Provider value={content}>
      <ModalContext.Provider value={{ openBookCall }}>
        <Preloader />
        <Navbar />
        <main className="page" key={location.pathname}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/partners" element={<Facto />} />
            <Route path="/about" element={<About />} />
            <Route path="/work-with-us" element={<WorkWithUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        {modalOpen && <BookCallModal onClose={closeBookCall} />}
      </ModalContext.Provider>
    </ContentContext.Provider>
  )
}
