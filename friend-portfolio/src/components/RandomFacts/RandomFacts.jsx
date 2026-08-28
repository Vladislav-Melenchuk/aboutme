import { useState } from 'react'
import { randomFacts } from '../../data/profileData.js'

export default function RandomFacts() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * randomFacts.length))
  const nextFact = () => setIndex((current) => (current + 1 + Math.floor(Math.random() * (randomFacts.length - 1))) % randomFacts.length)
  return <section className="facts-section" aria-labelledby="facts-title"><p className="section-label">ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ</p><h3 id="facts-title">Факт, который никто не просил.</h3><p key={index} className="fact-card">{randomFacts[index]}</p><button type="button" className="secondary-button" onClick={nextFact}>Ещё факт</button></section>
}
