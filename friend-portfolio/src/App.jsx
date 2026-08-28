import { useEffect, useState } from 'react'
import Ferrofluid from './components/Ferrofluid/Ferrofluid.jsx'
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx'
import ProfileIntro from './components/ProfileIntro/ProfileIntro.jsx'
import TechnicalSpecs from './components/TechnicalSpecs/TechnicalSpecs.jsx'
import PackageSection from './components/PackageSection/PackageSection.jsx'
import CompatibilityQuiz from './components/CompatibilityQuiz/CompatibilityQuiz.jsx'

const loadingSteps = [
  { at: 0, message: 'Инициализация Маши...', progress: '14%' },
  { at: 800, message: 'Загружаем характер...', progress: '31%' },
  { at: 1600, message: 'Удаляем red flags...', progress: '47%' },
  { at: 2400, message: 'Ошибка: некоторые являются частью комплектации.', progress: '63%' },
  { at: 3300, message: 'Проверяем совместимость с адекватными людьми...', progress: '82%' },
  { at: 4400, message: 'Готово. Удачи.', progress: '100%' },
]

const ferrofluidColors = ['#bdb7c4', '#ded9e2', '#a99bb5']

function App() {
  const [step, setStep] = useState(0)
  const [previousStep, setPreviousStep] = useState(null)
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    const timers = loadingSteps.slice(1).map(({ at }, index) => setTimeout(() => {
      setStep((current) => {
        setPreviousStep(current)
        return index + 1
      })
      setTimeout(() => setPreviousStep(null), 330)
    }, at))
    timers.push(setTimeout(() => setPhase('leaving'), 5000))
    timers.push(setTimeout(() => setPhase('complete'), 5900))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="site-shell">
      <Ferrofluid
        colors={ferrofluidColors}
        speed={0.22}
        scale={1.45}
        turbulence={0.72}
        fluidity={0.12}
        rimWidth={0.18}
        sharpness={3}
        shimmer={0.7}
        glow={1.25}
        flowDirection="down"
        opacity={0.52}
      />
      {phase !== 'complete'
        ? <LoadingScreen currentStep={step} previousStep={previousStep} steps={loadingSteps} leaving={phase === 'leaving'} />
        : <><ProfileIntro /><TechnicalSpecs /><PackageSection /><CompatibilityQuiz /></>}
    </main>
  )
}

export default App
