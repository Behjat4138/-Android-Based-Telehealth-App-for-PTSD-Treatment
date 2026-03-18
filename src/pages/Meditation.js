import { useState, useEffect, useRef } from "react";

const LANG = {
  en: {
    title: "Guided Meditation",
    back: "← Dashboard",
    subtitle: "2-Minute Safe Place Meditation",
    scienceTitle: "Why meditation helps with PTSD",
    scienceBody: "Research shows that daily meditation — especially visualisation and deep breathing — reduces anxiety, lowers heart rate, and calms the fight-or-flight response. For PTSD symptoms like racing heart, flashbacks, and hypervigilance, this practice can be transformative when done consistently.",
    whenTitle: "Best times to practise",
    whenItems: ["🌅 First thing in the morning — sets a calm tone for the day", "🌙 Before sleeping at night — helps quiet an overactive nervous system", "😰 During moments of anxiety — brings you back to safety"],
    chooseMed: "Choose a meditation",
    meds: [
      { id:"safe", emoji:"🏡", title:"Safe Place Visualisation", desc:"Imagine a peaceful, safe place. Breathe gently and let your body relax." },
      { id:"body",  emoji:"🌊", title:"Body Scan & Release", desc:"Move slowly through your body, releasing tension with each breath out." },
      { id:"breath",emoji:"🌸", title:"Breathing & Grounding", desc:"Simple breath awareness to anchor you in the present moment." },
    ],
    startBtn: "Begin Meditation",
    pauseBtn: "Pause",
    resumeBtn: "Resume",
    endBtn: "End Session",
    restartBtn: "Meditate Again",
    doneTitle: "Well done 🌸",
    doneMsg: "You gave yourself 2 minutes of care. Notice how you feel right now — your body, your breath, your presence.",
    doneNote: "Try this every morning or before bed for the greatest benefit.",
    dashBtn: "← Dashboard",
    completeBtn: "That felt good",
  },
  zu: {
    title: "Ukuzindla Okukhokhiwe",
    back: "← Ibhodi",
    subtitle: "Ukuzindla Kwemizuzu Emi-2 Kwendawo Ephephile",
    scienceTitle: "Kungani ukuzindla kusiza ne-PTSD",
    scienceBody: "Ucwaningo lukhombisa ukuthi ukuzindla kwansuku zonke — ikakhulukazi ukucabanga nokuphefumula okujulile — kunciphisa ukukhathazeka, kulahla isivinini senhliziyo, futhi kukhulula impendulo yokulwa noma ukubaleka. Ngezibonakaliso ze-PTSD ezifana nenhliziyo egijimayo, okubuyayo, nokuqaphela ngokweqile, le misebenziyano ingaba yinguquko uma yenziwa ngokuqhubekayo.",
    whenTitle: "Izikhathi ezinhle zokwenza",
    whenItems: ["🌅 Ntambama — kubekisa ithoni elithule losuku", "🌙 Ngaphambi kokulala ebusuku — kusiza ukuthulisa uhlelo lwezinzwa olushisayo", "😰 Ngesikhathi sokukhathazeka — kukubuyisela ekuphepha"],
    chooseMed: "Khetha ukuzindla",
    meds: [
      { id:"safe", emoji:"🏡", title:"Ukucabanga Kwendawo Ephephile", desc:"Cabanga indawo ethulile, ephephile. Phefumula kahle futhi umele umzimba wakho ukhululeke." },
      { id:"body",  emoji:"🌊", title:"Ukuhlola Umzimba Nokukhulula", desc:"Hamba kancane ngomzimba wakho, ukhulula intindezelo ngomoya owukhiphayo." },
      { id:"breath",emoji:"🌸", title:"Ukuphefumula Nokubuyela Emhlabeni", desc:"Ukuqaphela ukuphefumula okulula ukukubopha esikhathini samanje." },
    ],
    startBtn: "Qala Ukuzindla",
    pauseBtn: "Misa",
    resumeBtn: "Qhubeka",
    endBtn: "Qeda Inhloko",
    restartBtn: "Zindla Futhi",
    doneTitle: "Wenza kahle 🌸",
    doneMsg: "Uziphe imizuzu emi-2 yokunakekela. Qaphela indlela ozizwa ngayo manje — umzimba wakho, ukuphefumula kwakho, ukubuya kwakho.",
    doneNote: "Zama lokhu njalo ekuseni noma ngaphambi kokulala ukuze uthole inzuzo enkulu.",
    dashBtn: "← Ibhodi",
    completeBtn: "Kwazizwa kahle",
  },
};

