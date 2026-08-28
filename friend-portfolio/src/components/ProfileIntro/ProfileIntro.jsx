export default function ProfileIntro() {
  const showManual = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('technical-specs')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
      <section id="profile" className="profile-intro" aria-labelledby="profile-name">
        <div className="profile-intro__layout">
          <figure className="profile-portrait reveal reveal--portrait">
            <img src="/images/photo_avatar.jpg" alt="Портрет Маши" />
          </figure>

          <div className="profile-copy">
            <div className="profile-identity reveal reveal--identity">
              <img className="profile-butterfly" src="/images/butterfly.svg" alt="" aria-hidden="true" />
              <h1 id="profile-name">Маша</h1>
            </div>
            <blockquote className="profile-quote reveal reveal--quote">«Я не сложная. Просто инструкция потерялась.»</blockquote>
            <button className="intro-cta reveal reveal--cta" type="button" onClick={showManual}>Познакомимся?</button>
            <p className="profile-disclaimer reveal reveal--disclaimer">Нажимая кнопку, вы подтверждаете готовность к непредвиденным последствиям.</p>
          </div>
        </div>
      </section>
  )
}
