import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Grid3X3, Home, Maximize2, Play, Pause } from 'lucide-react'

const SLIDE_COUNT = 20

function Presentation() {
  const slides = useMemo(
    () => Array.from({ length: SLIDE_COUNT }, (_, index) => {
      const number = String(index + 1).padStart(2, '0')
      return {
        id: index + 1,
        src: `${import.meta.env.BASE_URL}presentation/html_assets/slides/slide_${number}.png`,
        label: `Slide ${index + 1}`,
      }
    }),
    []
  )

  const [current, setCurrent] = useState(() => {
    const hashSlide = Number.parseInt(window.location.hash.replace('#', ''), 10)
    return Number.isFinite(hashSlide) ? Math.min(Math.max(hashSlide - 1, 0), SLIDE_COUNT - 1) : 0
  })
  const [showOverview, setShowOverview] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [autoplay, setAutoplay] = useState(false)

  const activeSlide = slides[current]
  const progress = ((current + 1) / slides.length) * 100

  const goToSlide = (index) => {
    const next = Math.min(Math.max(index, 0), slides.length - 1)
    setCurrent(next)
    window.history.replaceState(null, '', `#${next + 1}`)
  }

  const goNext = () => goToSlide(current + 1)
  const goPrev = () => goToSlide(current - 1)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowOverview(false)
        setShowThumbs(false)
        return
      }
      if (showOverview) return

      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault()
        goToSlide(current + 1)
      }
      if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) {
        event.preventDefault()
        goToSlide(current - 1)
      }
      if (event.key === 'Home') {
        event.preventDefault()
        goToSlide(0)
      }
      if (event.key === 'End') {
        event.preventDefault()
        goToSlide(slides.length - 1)
      }
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault()
        setShowOverview(true)
      }
      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        setShowThumbs(value => !value)
      }
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        document.fullscreenElement
          ? document.exitFullscreen?.()
          : document.documentElement.requestFullscreen?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current, showOverview, slides.length])

  useEffect(() => {
    if (!autoplay) return undefined
    const timer = window.setInterval(() => {
      setCurrent((value) => {
        const next = value === slides.length - 1 ? 0 : value + 1
        window.history.replaceState(null, '', `#${next + 1}`)
        return next
      })
    }, 6000)

    return () => window.clearInterval(timer)
  }, [autoplay, slides.length])

  return (
    <div style={styles.page}>
      <style>{`
        .presentation-action:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.18) !important;
        }
        .presentation-action { transition: all 0.2s ease !important; }
        .slide-thumb:hover {
          outline: 3px solid #52b788;
          opacity: 1 !important;
        }
        .overview-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 34px rgba(0,0,0,0.28);
        }
        .overview-card { transition: all 0.2s ease !important; }
      `}</style>

      <header style={styles.header}>
        <Link to="/home" className="presentation-action" style={styles.backLink}>
          <Home size={16} />
          Back to App
        </Link>
        <div style={styles.titleBlock}>
          <strong>EcoPassEU Presentation</strong>
          <span>{activeSlide.label} / {slides.length}</span>
        </div>
        <div style={styles.headerSpacer} aria-hidden="true" />
      </header>

      <main style={styles.stage}>
        <button
          className="presentation-action"
          style={{ ...styles.sideBtn, left: '1.3rem' }}
          onClick={goPrev}
          disabled={current === 0}
          title="Previous slide"
        >
          <ArrowLeft size={22} />
        </button>

        <section style={styles.deck} aria-label={activeSlide.label}>
          <img src={activeSlide.src} alt={activeSlide.label} style={styles.slideImage} />
        </section>

        <button
          className="presentation-action"
          style={{ ...styles.sideBtn, right: '1.3rem' }}
          onClick={goNext}
          disabled={current === slides.length - 1}
          title="Next slide"
        >
          <ArrowRight size={22} />
        </button>
      </main>

      {showThumbs && (
        <div style={styles.thumbRail}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className="slide-thumb"
              style={{
                ...styles.thumb,
                opacity: index === current ? 1 : 0.62,
                outline: index === current ? '3px solid #52b788' : 'none',
              }}
              onClick={() => goToSlide(index)}
              title={slide.label}
            >
              <img src={slide.src} alt="" style={styles.thumbImage} />
              <span style={styles.thumbNumber}>{slide.id}</span>
            </button>
          ))}
        </div>
      )}

      <nav style={styles.controls} aria-label="Presentation controls">
        <button className="presentation-action" style={styles.controlBtn} onClick={goPrev} disabled={current === 0}>
          <ArrowLeft size={16} />
          Prev
        </button>
        <output style={styles.indicator}>{current + 1} / {slides.length}</output>
        <button className="presentation-action" style={styles.controlBtn} onClick={goNext} disabled={current === slides.length - 1}>
          Next
          <ArrowRight size={16} />
        </button>
        <button className="presentation-action" style={styles.iconBtn} onClick={() => setShowThumbs(value => !value)} title="Toggle thumbnails">
          <Grid3X3 size={16} />
        </button>
        <button className="presentation-action" style={styles.iconBtn} onClick={() => setShowOverview(true)} title="Open overview">
          Grid
        </button>
        <button className="presentation-action" style={styles.iconBtn} onClick={() => setAutoplay(value => !value)} title="Autoplay">
          {autoplay ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          className="presentation-action"
          style={styles.iconBtn}
          onClick={() => document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.()}
          title="Fullscreen"
        >
          <Maximize2 size={16} />
        </button>
      </nav>

      <div style={styles.progressTrack} aria-hidden="true">
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>

      {showOverview && (
        <section style={styles.overview} aria-label="Slide overview">
          <div style={styles.overviewHeader}>
            <h1 style={styles.overviewTitle}>Slide Overview</h1>
            <button className="presentation-action" style={styles.closeBtn} onClick={() => setShowOverview(false)}>
              Close
            </button>
          </div>
          <div style={styles.overviewGrid}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className="overview-card"
                style={styles.overviewCard}
                onClick={() => {
                  goToSlide(index)
                  setShowOverview(false)
                }}
              >
                <img src={slide.src} alt={slide.label} style={styles.overviewImage} />
                <span style={styles.overviewNumber}>{slide.id}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c1110 0%, #17211d 54%, #0f1312 100%)',
    color: 'white',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0 1.3rem',
    background: 'rgba(15, 22, 19, 0.78)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(14px)',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    minHeight: '36px',
    padding: '0 0.85rem',
    color: 'white',
    background: 'rgba(255,255,255,0.11)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.86rem',
    fontWeight: 700,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.15rem',
    fontSize: '0.9rem',
  },
  headerSpacer: {
    width: '112px',
    minHeight: '36px',
  },
  stage: {
    position: 'relative',
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    padding: '2rem 5.2rem 5.6rem',
  },
  deck: {
    width: 'min(100%, calc((100vh - 172px) * 16 / 9))',
    aspectRatio: '16 / 9',
    background: '#fff',
    boxShadow: '0 28px 90px rgba(0,0,0,0.55)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    userSelect: 'none',
  },
  sideBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
  },
  controls: {
    position: 'fixed',
    left: '50%',
    bottom: '18px',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.5rem',
    background: 'rgba(14, 18, 16, 0.82)',
    border: '1px solid rgba(255,255,255,0.16)',
    backdropFilter: 'blur(14px)',
    zIndex: 30,
  },
  controlBtn: {
    height: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0 0.72rem',
    border: 'none',
    borderRadius: '7px',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  iconBtn: {
    height: '36px',
    minWidth: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.65rem',
    border: 'none',
    borderRadius: '7px',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  indicator: {
    minWidth: '58px',
    textAlign: 'center',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #52b788, #d8f3dc)',
    transition: 'width 0.25s ease',
  },
  thumbRail: {
    position: 'fixed',
    left: '50%',
    bottom: '74px',
    transform: 'translateX(-50%)',
    width: 'min(1080px, calc(100vw - 28px))',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.55rem',
    overflowX: 'auto',
    background: 'rgba(9, 13, 12, 0.75)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    zIndex: 26,
  },
  thumb: {
    position: 'relative',
    flex: '0 0 112px',
    aspectRatio: '16 / 9',
    border: 0,
    padding: 0,
    background: '#fff',
    cursor: 'pointer',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  thumbNumber: {
    position: 'absolute',
    left: '4px',
    bottom: '4px',
    padding: '2px 5px',
    background: 'rgba(0,0,0,0.72)',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  overview: {
    position: 'fixed',
    inset: 0,
    padding: '2.2rem',
    background: 'rgba(6, 10, 9, 0.95)',
    overflow: 'auto',
    zIndex: 80,
  },
  overviewHeader: {
    width: 'min(1260px, 100%)',
    margin: '0 auto 1.3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewTitle: {
    margin: 0,
    fontSize: '1.25rem',
  },
  closeBtn: {
    height: '36px',
    padding: '0 1rem',
    border: 0,
    borderRadius: '8px',
    background: 'white',
    color: '#172019',
    fontWeight: 700,
    cursor: 'pointer',
  },
  overviewGrid: {
    width: 'min(1260px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '1rem',
  },
  overviewCard: {
    position: 'relative',
    padding: 0,
    border: '1px solid rgba(255,255,255,0.18)',
    background: '#fff',
    cursor: 'pointer',
  },
  overviewImage: {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    display: 'block',
  },
  overviewNumber: {
    position: 'absolute',
    left: '8px',
    bottom: '8px',
    padding: '3px 7px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
}

export default Presentation
