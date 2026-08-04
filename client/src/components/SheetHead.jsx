import Reveal from './Reveal.jsx'

export default function SheetHead({ sheet, title, lede }) {
  return (
    <Reveal className="sheethead">
      <div>
        <p className="mono">{sheet}</p>
        <h2>{title}</h2>
      </div>
      {lede && <p className="lede">{lede}</p>}
    </Reveal>
  )
}
