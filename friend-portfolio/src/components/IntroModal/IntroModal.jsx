import { useEffect, useRef } from 'react'

export default function IntroModal({ onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="intro-modal" role="dialog" aria-modal="true" aria-labelledby="intro-modal-title" aria-describedby="intro-modal-description">
        <span className="intro-modal__accent" aria-hidden="true" />
        <p className="intro-modal__kicker">Опа.</p>
        <h2 id="intro-modal-title">Ты действительно нажал.</h2>
        <p id="intro-modal-description">Форма знакомства появится здесь совсем скоро.</p>
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}