// Script phases for each meditation type (each phase has text + duration seconds)
const SCRIPTS = {
  safe: [
    { text: "Find a comfortable position, sitting or lying down. Gently close your eyes, or soften your gaze downward.", secs: 15 },
    { text: "Take a slow breath in through your nose… and gently breathe out through your mouth. Let your shoulders drop.", secs: 12 },
    { text: "Now imagine a place where you feel completely safe. It might be real or imagined — a beach, a forest, a cosy room, anywhere that feels peaceful to you.", secs: 18 },
    { text: "Look around this safe place in your mind. What do you see? Notice the colours, the light, the shapes around you.", secs: 14 },
    { text: "What do you hear in this place? Perhaps gentle wind, soft water, birdsong, or peaceful silence.", secs: 12 },
    { text: "Feel the ground beneath you in this place. Feel the air on your skin. Let your body fully arrive here.", secs: 14 },
    { text: "Take another slow breath in… and breathe out. You are safe here. Nothing can harm you in this place.", secs: 14 },
    { text: "Let your body release any tension it has been holding. Each breath out, let go a little more.", secs: 14 },
    { text: "Stay here for a moment. You are safe. You are calm. You are enough, exactly as you are.", secs: 16 },
    { text: "Now, gently begin to bring your awareness back to the room around you. Wiggle your fingers and toes. Take one more deep breath.", secs: 14 },
    { text: "When you're ready, slowly open your eyes. Carry this feeling of safety with you into your day.", secs: 13 },
  ],
  body: [
    { text: "Sit or lie comfortably. Close your eyes. Take three slow breaths to arrive in your body.", secs: 15 },
    { text: "Bring your attention to the top of your head. Notice any sensations — warmth, tingling, or nothing at all. That is okay.", secs: 14 },
    { text: "Let your awareness move to your face and jaw. If you notice any tension, take a breath in — and as you breathe out, let it soften.", secs: 14 },
    { text: "Now bring attention to your neck and shoulders. These often hold so much. Breathe in… and as you exhale, let the weight drop.", secs: 14 },
    { text: "Move your awareness down to your chest. Notice your heart beating. Thank it for working so hard for you.", secs: 13 },
    { text: "Bring attention to your belly. With each breath, let it rise and fall freely. There is nothing to hold in here.", secs: 13 },
    { text: "Notice your hands and arms. Open your palms gently. Release anything you've been holding onto.", secs: 13 },
    { text: "Move down to your hips, thighs, and knees. Feel the support beneath you. You are held.", secs: 12 },
    { text: "Finally, bring attention to your feet. Feel the ground. Feel how steady and real the earth is beneath you.", secs: 13 },
    { text: "Take a full breath in, filling your whole body with calm energy… and breathe out, releasing everything you don't need.", secs: 15 },
    { text: "Gently return to the room. Open your eyes slowly. Notice how your body feels right now.", secs: 11 },
  ],
  breath: [
    { text: "Find stillness. Close your eyes. Let your body settle wherever you are.", secs: 12 },
    { text: "Without changing your breath, just notice it. Feel the air come in through your nose, cool and gentle.", secs: 14 },
    { text: "Feel it leave through your nose or mouth, warm and slow. You are breathing. You are alive. You are here.", secs: 14 },
    { text: "Now breathe in slowly for 4 counts… 1… 2… 3… 4… Hold gently… and out for 4… 1… 2… 3… 4…", secs: 18 },
    { text: "Again. In for 4… hold… out for 4. Let each breath be a little slower than the last.", secs: 16 },
    { text: "If your mind wanders — that is completely normal. Just gently bring it back to your breath, without judgment.", secs: 15 },
    { text: "You are safe right now, in this breath. The past is behind you. The future is not yet here. Only this breath exists.", secs: 16 },
    { text: "One more slow breath in… hold… and a long, slow breath out. Let everything go.", secs: 14 },
    { text: "Sit with the stillness for a moment. Notice the quiet inside you.", secs: 14 },
    { text: "When you're ready, gently open your eyes. You are grounded, present, and calm.", secs: 11 },
  ],
};

