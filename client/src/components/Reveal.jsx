import useReveal from '../hooks/useReveal.js'

export default function Reveal({ children, delay = 0, variant = '', as: Tag = 'div', className = '', ...rest }) {
  const ref = useReveal()
  const v = variant ? `rv-${variant}` : ''
  return (
    <Tag ref={ref} className={`rv ${v} ${className}`} style={{ '--d': `${delay}s` }} {...rest}>
      {children}
    </Tag>
  )
}
