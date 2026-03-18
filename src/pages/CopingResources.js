import { useState } from "react";

// ── Topic tree ────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "anxiety",   emoji: "😰", label: "Anxiety & Worry" },
  { id: "sleep",     emoji: "🌙", label: "Sleep Problems" },
  { id: "flashbacks",emoji: "🌀", label: "Flashbacks / Intrusive Thoughts" },
  { id: "anger",     emoji: "🔥", label: "Anger & Frustration" },
  { id: "low",       emoji: "😔", label: "Feeling Low / Numb" },
  { id: "grounding", emoji: "🌿", label: "Just need to feel grounded" },
];

const SUBTOPICS = {
  anxiety:    ["Breathing exercises", "Grounding technique", "Books to read", "Soothing items"],
  sleep:      ["Wind-down exercises", "Books to read", "Sleep aids", "Relaxation tools"],
  flashbacks: ["Grounding technique", "Breathing exercises", "Books to read", "Sensory tools"],
  anger:      ["Release exercises", "Books to read", "Calming tools", "Breathing exercises"],
  low:        ["Mood-lifting activities", "Books to read", "Comfort items", "Breathing exercises"],
  grounding:  ["5-4-3-2-1 technique", "Breathing exercises", "Sensory tools", "Books to read"],
};

// ── Amazon search links (keyword-based, opens Amazon search) ─────────────────
const AMAZON_LINKS = {
  books: {
    anxiety:    { q: "anxiety workbook therapy self help", label: "Anxiety & Worry Books" },
    sleep:      { q: "sleep better insomnia self help book", label: "Sleep & Rest Books" },
    flashbacks: { q: "PTSD trauma recovery self help book", label: "Trauma Recovery Books" },
    anger:      { q: "anger management self help book", label: "Anger Management Books" },
    low:        { q: "depression mood self help book", label: "Mood & Depression Books" },
    grounding:  { q: "mindfulness grounding therapy book", label: "Mindfulness Books" },
  },
  tools: {
    anxiety:    { q: "anxiety relief fidget stress ball calming", label: "Calming Fidget Tools" },
    sleep:      { q: "white noise machine sleep mask blackout", label: "Sleep Aid Essentials" },
    flashbacks: { q: "weighted blanket sensory comfort", label: "Sensory Comfort Items" },
    anger:      { q: "stress ball punching pillow anger release", label: "Anger Release Tools" },
    low:        { q: "self care kit comfort box mood lifting", label: "Self-Care Comfort Kit" },
    grounding:  { q: "grounding mat sensory kit mindfulness", label: "Grounding Sensory Kit" },
  },
};