function Meditation({ user, setPage, lang = "en" }) {
  const tx = LANG[lang] || LANG.en;

  const [chosen, setChosen]     = useState(null);
  const [running, setRunning]   = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [done, setDone]         = useState(false);
  const timerRef                = useRef(null);

  const script = chosen ? SCRIPTS[chosen.id] : [];
  const curPhase = script[phaseIdx] || script[script.length - 1];
  const totalSecs = script.reduce((s, p) => s + p.secs, 0);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          // advance phase
          let acc = 0;
          for (let i = 0; i < script.length; i++) {
            acc += script[i].secs;
            if (next < acc) { setPhaseIdx(i); break; }
            if (i === script.length - 1 && next >= acc) {
              setRunning(false);
              setDone(true);
              clearInterval(timerRef.current);
            }
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]); // eslint-disable-line

  const restart = () => {
    clearInterval(timerRef.current);
    setRunning(false); setPhaseIdx(0); setElapsed(0); setDone(false); setChosen(null);
  };

  const progressPct = totalSecs > 0 ? Math.min(100, (elapsed / totalSecs) * 100) : 0;
  const minsLeft = Math.max(0, Math.ceil((totalSecs - elapsed) / 60));

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">{tx.title}</h1>
        <button onClick={() => setPage("dashboard")}>{tx.back}</button>
      </div>

      {/* Science card */}
      {!running && !done && (
        <div className="med-info-grid">
          <div className="med-info-card">
            <h3>🧠 {tx.scienceTitle}</h3>
            <p>{tx.scienceBody}</p>
          </div>
          <div className="med-info-card">
            <h3>⏰ {tx.whenTitle}</h3>
            <ul className="med-when-list">
              {tx.whenItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Chooser */}
      {!chosen && !done && (
        <div className="med-chooser">
          <h2 className="med-chooser-title">{tx.chooseMed}</h2>
          <div className="med-option-grid">
            {tx.meds.map((m, i) => (
              <button
                key={m.id}
                className="med-option-card"
                onClick={() => { setChosen(tx.meds[i]); setElapsed(0); setPhaseIdx(0); setDone(false); }}
              >
                <span className="med-option-emoji">{m.emoji}</span>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <span className="med-duration-chip">~2 min</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active meditation */}
      {chosen && !done && (
        <div className="med-active-wrap">
          <div className="med-active-card">
            {/* Circle visualiser */}
            <div className={`med-orb${running ? " med-orb--breathing" : ""}`}>
              <span className="med-orb-emoji">{chosen.emoji}</span>
              <span className="med-orb-label">{running ? "breathe" : "ready"}</span>
            </div>

            {/* Script text */}
            <div className="med-script-box" aria-live="polite">
              <p className="med-script-text">{curPhase.text}</p>
            </div>

            {/* Progress */}
            <div className="med-progress-row">
              <div className="med-progress-bar">
                <div className="med-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="med-progress-label">{minsLeft} min left</span>
            </div>

            {/* Controls */}
            <div className="med-controls">
              <button className="btn-ghost-sm" onClick={restart}>{tx.endBtn}</button>
              <button className="btn-sage" onClick={() => setRunning(r => !r)}>
                {running ? tx.pauseBtn : tx.startBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Done screen */}
      {done && (
        <div className="med-done-card">
          <div className="med-done-orb">🌸</div>
          <h2>{tx.doneTitle}</h2>
          <p className="med-done-msg">{tx.doneMsg}</p>
          <p className="med-done-note"><em>{tx.doneNote}</em></p>
          <div className="med-done-btns">
            <button className="btn-ghost-sm" onClick={restart}>{tx.restartBtn}</button>
            <button className="btn-rose-sm" onClick={() => setPage("dashboard")}>{tx.dashBtn}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Meditation;