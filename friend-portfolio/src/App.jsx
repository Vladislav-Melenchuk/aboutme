import InfinityMark from './components/InfinityMark/InfinityMark.jsx'
import Lightfall from './components/Lightfall/Lightfall.jsx'

function App() {
  return (
    <main className="site-shell">
      <Lightfall colors={['#b68cff', '#7c4dff', '#d7b6ff', '#f1d6ff']} backgroundColor="#07030f" speed={0.65} streakCount={3} streakWidth={0.8} streakLength={1} glow={0.9} density={0.55} twinkle={0.7} zoom={2.5} backgroundGlow={0.35} opacity={0.9} mouseInteraction mouseStrength={0.5} mouseRadius={0.8} mouseDampening={0.15} />
      <section className="hero" aria-label="Profile preview">
        <div className="hero__island">
          <div className="hero__content">
            <img className="butterfly-mark" src="/images/butterfly.svg" alt="" aria-hidden="true" />
            <InfinityMark />
            <p className="hero__eyebrow">profile loading...</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