function amazonUrl(q) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=ptsdcare-20`;
}

// ── Breathing exercise ────────────────────────────────────────────────────────
function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase]     = useState(0);
  const [count, setCount]     = useState(4);

  const phases = [
    { label: "Inhale",      emoji: "🫁", secs: 4 },
    { label: "Hold",        emoji: "⏸",  secs: 4 },
    { label: "Exhale",      emoji: "💨", secs: 4 },
    { label: "Rest",        emoji: "😌", secs: 4 },
  ];

  const toggle = () => {
    if (!running) {
      const iv = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            setPhase(p => (p + 1) % phases.length);
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
      window.__breathIv = iv;
    } else {
      clearInterval(window.__breathIv);
    }
    setRunning(r => !r);
  };

  const reset = () => {
    clearInterval(window.__breathIv);
    setRunning(false); setPhase(0); setCount(4);
  };

  const cur = phases[phase];

  return (
    <div className="resource-exercise-card">
      <h3 className="exercise-title">🫁 Box Breathing (4-4-4-4)</h3>
      <p className="exercise-desc">
        A clinically used technique to calm the nervous system. Breathe in for 4 — hold 4 — out 4 — rest 4.
      </p>
      <div className="breath-circle-mini" style={{ animationPlayState: running ? "running" : "paused" }}>
        <span className="breath-phase-emoji">{cur.emoji}</span>
        <span className="breath-phase-name">{running ? cur.label : "Ready"}</span>
        <span className="breath-count-mini">{running ? count : ""}</span>
      </div>
      <div className="exercise-btns">
        <button className="btn-sage" onClick={toggle}>{running ? "Pause" : "Start"}</button>
        <button className="btn-ghost-sm" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

// ── 5-4-3-2-1 Grounding ───────────────────────────────────────────────────────
function GroundingExercise() {
  const steps = [
    { n: 5, sense: "see",   prompt: "Look slowly around you. Name 5 things you can see.", chips: ["Light on a wall","Your hands","A colour","A shape","A doorway"] },
    { n: 4, sense: "touch", prompt: "Gently touch nearby things. Name 4 textures you feel.", chips: ["Fabric","A surface","The floor","Your own arm"] },
    { n: 3, sense: "hear",  prompt: "Close your eyes. Name 3 sounds you can hear.", chips: ["Your breathing","Distant hum","Outside noise"] },
    { n: 2, sense: "smell", prompt: "Slowly inhale. Name 2 things you can smell.", chips: ["Fresh air","Something nearby"] },
    { n: 1, sense: "taste", prompt: "Notice any taste present in your mouth.", chips: ["Neutral","Water","Something subtle"] },
  ];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className="resource-exercise-card">
      <h3 className="exercise-title">🌿 5-4-3-2-1 Grounding</h3>
      {!done ? (
        <>
          <div className="ground-step-mini">
            <div className="ground-num-mini">{steps[step].n}</div>
            <p className="ground-prompt">{steps[step].prompt}</p>
          </div>
          <div className="chip-row" style={{ margin: "12px 0" }}>
            {steps[step].chips.map(c => <span key={c} className="chip">{c}</span>)}
          </div>
          <div className="exercise-btns">
            {step > 0 && <button className="btn-ghost-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
            <button className="btn-rose-sm" onClick={() => step < steps.length - 1 ? setStep(s => s+1) : setDone(true)}>
              {step === steps.length - 1 ? "Finish ✓" : "Next →"}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign:"center", padding: "20px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🌸</div>
          <p style={{ color: "var(--text-mid)", fontWeight: 300 }}>You are grounded in the present moment.</p>
          <button className="btn-ghost-sm" style={{ marginTop: 14 }} onClick={() => { setStep(0); setDone(false); }}>Try again</button>
        </div>
      )}
    </div>
  );
}

// ── Amazon card ───────────────────────────────────────────────────────────────
function AmazonCard({ topicId, type }) {
  const data = AMAZON_LINKS[type][topicId];
  if (!data) return null;
  const icon = type === "books" ? "📚" : "🛍";
  const tagline = type === "books"
    ? "Evidence-based books that therapists recommend for this."
    : "Therapist-suggested physical tools that many people find helpful.";

  return (
    <div className="amazon-card">
      <div className="amazon-card-header">
        <span className="amazon-icon">{icon}</span>
        <div>
          <h4 className="amazon-title">{data.label}</h4>
          <p className="amazon-tagline">{tagline}</p>
        </div>
      </div>
      <a
        href={amazonUrl(data.q)}
        target="_blank"
        rel="noopener noreferrer"
        className="amazon-btn"
      >
        Browse on Amazon →
      </a>
      <p className="amazon-note">
        ℹ️ Opens Amazon search in a new tab. PTSDCare is not affiliated with Amazon.
        Always read reviews and consult a professional before purchasing.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function CopingResources({ user, setPage }) {
  const [topic, setTopic]   = useState(null); // selected main topic id
  const [sub, setSub]       = useState(null); // selected subtopic string

  const handleTopic = (id) => { setTopic(id); setSub(null); };
  const handleSub   = (s)  => setSub(s);
  const handleBack  = ()   => { if (sub) { setSub(null); } else { setTopic(null); } };

  // Determine what to show based on sub
  const showBreathing = sub && sub.toLowerCase().includes("breathing");
  const showGrounding = sub && (sub.toLowerCase().includes("grounding") || sub.toLowerCase().includes("5-4-3-2-1"));
  const showBooks     = sub && sub.toLowerCase().includes("book");
  const showAmazonTools = sub && (
    sub.toLowerCase().includes("tool") ||
    sub.toLowerCase().includes("item") ||
    sub.toLowerCase().includes("aid") ||
    sub.toLowerCase().includes("kit") ||
    sub.toLowerCase().includes("mat") ||
    sub.toLowerCase().includes("pillow") ||
    sub.toLowerCase().includes("comfort")
  );
  const showMoodActivities = sub && sub.toLowerCase().includes("mood");
  const showReleaseExercise = sub && (sub.toLowerCase().includes("release") || sub.toLowerCase().includes("wind-down"));

  const topicObj = TOPICS.find(t => t.id === topic);
  const subs = topic ? SUBTOPICS[topic] : [];

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">Coping Resources</h1>
        <button onClick={() => setPage("dashboard")}>← Dashboard</button>
      </div>

      <div className="coping-wrap">

        {/* ── STEP 1 — NO TOPIC YET ── */}
        {!topic && (
          <>
            <div className="coping-greeting-card">
              <div className="coping-avatar">🌿</div>
              <div>
                <h2 className="coping-greeting-title">How can I help you today?</h2>
                <p className="coping-greeting-sub">
                  Choose what you're dealing with and I'll suggest the right tools for you.
                </p>
              </div>
            </div>
            <div className="coping-topic-grid">
              {TOPICS.map(t => (
                <button key={t.id} className="coping-topic-btn" onClick={() => handleTopic(t.id)}>
                  <span className="coping-topic-emoji">{t.emoji}</span>
                  <span className="coping-topic-label">{t.label}</span>
                  <span className="coping-topic-arrow">→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2 — TOPIC CHOSEN, PICK SUBTOPIC ── */}
        {topic && !sub && (
          <>
            <div className="coping-breadcrumb">
              <button className="coping-back-btn" onClick={handleBack}>← Back</button>
              <span>{topicObj?.emoji} {topicObj?.label}</span>
            </div>
            <div className="coping-greeting-card">
              <div className="coping-avatar">{topicObj?.emoji}</div>
              <div>
                <h2 className="coping-greeting-title">What kind of help do you need?</h2>
                <p className="coping-greeting-sub">Pick whatever feels right for you right now.</p>
              </div>
            </div>
            <div className="coping-sub-grid">
              {subs.map(s => (
                <button key={s} className="coping-sub-btn" onClick={() => handleSub(s)}>
                  <span>{s}</span>
                  <span className="coping-topic-arrow">→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 3 — SHOW CONTENT ── */}
        {topic && sub && (
          <>
            <div className="coping-breadcrumb">
              <button className="coping-back-btn" onClick={handleBack}>← Back</button>
              <span>{topicObj?.emoji} {topicObj?.label} › {sub}</span>
            </div>

            <div className="coping-content">

              {showBreathing && <BreathingExercise />}
              {showGrounding && <GroundingExercise />}

              {showReleaseExercise && (
                <div className="resource-exercise-card">
                  <h3 className="exercise-title">🏃 Physical Release Exercise</h3>
                  <p className="exercise-desc">
                    When emotions are intense, physical movement helps discharge nervous energy safely.
                  </p>
                  <ul className="exercise-list">
                    <li>🚶 Take a brisk 5-minute walk</li>
                    <li>🤸 Do 10 jumping jacks to shake out tension</li>
                    <li>💪 Tense every muscle for 5 seconds, then fully release</li>
                    <li>🌬 Exhale forcefully through your mouth 5 times</li>
                    <li>🧘 End with 3 slow belly breaths</li>
                  </ul>
                </div>
              )}

              {showMoodActivities && (
                <div className="resource-exercise-card">
                  <h3 className="exercise-title">☀️ Mood-Lifting Activities</h3>
                  <p className="exercise-desc">Small acts that gently shift emotional state — no pressure, just invitations.</p>
                  <ul className="exercise-list">
                    <li>☀️ Sit near a window or step outside for 5 minutes</li>
                    <li>🎵 Play one song that has felt comforting before</li>
                    <li>📝 Write 3 things — however small — that felt okay today</li>
                    <li>🫖 Make yourself a warm drink slowly and mindfully</li>
                    <li>📞 Send a short message to someone you trust</li>
                  </ul>
                </div>
              )}

              {showBooks && <AmazonCard topicId={topic} type="books" />}
              {showAmazonTools && <AmazonCard topicId={topic} type="tools" />}

              {/* Always show a gentle reminder */}
              <div className="coping-reminder-card">
                <span className="coping-reminder-icon">💙</span>
                <div>
                  <h4>Remember</h4>
                  <p>
                    These tools support your healing — they don't replace professional care.
                    If you're struggling, please reach out to a therapist or counsellor.
                  </p>
                  <div className="result-resource-chips" style={{ marginTop: 10 }}>
                    <a href="tel:988" className="resource-chip">📞 988 Lifeline</a>
                    <a href="sms:741741?body=HOME" className="resource-chip">💬 Crisis Text</a>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CopingResources;