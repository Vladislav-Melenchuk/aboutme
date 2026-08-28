import { useEffect, useRef, useState } from 'react'
import { quizQuestions } from '../../data/profileData.js'

const MAX_SCORE = 15
const ACCESS_THRESHOLD = 95
const analysisMessages = [
  'Анализируем ответы...',
  'Сверяем red flags...',
  'Проверяем уровень адекватности...',
  'Рассчитываем шанс на выживание...',
  'Готово.',
]
const socialLinks = {
  instagram: 'https://www.instagram.com/yeokamii/',
  telegram: '',
}

function SocialAccess() {
  const channels = [
    ['INSTAGRAM', '@yeokamii', socialLinks.instagram],
    ['TELEGRAM', '', socialLinks.telegram],
  ]
  return <div className="social-access">
    <p>КАНАЛЫ СВЯЗИ РАЗБЛОКИРОВАНЫ</p>
    <div>{channels.map(([name, handle, url]) => url
      ? <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={`${name} ${handle}: открыть профиль`}><span>{name}</span><small>{handle}</small><i>↗</i></a>
      : <div key={name} className="social-channel is-disabled"><span>{name}</span><small>скоро</small><i>—</i></div>)}</div>
    <small>Дальше система ответственности не несёт.</small>
  </div>
}

function ResultCopy({ percentage }) {
  if (percentage < 50) return <><h3>Система обнаружила критическую несовместимость.</h3><p>Возможно, вам обоим так будет спокойнее.</p></>
  if (percentage < 80) return <><h3>Потенциал обнаружен.</h3><p>Но доверять тебе Машу система пока отказывается.</p></>
  return <><h3>Ты был близко.</h3><p>Но «близко» здесь не считается.<br />Социальные сети Маши останутся засекреченными.</p><small>Не хватило буквально чуть-чуть. Система непреклонна.</small></>
}

