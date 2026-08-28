import { useEffect, useRef, useState } from 'react'

const careLevels = [
  ['ПОДАРКИ', 94],
  ['МЕЛОЧИ', 100],
  ['СЛОВА', 31],
  ['ПОСТУПКИ', 100],
]

const thoughts = [
  'а что если...',
  'почему он так написал',
  'надо спросить',
  'а вдруг',
  'ладно',
  'НЕТ, ПОДОЖДИ',
  'ещё один вопрос',
  'надо подумать',
  'я уже передумала',
]

function ModuleHeader({ number, title, subtitle }) {
  return <header className="showcase-module__header"><span>{number}</span><div><p>{subtitle}</p><h3>{title}</h3></div></header>
}

function CareModule() {
  return <div className="showcase-module care-module">
    <ModuleHeader number="01" title="ЗАБОТА" subtitle="скрытая, но рабочая" />
    <div className="care-levels">
      {careLevels.map(([label, value], index) => <div className="care-level" key={label} style={{ '--level': `${value}%`, '--meter-delay': `${120 + index * 100}ms` }}>
        <div><span>{label}</span><strong>{value}%</strong></div><i><b /></i>
      </div>)}
    </div>
    <div className="module-status"><i />STATUS: ACTIVE</div>
    <p className="module-summary">Говорить о чувствах — опционально.<br />Показывать поступками — включено по умолчанию.</p>
  </div>
}

function AestheticModule() {
  return <div className="showcase-module aesthetic-module">
    <ModuleHeader number="02" title="ЭСТЕТИЧЕСКИЙ ПРОЦЕССОР" subtitle="работает даже там, где не просили" />
    <div className="aesthetic-scanner">
      <img src="/images/package-aesthetic.jpg" alt="Солнечный свет на лестнице обычного подъезда" />
      <span className="scanner-overlay" aria-hidden="true" />
      <span className="scanner-corner scanner-corner--tl" /><span className="scanner-corner scanner-corner--tr" />
      <span className="scanner-corner scanner-corner--bl" /><span className="scanner-corner scanner-corner--br" />
      <span className="scanner-crosshair" aria-hidden="true">+</span><i className="scanner-line" />
      <small className="scanner-analysis">VISUAL ANALYSIS · 04.27</small>
      <span className="scanner-detection" aria-hidden="true" />
      <div className="scanner-result"><small>ОБЪЕКТ ПРОСКАНИРОВАН</small><span>ЭСТЕТИКА ОБНАРУЖЕНА</span><strong>100%</strong><em>ВАЙБ: НАЙДЕН</em></div>
    </div>
    <p className="module-summary">Красивый кадр может быть обнаружен<br />там, где остальные его не заметили.</p>
  </div>
}

function TabsModule() {
  const [status, setStatus] = useState('47 процессов активно')
  const timeoutRef = useRef(null)
  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])
  const denyClose = () => {
    window.clearTimeout(timeoutRef.current)
    setStatus('Недостаточно прав.')
    timeoutRef.current = window.setTimeout(() => setStatus('47 процессов активно'), 1500)
  }
  return <div className="showcase-module tabs-module">
    <ModuleHeader number="03" title="47 ОТКРЫТЫХ ВКЛАДОК" subtitle="закрывать необязательно" />
    <div className="thought-cloud">{thoughts.map((thought, index) => <span key={thought} style={{ '--float-duration': `${4.5 + index * 0.18}s`, '--float-delay': `${index * -0.35}s` }}>{thought}</span>)}</div>
    <div className="tabs-status"><span aria-live="polite">{status}</span><button type="button" onClick={denyClose}>Закрыть все</button></div>
  </div>
}

function DecisionModule() {
  return <div className="showcase-module decision-module">
    <ModuleHeader number="04" title="СИСТЕМА ПРИНЯТИЯ РЕШЕНИЙ" subtitle="логика присутствует, но не всегда участвует" />
    <p className="decision-question">Что выбрать?</p>
    <div className="vote-list">{[['A', 46], ['B', 34], ['C', 20]].map(([option, value], index) => <div className="vote-row" key={option} style={{ '--vote': `${value}%`, '--vote-delay': `${120 + index * 110}ms` }}><span>{option}</span><i><b /></i><strong>{value}%</strong></div>)}</div>
    <div className="decision-result"><span>↓</span><small>РЕШЕНИЕ ПРИНЯТО</small><strong>D</strong><p>0% голосов</p><em>Решение принято успешно.</em><i>✓ SYSTEM OK</i></div>
  </div>
}

const modules = [CareModule, AestheticModule, TabsModule, DecisionModule]

export default function PackageSection() {
  const sectionRef = useRef(null)
  const pointerStart = useRef(null)
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState('next')

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const changeModule = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= modules.length || nextIndex === activeIndex) return
    setDirection(nextIndex > activeIndex ? 'next' : 'previous')
    setActiveIndex(nextIndex)
  }
  const handlePointerDown = (event) => {
    pointerStart.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handlePointerUp = (event) => {
    if (pointerStart.current === null) return
    const distance = event.clientX - pointerStart.current
    pointerStart.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (Math.abs(distance) < 45) return
    changeModule(activeIndex + (distance < 0 ? 1 : -1))
  }
  const showQuiz = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('compatibility')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
  const ActiveModule = modules[activeIndex]

  return (
    <section id="package" ref={sectionRef} className={`package-section ${visible ? 'is-visible' : ''}`} aria-labelledby="package-title">
      <div className="package-showcase">
        <header className="section-heading package-heading"><p className="section-label">БАЗОВАЯ ВЕРСИЯ</p><h2 id="package-title">Комплектация</h2><p>Поставляется в единственном экземпляре. Возврат не предусмотрен.</p></header>
        <div className="showcase-count" aria-live="polite">0{activeIndex + 1} <span>/ 04</span></div>
        <div className="showcase-viewport" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { pointerStart.current = null }}>
          <div key={activeIndex} className={`showcase-active showcase-active--${direction}`}><ActiveModule /></div>
        </div>
        <div className="showcase-navigation">
          <button type="button" aria-label="Предыдущая характеристика" disabled={activeIndex === 0} onClick={() => changeModule(activeIndex - 1)}>←</button>
          <div className="showcase-pagination" aria-label={`Характеристика ${activeIndex + 1} из 4`}>{modules.map((_, index) => <button key={index} type="button" className={index === activeIndex ? 'is-active' : ''} aria-label={`Показать характеристику ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => changeModule(index)} />)}</div>
          <button type="button" aria-label="Следующая характеристика" disabled={activeIndex === modules.length - 1} onClick={() => changeModule(activeIndex + 1)}>→</button>
        </div>
        <div className="package-footer">
          <div className="package-punchline"><p>«Я сама» и «помогите мне»<br /><strong>могут работать одновременно.</strong></p><small>Не конфликт. Многозадачность.</small></div>
          <div className="package-quiz-cta"><small>С комплектацией разобрались.</small><h3>А ты вообще ей подходишь?</h3><p>Осталось пройти небольшую проверку.</p><button type="button" onClick={showQuiz}>Проверить совместимость <span aria-hidden="true">↓</span></button></div>
        </div>
      </div>
    </section>
  )
}
