'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import styles from './CreatorsSection.module.css'

// Same Three.js icosahedron the gem hero uses, lazy-loaded so the ~150 KB
// gzipped Three bundle stays off the critical path. A second instance here
// gives the creators section a real glass orb (same material, same glare)
// rather than a flat SVG that reads as a downgrade.
const HeroCrystal = dynamic(() => import('./HeroCrystal'), { ssr: false })

/**
 * CreatorsSection — second movement of the landing, below the gem hero.
 *
 * Editorial founder spread. Layout: eyebrow + serif-italic display
 * headline spanning the top, then a two-column grid below — twin
 * portraits on the left, a personal first-person bio on the right.
 *
 * Visual tokens mirror the gem hero (.hero in landing.module.css) so
 * the page reads as one continuous publication, not two stitched-
 * together templates. Portraits live at /public/creators/*.jpg so
 * Luke can drop new photos in without touching code.
 *
 * Entrance animation: IntersectionObserver fades the section up when
 * it enters the viewport. No animation library — single observer,
 * one-shot trigger, respects prefers-reduced-motion via CSS.
 */
export default function CreatorsSection() {
  const ref = useRef<HTMLElement>(null)
  const particlesRef = useRef<HTMLDivElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Drifting particles across the FULL section height. translate
  // percentages move by % of the SPAN's own height (so % is useless for
  // big drift distances — the dot is 1.5px tall, "translate -100%" =
  // -1.5px). Use vh units so the drift distance is viewport-relative
  // and visibly large — same approach the hero's LandingParticles uses.
  useEffect(() => {
    const root = particlesRef.current
    if (!root) return

    const N = window.innerWidth < 640 ? 14 : 26
    const created: HTMLSpanElement[] = []

    for (let i = 0; i < N; i++) {
      const s = document.createElement('span')
      const x = Math.random() * 100
      const startY = 65 + Math.random() * 35 // bottom 35% of section
      const dur = 18 + Math.random() * 24
      const delay = -Math.random() * dur
      const dx = Math.random() * 30 - 15 + 'px'
      const dy = -(60 + Math.random() * 50) + 'vh' // drift up 60-110vh
      const size = 1.2 + Math.random() * 1.4
      s.style.left = x + '%'
      s.style.top = startY + '%'
      s.style.width = s.style.height = size + 'px'
      s.style.animationDuration = dur + 's'
      s.style.animationDelay = delay + 's'
      s.style.setProperty('--dx', dx)
      s.style.setProperty('--dy', dy)
      root.appendChild(s)
      created.push(s)
    }

    return () => {
      created.forEach((s) => s.remove())
    }
  }, [])

  return (
    <section
      ref={ref}
      className={`${styles.creators} ${revealed ? styles.revealed : ''}`}
      data-screen-label="02 Creators"
      aria-labelledby="creators-heading"
    >
      {/* Ambient atmosphere — soft mint glow bleeding up from the gem hero
          above, and a horizon gradient at the top that picks up the dark
          teal-green from the gem hero's mountain band so the seam between
          the two sections dissolves into one continuous night sky. */}
      <div className={styles.atmosphere} aria-hidden />

      {/* Mirrored mountain horizon — exact same SVG paths as the gem hero's
          mountain layer, but flipped vertically and anchored to the top of
          this section. Reads like a pond-reflection of the hero's horizon
          so the two sections feel like one continuous valley instead of a
          hard cut. */}
      <div className={styles.mountainsMirror} aria-hidden>
        <svg viewBox="0 0 1600 420" preserveAspectRatio="none">
          <defs>
            {/* Match the gem hero's mountain gradients EXACTLY — same
                colors, same opacity stops — so the mirrored mountains
                read as a true reflection (not a different-colored
                stripe). The scaleY(-1) on the wrapper flips the visual
                rendering so peaks point down. */}
            <linearGradient id="creators-mt-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d1a17" stopOpacity="0" />
              <stop offset="55%" stopColor="#0d1a17" stopOpacity=".55" />
              <stop offset="100%" stopColor="#0d1a17" stopOpacity=".95" />
            </linearGradient>
            <linearGradient id="creators-mt-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050a09" stopOpacity=".4" />
              <stop offset="60%" stopColor="#050a09" stopOpacity=".95" />
              <stop offset="100%" stopColor="#050a09" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M0,300 L120,230 L210,260 L320,180 L430,220 L560,150 L680,210 L820,170 L960,220 L1100,180 L1240,240 L1380,200 L1500,250 L1600,220 L1600,420 L0,420 Z"
            fill="url(#creators-mt-far)"
          />
          <path
            d="M0,360 L100,320 L220,340 L340,290 L460,330 L590,300 L720,340 L860,310 L1000,350 L1140,310 L1280,355 L1420,320 L1540,360 L1600,340 L1600,420 L0,420 Z"
            fill="url(#creators-mt-near)"
          />
        </svg>
      </div>

      {/* Mirrored mist band — same soft mint-tinted horizontal wash as the
          gem hero's mist, positioned just below the inverted peaks so it
          feathers the join. */}
      <div className={styles.mistMirror} aria-hidden />

      {/* Floating crystal orb — a real Three.js icosahedron, same scene
          and material as the gem hero (just smaller and tucked top-right).
          Two WebGL contexts cost a bit of GPU but keeps the gem language
          consistent — no flat SVG that reads as a downgrade. */}
      <div className={styles.orb} aria-hidden>
        {/* Dodecahedron: 12 regular pentagonal faces — more symmetrical
            silhouette than the gem hero's icosahedron. Same material,
            same V engraving, same Three.js scene — only geometry +
            wrapper size differ. */}
        <HeroCrystal shape="dodecahedron" />
      </div>

      {/* Drifting particles — same drift mechanic as the gem hero, but
          spanning the FULL section height (the hero's <LandingParticles />
          uses vh positioning that gets clipped to the top viewport when
          the section is taller than 100vh). Spans appended client-side
          after mount, no SSR mismatch. */}
      <div className={styles.particles} ref={particlesRef} aria-hidden />

      {/* Trend lightning — subtle mint sparkline in the background that
          draws up with a crackle of flickers, holds briefly, then fades.
          Symbolic of "your life upgraded": mostly trending up, with a
          couple small dips. One cycle every ~30s so it reads as a
          discovery moment, not a constant distraction. Pure SVG + CSS
          keyframes, no JS animation loop. */}
      <div className={styles.trendLightning} aria-hidden>
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none">
          <defs>
            <filter id="trend-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Dotted vertices — barely visible, hint at "data points" */}
          <g className={styles.trendDots}>
            {[
              [0, 170], [80, 155], [160, 165], [240, 140], [320, 120],
              [400, 130], [480, 105], [560, 95],  [640, 100], [720, 75],
              [800, 65], [880, 80],  [960, 50],  [1000, 35],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2" fill="#A7F3D0" />
            ))}
          </g>
          {/* The trending line itself — draws via stroke-dashoffset */}
          <path
            className={styles.trendPath}
            d="M 0,170 L 80,155 L 160,165 L 240,140 L 320,120 L 400,130 L 480,105 L 560,95 L 640,100 L 720,75 L 800,65 L 880,80 L 960,50 L 1000,35"
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#trend-glow)"
          />
        </svg>
      </div>

      <div className={styles.shell}>
        {/* Top header — eyebrow + display headline */}
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowRule} />
            The twins behind it
          </div>
          <h2 id="creators-heading" className={styles.headline}>
            Built for <em>us</em>,
            <br />
            first.
          </h2>
        </header>

        {/* Two-column body — portraits + tetrahedron orb (left), bio (right) */}
        <div className={styles.body}>
          {/* Left column wrapper — portraits stack on top, optional
              tetrahedron crystal below (only renders when the bio is
              expanded so it fills the empty left space alongside the
              expanded bio paragraphs). */}
          <div className={styles.leftCol}>
          {/* Portrait stack */}
          <div className={styles.portraits}>
            <figure className={styles.portrait}>
              <div className={styles.portraitFrame}>
                <img
                  src="/creators/luke.jpg"
                  alt="Luke Lecot"
                  loading="lazy"
                  className={styles.portraitImg}
                />
                <span className={styles.portraitCorner} aria-hidden>
                  ·01
                </span>
              </div>
              <figcaption className={styles.portraitCaption}>
                <span className={styles.portraitName}>Luke</span>
                <span className={styles.portraitMeta}>20 · engineering, fitness</span>
                <a
                  href="https://instagram.com/ohwisey"
                  className={styles.portraitHandle}
                  target="_blank"
                  rel="noreferrer"
                >
                  @ohwisey ↗
                </a>
              </figcaption>
            </figure>

            <figure className={styles.portrait}>
              <div className={styles.portraitFrame}>
                <img
                  src="/creators/liam.jpg"
                  alt="Liam Lecot"
                  loading="lazy"
                  className={styles.portraitImg}
                />
                <span className={styles.portraitCorner} aria-hidden>
                  ·02
                </span>
              </div>
              <figcaption className={styles.portraitCaption}>
                <span className={styles.portraitName}>Liam</span>
                <span className={styles.portraitMeta}>20 · product, content</span>
                <a
                  href="https://instagram.com/rowanthislebrooke"
                  className={styles.portraitHandle}
                  target="_blank"
                  rel="noreferrer"
                >
                  @rowanthislebrooke ↗
                </a>
              </figcaption>
            </figure>
          </div>

          {/* Third gem in the family — tetrahedron (4 faces, sharpest
              of the trio). Only mounted when the bio is expanded so it
              fills the empty left space alongside the long bio
              paragraphs; un-mounted otherwise so we don't pay the
              Three.js cost when nobody can see it. */}
          {expanded && (
            <div
              className={`${styles.leftOrb} ${expanded ? styles.leftOrbVisible : ''}`}
              aria-hidden
            >
              <HeroCrystal shape="tetrahedron" />
            </div>
          )}
          </div>

          {/* Biography column */}
          <div className={styles.bio}>
            <div className={styles.bioMeta}>Meet the founders</div>

            {/* Pull quote — the eye-catcher. Distilled from Luke's P1 into
                four sharp staccato beats. */}
            <blockquote className={styles.pullQuote}>
              Two brothers. Same birthday. Same obsession. Making things
              that <em>work</em>.
            </blockquote>

            <button
              type="button"
              className={`${styles.expandToggle} ${expanded ? styles.expandToggleOpen : ''}`}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="creators-story"
            >
              <span>{expanded ? 'Show less' : 'Read our story'}</span>
              <span className={styles.expandArrow} aria-hidden>↓</span>
            </button>

            {/* The rest of the bio — collapsed by default, fades + expands
                with a grid-template-rows trick (smooth, no JS height math). */}
            <div
              id="creators-story"
              className={`${styles.bioCollapsible} ${expanded ? styles.bioCollapsibleOpen : ''}`}
            >
              <div className={styles.bioCollapsibleInner}>
                <div className={styles.bioBody}>
                  <p>
                    Organization is everything. You can&apos;t think straight
                    in clutter. So we built the apps we needed. Not to get
                    ahead of anyone, but{' '}
                    <span className={styles.bioMark}>ahead of ourselves</span>.
                  </p>

                  <p>
                    It worked. We got in the{' '}
                    <span className={styles.bioMark}>
                      best shape of our lives
                    </span>
                    . More time to study, a clearer mind. Eleven
                    subscriptions, gone.
                  </p>

                  <p>
                    Every feature in Vitality is one we built{' '}
                    <span className={styles.bioMark}>for us first</span>. Not
                    to sell. To upgrade our lives.
                  </p>

                  <p>
                    My brother and I use this app{' '}
                    <span className={styles.bioMark}>every single day</span>,{' '}
                    <span className={styles.bioMark}>alongside you</span>.
                    Same accounts, same dashboard. So we have a{' '}
                    <span className={styles.bioMark}>personal connection</span>{' '}
                    to this product. A real part of our{' '}
                    <span className={styles.bioMark}>everyday life</span>.
                  </p>
                </div>

                <div className={styles.signature}>
                  <span className={styles.signatureMark}>—</span>
                  <span className={styles.signatureNames}>
                    Luke &amp; Liam Wise
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.bioActions}>
              <a
                className={styles.ctaPrimary}
                href="https://www.youtube.com/@ohwisey"
                target="_blank"
                rel="noreferrer"
              >
                Watch us build it <span className={styles.ctaArrow}>→</span>
              </a>
              <a className={styles.ctaGhost} href="/app">
                Open your dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Footer coordinate strip — matches the gem hero's footer language */}
        <footer className={styles.footerStrip}>
          <span>
            <span className={styles.footerDot} />
            Vitality Studio &nbsp;·&nbsp; Issue I
          </span>
          <span className={styles.footerRight}>
            Lausanne &nbsp;·&nbsp; MMXXVI &nbsp;·&nbsp; Twins, est. 2006
          </span>
        </footer>
      </div>
    </section>
  )
}
