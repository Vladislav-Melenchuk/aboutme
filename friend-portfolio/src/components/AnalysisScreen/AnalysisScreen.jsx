import { useEffect, useState } from 'react'
import InfinityMark from '../InfinityMark/InfinityMark.jsx'

const messages = ['Анализируем ответы...', 'Сверяем с внутренними тараканами...', 'Игнорируем некоторые red flags...', 'Спрашиваем Машу...', 'Передумала.', 'Пересчитываем...']

export default function AnalysisScreen({ onComplete }) {
  const [message, setMessage] = useState(0)
  useEffect(() => {
    const times = [500, 1000, 1500, 2050, 2500]
    const timers = times.map((time, index) => setTimeout(() => setMessage(index + 1), time))
    timers.push(setTimeout(onComplete, 3100))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])
  return <div className="analysis-screen"><InfinityMark /><p key={message}>{messages[message]}</p></div>
}
