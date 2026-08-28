import { useEffect, useRef, useState } from 'react'
import { characteristics } from '../../data/profileData.js'

const REFRESH_SECONDS = 120

export default function TechnicalSpecs() {
  const sectionRef = useRef(null)
  const figureRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => current <= 0 ? REFRESH_SECONDS : current - 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [visible])

  useEffect(() => {
    const section = sectionRef.current
    const figure = figureRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!section || !figure || reducedMotion.matches) return undefined

    const modules = [...section.querySelectorAll('.hud-module')]
    let frame = 0
    const updatePosition = () => {
      const rect = section.getBoundingClientRect()
      const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight))
      figure.style.setProperty('--depth-y', `${progress * (window.innerWidth < 768 ? 10 : 16)}px`)
      modules.forEach((module, index) => {
        const distance = window.innerWidth < 768 ? 4 + (index % 3) * 2 : 6 + (index % 3) * 3
        module.style.setProperty('--depth-y', `${progress * distance}px`)
      })
      frame = 0
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition)
    }
    updatePosition()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const showPackage = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('package')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section id="technical-specs" ref={sectionRef} className={`manual-section ${visible ? 'is-visible' : ''}`} aria-labelledby="manual-title">
      <header className="section-heading technical-heading">
        <p className="section-label">ИНСТРУКЦИЯ ПО ЭКСПЛУАТАЦИИ</p>
        <h2 id="manual-title">Технические характеристики</h2>
        <p>Краткая диагностика перед эксплуатацией.</p>
        <small>Данные получены эмпирическим путём и могут быть оспорены Машей.</small>
      </header>

      <div className="spec-stage">
        <div ref={figureRef} className="silhouette-art" aria-hidden="true">
          <img src="/images/masha-silhouette2.png" alt="" />
          <span className="silhouette-scan" />
        </div>
        <div className="spec-list">
          {characteristics.map((item, index) => (
            <article key={item.title} className={`hud-module hud-module--${index + 1}`} style={{ '--delay': `${760 + index * 140}ms` }}>
              <span className="hud-index">0{index + 1}</span>
              <span className="hud-status" aria-hidden="true" />
              <p className="hud-title">{item.title}</p>
              <strong>{item.value}%</strong>
              <p className="hud-support">{item.text}</p>
              <span className="hud-ticks" aria-hidden="true" />
            </article>
          ))}
        </div>
        <div className="spec-refresh" role="timer" aria-live="off" aria-label={`Обновление характеристик через ${minutes} минут ${seconds} секунд`}>
          <div><span>ОБНОВЛЕНИЕ ХАРАКТЕРИСТИК ЧЕРЕЗ</span><strong>{minutes}:{seconds}</strong></div>
          <p>Некоторые характеристики могут меняться каждые 2 минуты.</p>
        </div>
      </div>

      <button className="technical-continue" type="button" onClick={showPackage}>
        <span>Что ещё входит в комплектацию?</span><i aria-hidden="true">↓</i>
      </button>
    </section>
  )
}
