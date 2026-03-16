import { useState, useEffect, useRef } from "react";

function LandingPage({ onGetStarted }) {
  // ── Grounding stepper ──────────────────────────────────────
  const [groundStep, setGroundStep] = useState(0);
  const [groundDone, setGroundDone] = useState(false);

  const groundSteps = [
    {
      num: 5, label: "see",
      title: "5 things you can see",
      body: "Let your eyes move slowly around the room. Notice details you usually overlook — light on a surface, the colour of something nearby, the shape of an object.",
      chips: ["A plant", "Light on the wall", "Your hands", "A doorway", "Something colourful"],
    },
    {
      num: 4, label: "touch",
      title: "4 things you can touch",
      body: "Reach out and gently touch something near you. Notice its temperature, texture, and weight — your clothing, a chair arm, the floor beneath your feet.",
      chips: ["Your clothing", "A surface nearby", "The floor", "Your own hands"],
    },
    {
      num: 3, label: "hear",
      title: "3 things you can hear",
      body: "Close your eyes if it feels safe. Tune in to sounds you might not normally notice — distant traffic, your own breathing, a hum from somewhere in the room.",
      chips: ["Birds outside", "Your own breath", "A distant hum", "Ambient sounds"],
    },
    {
      num: 2, label: "smell",
      title: "2 things you can smell",
      body: "Take a slow, gentle inhale through your nose. Notice any scents, however faint — fresh air, something nearby, or simply the neutral air of the room.",
      chips: ["Fresh air", "Something nearby", "Neutral air"],
    },
    {
      num: 1, label: "taste",
      title: "1 thing you can taste",
      body: "Notice any taste present in your mouth. If you have water nearby, take a slow sip and pay attention to the sensation. You have arrived in the present moment.",
      chips: ["Water", "A recent meal", "Neutral taste"],
    },
  ];

  const handleGroundNext = () => {
    if (groundStep < groundSteps.length - 1) {
      setGroundStep(s => s + 1);
    } else {
      setGroundDone(true);
    }
  };
  const handleGroundReset = () => { setGroundStep(0); setGroundDone(false); };

  // ── Box breathing ──────────────────────────────────────────
  const breathPhases = [
    { label: "Inhale",  inner: "breathe in",  secs: 4 },
    { label: "Hold",    inner: "hold",         secs: 4 },
    { label: "Exhale",  inner: "breathe out",  secs: 4 },
    { label: "Rest",    inner: "rest",         secs: 4 },
  ];
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [breathCount, setBreathCount]       = useState(4);
  const breathRef = useRef(null);

  useEffect(() => {
    if (breathRunning) {
      breathRef.current = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhaseIdx(pi => (pi + 1) % breathPhases.length);
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(breathRef.current);
    }
    return () => clearInterval(breathRef.current);
  }, [breathRunning]); // eslint-disable-line

  const resetBreath = () => {
    setBreathRunning(false);
    setBreathPhaseIdx(0);
    setBreathCount(4);
  };

  const currentPhase = breathPhases[breathPhaseIdx];

  return (
    <div className="landing">

      {/* ── DISCLAIMER ── */}
      <div className="disclaimer-banner" role="alert">
        <strong>Important:</strong> This website is not a substitute for professional mental health care.
        If you are in crisis, call or text{" "}
        <a href="tel:988"><strong>988</strong></a> (Suicide &amp; Crisis Lifeline) now.
      </div>

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <span className="landing-logo">PTSD<em>Care</em></span>
        <div className="landing-nav-links">
          <a href="#grounding">Grounding</a>
          <a href="#breathing">Breathing</a>
          <a href="#screening">Screening</a>
          <a href="#resources">Resources</a>
          <button className="btn-rose-sm" onClick={onGetStarted}>Sign In</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="l-hero">
        <div className="l-hero-blobs" aria-hidden="true">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="l-hero-content">
          <div className="eyebrow-chip">A gentle place to begin</div>
          <h1>You are <em>safe</em> here,<br />and you are not alone.</h1>
          <p className="hero-sub">
            Grounding tools, breathing exercises, and clinically validated screening — designed
            with care for those navigating trauma recovery.
          </p>
          <div className="hero-btns">
            <a href="#grounding" className="btn-rose">Begin Grounding</a>
            <button className="btn-ghost" onClick={onGetStarted}>Create Account</button>
          </div>
        </div>
      </section>

      {/* ── SAFE SPACE ── */}
      <section className="l-section l-safe" id="about">
        <div className="l-section-label">About this space</div>
        <h2 className="l-section-title">A place built with <em>care</em></h2>
        <div className="safe-grid">
          <p className="safe-body">
            PTSDCare was created for youth and young adults who have experienced trauma. All tools
            here are grounded in evidence-based therapeutic approaches. Take things at your own
            pace — there is no rush here.
          </p>
          <div className="safe-cards">
            {[
              { icon: "🌿", title: "Go at your own pace",     body: "Every healing journey is different. Take breaks whenever you need." },
              { icon: "🔒", title: "Your privacy matters",    body: "Your mood and screening data is stored securely and belongs only to you." },
              { icon: "🤝", title: "Not a replacement for therapy", body: "These tools complement — but do not replace — professional care." },
            ].map(c => (
              <div className="safe-card" key={c.title}>
                <span className="safe-card-icon" aria-hidden="true">{c.icon}</span>
                <div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROUNDING 5-4-3-2-1 ── */}
      <section className="l-section l-grounding" id="grounding">
        <div className="l-section-label">Evidence-based grounding</div>
        <h2 className="l-section-title">The <em>5-4-3-2-1</em> Technique</h2>
        <p className="l-section-sub">
          Widely used in trauma-informed care and CBT to re-anchor attention to the present moment
          by engaging all five senses.{" "}
          <small>(Commonly used evidence-based technique in trauma therapy practice.)</small>
        </p>

        <div className="ground-stepper">
          {!groundDone ? (
            <>
              <div className="ground-step-header">
                <div className="ground-num">{groundSteps[groundStep].num}</div>
                <div>
                  <h3>things you can <em>{groundSteps[groundStep].label}</em></h3>
                  <p className="ground-sense-note">Step {groundStep + 1} of 5</p>
                </div>
              </div>
              <div className="ground-body">
                <p>{groundSteps[groundStep].body}</p>
                <div className="chip-row">
                  {groundSteps[groundStep].chips.map(c => (
                    <span className="chip" key={c}>{c}</span>
                  ))}
                </div>
              </div>
              <div className="ground-nav">
                <button
                  className="btn-ghost-sm"
                  onClick={() => setGroundStep(s => Math.max(0, s - 1))}
                  style={{ visibility: groundStep === 0 ? "hidden" : "visible" }}
                >← Back</button>
                <div className="step-dots" aria-label="Progress">
                  {groundSteps.map((_, i) => (
                    <button
                      key={i}
                      className={`step-dot${i === groundStep ? " active" : ""}`}
                      onClick={() => setGroundStep(i)}
                      aria-label={`Step ${i + 1}`}
                    />
                  ))}
                </div>
                <button className="btn-rose-sm" onClick={handleGroundNext}>
                  {groundStep === groundSteps.length - 1 ? "Finish ✓" : "Next →"}
                </button>
              </div>
            </>
          ) : (
            <div className="ground-done">
              <div className="ground-done-icon">🌸</div>
              <h3>Well done.</h3>
              <p>Take a moment to notice how you feel right now. You are grounded in the present.</p>
              <button className="btn-ghost-sm" onClick={handleGroundReset}>Start again</button>
            </div>
          )}
        </div>
      </section>

      {/* ── BREATHING ── */}
      <section className="l-section l-breathing" id="breathing">
        <div className="l-section-label">Box breathing exercise</div>
        <h2 className="l-section-title">Breathe with <em>intention</em></h2>
        <div className="breathing-layout">
          <div className="breath-visual">
            <div
              className={`breath-circle ${breathRunning ? "breathing-active" : ""}`}
              aria-label="Breathing circle — follow the expand and contract"
              role="img"
            >
              <div className="breath-ring-outer" />
              <div className="breath-ring-inner">
                <span className="breath-inner-text">
                  {breathRunning ? currentPhase.inner : "breathe"}
                </span>
              </div>
            </div>
            <div className="breath-phase-label" aria-live="polite">
              {breathRunning ? currentPhase.label : "Press start when ready"}
            </div>
            <div className="breath-countdown" aria-live="polite">
              {breathRunning ? breathCount : ""}
            </div>
            <div className="breath-btns">
              <button className="btn-sage" onClick={() => setBreathRunning(r => !r)}>
                {breathRunning ? "Pause" : "Start"}
              </button>
              <button className="btn-ghost-sm" onClick={resetBreath}>Reset</button>
            </div>
          </div>
          <div className="breath-info">
            <h3>Box Breathing (4-4-4-4)</h3>
            <p>
              Box breathing activates the parasympathetic nervous system, helping the body
              feel safer and more regulated. Used by therapists, athletes, and first responders.
            </p>
            <div className="breath-pattern">
              {breathPhases.map(p => (
                <div
                  className={`breath-phase-card${breathRunning && currentPhase.label === p.label ? " active-phase" : ""}`}
                  key={p.label}
                >
                  <span className="phase-secs">{p.secs}s</span>
                  <span className="phase-name">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENING LINKS ── */}
      <section className="l-section" id="screening">
        <div className="l-section-label">Self-assessment tools</div>
        <h2 className="l-section-title">PTSD Screening <em>Tools</em></h2>
        <p className="l-section-sub">
          Clinically validated tools used worldwide. Results are for personal awareness only
          and do not constitute a diagnosis — always discuss with a qualified professional.
        </p>
        <div className="screening-link-cards">
          <div className="screen-link-card">
            <span className="screen-badge badge-rose">PC-PTSD-5</span>
            <h3>Primary Care PTSD Screen</h3>
            <p>A 5-item screen based on DSM-5 PTSD criteria, widely used in primary care settings as an initial screening tool.</p>
            <a
              href="https://www.hiv.uw.edu/page/mental-health-screening/pc-ptsd"
              target="_blank" rel="noopener noreferrer"
              className="btn-outline-link"
            >Open PC-PTSD-5 →</a>
          </div>
          <div className="screen-link-card">
            <span className="screen-badge badge-sage">PCL-5</span>
            <h3>PTSD Checklist for DSM-5</h3>
            <p>A 20-item self-report measure assessing DSM-5 PTSD symptoms — one of the most widely used outcome measures in clinical research.</p>
            <a
              href="https://qxmd.com/calculate/calculator_684/post-traumatic-stress-disorder-pcl-5"
              target="_blank" rel="noopener noreferrer"
              className="btn-outline-link"
            >Open PCL-5 →</a>
          </div>
          <div className="screen-link-card screen-link-card--cta">
            <span className="screen-badge badge-cream">In-App</span>
            <h3>Track Results Over Time</h3>
            <p>Sign in to save your screening results, see trends, and access your full mood history — all in one private, secure place.</p>
            <button className="btn-rose-sm" onClick={onGetStarted}>Sign In to Track</button>
          </div>
        </div>
      </section>

      {/* ── RESOURCES ── */}
      <section className="l-section l-resources" id="resources">
        <div className="l-section-label">Crisis support &amp; helplines</div>
        <h2 className="l-section-title">You don't have to face this <em>alone</em></h2>
        <p className="l-section-sub">
          All resources below are real, current, and available 24/7. Reaching out is a brave step.
        </p>
        <div className="resource-cards">
          {[
            {
              org: "988 Suicide & Crisis Lifeline",
              title: "Call or Text 988",
              body: "Free, confidential support 24/7 across the United States. Multilingual support available.",
              contact: "📞 988",
              href: "tel:988",
            },
            {
              org: "Crisis Text Line",
              title: "Text HOME to 741741",
              body: "Free 24/7 crisis support via text. Connect with a trained counsellor. Ideal if calling feels difficult.",
              contact: "💬 Text 741741",
              href: "sms:741741?body=HOME",
            },
            {
              org: "RAINN",
              title: "National Sexual Assault Hotline",
              body: "Confidential support for survivors and loved ones, 24/7.",
              contact: "📞 1-800-656-4673",
              href: "tel:18006564673",
            },
            {
              org: "NAMI Helpline",
              title: "National Alliance on Mental Illness",
              body: "Free answers to mental health questions and referrals from trained specialists.",
              contact: "📞 1-800-950-6264",
              href: "tel:18009506264",
            },
          ].map(r => (
            <div className="resource-card" key={r.org}>
              <div className="resource-org">{r.org}</div>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
              <a href={r.href} className="resource-btn">{r.contact}</a>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="l-footer-cta">
        <h2>Ready to start your journey?</h2>
        <p>Create a free account to access mood tracking, screening history, and more.</p>
        <button className="btn-rose" onClick={onGetStarted}>Get Started — It's Free</button>
      </section>

      <footer className="l-footer">
        <div className="l-footer-inner">
          <span className="landing-logo" style={{ fontSize: 16 }}>PTSD<em>Care</em></span>
          <p>Not a substitute for professional mental health care. For informational purposes only.</p>
          <p>© 2025 PTSDCare</p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;