export default function CompatibilityQuiz() {
  const timeoutRef = useRef([])
  const countFrameRef = useRef(0)
  const [stage, setStage] = useState('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [displayPercentage, setDisplayPercentage] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const percentage = Math.round((score / MAX_SCORE) * 100)
  const successful = percentage >= ACCESS_THRESHOLD

  useEffect(() => () => {
    timeoutRef.current.forEach(window.clearTimeout)
    if (countFrameRef.current) window.cancelAnimationFrame(countFrameRef.current)
  }, [])

  useEffect(() => {
    if (stage !== 'analysis') return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      const reducedTimer = window.setTimeout(() => {
        setAnalysisStep(analysisMessages.length - 1)
        setStage('result')
      }, 0)
      return () => window.clearTimeout(reducedTimer)
    }
    const timers = analysisMessages.slice(1).map((_, index) => window.setTimeout(() => setAnalysisStep(index + 1), (index + 1) * 450))
    timers.push(window.setTimeout(() => setStage('result'), 2250))
    timeoutRef.current.push(...timers)
    return () => timers.forEach(window.clearTimeout)
  }, [stage])

  useEffect(() => {
    if (stage !== 'result') return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || percentage === 0) {
      const reducedTimer = window.setTimeout(() => setDisplayPercentage(percentage), 0)
      return () => window.clearTimeout(reducedTimer)
    }
    const startedAt = performance.now()
    const duration = 950
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      setDisplayPercentage(Math.round(percentage * (1 - ((1 - progress) ** 3))))
      if (progress < 1) countFrameRef.current = window.requestAnimationFrame(tick)
    }
    countFrameRef.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(countFrameRef.current)
  }, [stage, percentage])

  const selectAnswer = (answerIndex) => {
    if (selected !== null || leaving) return
    const answer = quizQuestions[questionIndex].answers[answerIndex]
    setSelected(answerIndex)
    setScore((current) => current + answer.score)
    const leaveTimer = window.setTimeout(() => setLeaving(true), 180)
    const nextTimer = window.setTimeout(() => {
      if (questionIndex === quizQuestions.length - 1) setStage('analysis')
      else setQuestionIndex((current) => current + 1)
      setSelected(null)
      setLeaving(false)
    }, 420)
    timeoutRef.current.push(leaveTimer, nextTimer)
  }

  const retry = () => {
    timeoutRef.current.forEach(window.clearTimeout)
    timeoutRef.current = []
    if (countFrameRef.current) window.cancelAnimationFrame(countFrameRef.current)
    setQuestionIndex(0)
    setScore(0)
    setSelected(null)
    setAnalysisStep(0)
    setDisplayPercentage(0)
    setLeaving(false)
    setStage('quiz')
  }

  const currentQuestion = quizQuestions[questionIndex]

  return (
    <section id="compatibility" className="compatibility-section" aria-labelledby="compatibility-title">
      <div className="quiz-inner">
        {stage === 'intro' && <div className="quiz-intro final-check-intro">
          <small className="section-label">ФИНАЛЬНАЯ ПРОВЕРКА</small>
          <h2 id="compatibility-title">Ну с Машей всё понятно.</h2>
          <h3>А ты вообще ей подходишь?</h3>
          <p>5 вопросов. Постарайся не облажаться.</p>
          <span>Порог допуска: 95%</span>
          <button type="button" className="intro-cta" onClick={() => setStage('quiz')}>Начать проверку</button>
        </div>}

        {stage === 'quiz' && <div key={questionIndex} className={`question-panel final-question ${leaving ? 'is-leaving' : ''}`}>
          <div className="final-progress" aria-label={`Вопрос ${questionIndex + 1} из 5`}><span>ВОПРОС 0{questionIndex + 1} / 05</span><i><b style={{ width: `${((questionIndex + 1) / quizQuestions.length) * 100}%` }} /></i></div>
          <h2>{currentQuestion.question}</h2>
          <div className="answer-list final-answer-list">
            {currentQuestion.answers.map((answer, index) => <button key={answer.id} type="button" className={selected === index ? 'is-selected' : ''} disabled={selected !== null} aria-pressed={selected === index} onClick={() => selectAnswer(index)}><span>{answer.id.toUpperCase()}</span><strong>{answer.text}</strong><i aria-hidden="true" /></button>)}
          </div>
          <p className={`quiz-reaction ${selected !== null && currentQuestion.answers[selected]?.reaction ? 'is-visible' : ''}`} aria-live="polite">{selected !== null ? currentQuestion.answers[selected]?.reaction || '\u00a0' : '\u00a0'}</p>
        </div>}

        {stage === 'analysis' && <div className="final-analysis" role="status" aria-live="polite"><div className="analysis-orbit"><i /><span /></div><p key={analysisStep}>{analysisMessages[analysisStep]}</p><small>{String(analysisStep + 1).padStart(2, '0')} / 05</small></div>}

        {stage === 'result' && <div className={`final-result ${successful ? 'is-success' : 'is-failed'}`} aria-live="polite">
          <p className="result-label">РЕЗУЛЬТАТ ПРОВЕРКИ</p>
          <div className="final-score" aria-label={`Совместимость ${percentage} процентов`}><strong>{displayPercentage}%</strong><span>СОВМЕСТИМОСТЬ</span></div>
          <p className="access-status">{successful ? 'ДОСТУП РАЗРЕШЁН' : 'ДОСТУП ОТКЛОНЁН'}</p>
          <div className="result-copy">{successful ? <><h3>Поздравляем.</h3><h4>У тебя есть шансы.</h4><p>Это ещё ничего не гарантирует.<br />Но система разрешает попробовать.</p></> : <ResultCopy percentage={percentage} />}</div>
          <small className="social-status">SOCIAL ACCESS: {successful ? 'GRANTED' : 'DENIED'}</small>
          {successful && <SocialAccess />}
          {!successful && <button type="button" className="retry-button" onClick={retry}>Пройти проверку ещё раз</button>}
        </div>}
      </div>
    </section>
  )
}
