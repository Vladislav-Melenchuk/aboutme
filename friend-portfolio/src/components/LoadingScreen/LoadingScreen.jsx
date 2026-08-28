import InfinityMark from '../InfinityMark/InfinityMark.jsx'

export default function LoadingScreen({ currentStep, previousStep, steps, leaving }) {
  return (
    <section className="hero" aria-label="Загрузка профиля">
      <div className={`hero__island ${leaving ? 'hero__island--leaving' : ''}`}>
        <div className="hero__content">
          <img className="butterfly-mark" src="/images/butterfly.svg" alt="" aria-hidden="true" />
          <div className="loader-infinity"><InfinityMark /></div>
          <div className="loader-copy" aria-live="polite" aria-atomic="true">
            {previousStep !== null && <p className="loader-message loader-message--outgoing">{steps[previousStep].message}</p>}
            <p key={currentStep} className="loader-message loader-message--incoming">{steps[currentStep].message}</p>
          </div>
          <span className="loader-progress">{steps[currentStep].progress}</span>
        </div>
      </div>
    </section>
  )
}
