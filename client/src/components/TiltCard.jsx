import { useRef } from 'react'

// Subtle 3D tilt toward the cursor. Wraps any card content.
export default function TiltCard({ children, className = '', max = 7 }) {
  const ref = useRef(null)

  const move = (e) => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(800px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-2px)`
  }
  const leave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }

  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </div>
  )
}
