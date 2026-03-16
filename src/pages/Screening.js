import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/* ── PC-PTSD-5 (5 items, yes/no) ────────────────────────────── */
const PC_PTSD5 = {
  id: "pc-ptsd5",
  title: "PC-PTSD-5",
  subtitle: "Primary Care PTSD Screen for DSM-5",
  description:
    "This 5-item screen is used by healthcare providers to identify individuals who may benefit from further PTSD evaluation. It is based on DSM-5 criteria.",
  intro:
    "Sometimes things happen to people that are unusually or especially frightening, horrible, or traumatic. Have you ever experienced this kind of event?",
  type: "yesno",
  questions: [
    "Had nightmares about it or thought about it when you did not want to?",
    "Tried hard not to think about it or went out of your way to avoid situations that reminded you of it?",
    "Were constantly on guard, watchful, or easily startled?",
    "Felt numb or detached from others, activities, or your surroundings?",
    "Felt guilty or unable to stop blaming yourself or others for the event or any problems the event may have caused?",
  ],
  scoreKey: (answers) => answers.filter(a => a === "yes").length,
  interpret: (score) => {
    if (score >= 3) return {
      level: "Positive screen",
      colour: "#C4956A",
      msg: "A score of 3 or more suggests a positive screen. This does not mean you have PTSD — it indicates that a full clinical evaluation by a qualified professional would be beneficial.",
    };
    return {
      level: "Negative screen",
      colour: "#7A9B7A",
      msg: "A score below 3 suggests a negative screen. If you are still struggling, please reach out to a healthcare professional.",
    };
  },
  source: "Prins et al. (2016). The Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). Implementation Science.",
};

/* ── PCL-5 (20 items, 0-4 Likert) ───────────────────────────── */
const PCL5 = {
  id: "pcl5",
  title: "PCL-5",
  subtitle: "PTSD Checklist for DSM-5",
  description:
    "A 20-item self-report measure assessing DSM-5 PTSD symptoms experienced in the past month. One of the most widely used PTSD outcome measures in clinical research.",
  intro:
    "Below is a list of problems that people sometimes have in response to a very stressful experience. Please read each problem carefully, then circle one of the numbers to the right to indicate how much you have been bothered by that problem in the past month.",
  type: "likert",
  options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
  questions: [
    "Repeated, disturbing, and unwanted memories of the stressful experience?",
    "Repeated, disturbing dreams of the stressful experience?",
    "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
    "Feeling very upset when something reminded you of the stressful experience?",
    "Having strong physical reactions when something reminded you of the stressful experience (e.g., heart pounding, trouble breathing, sweating)?",
    "Avoiding memories, thoughts, or feelings related to the stressful experience?",
    "Avoiding external reminders of the stressful experience (e.g., people, places, conversations, activities, objects, or situations)?",
    "Trouble remembering important parts of the stressful experience?",
    "Having strong negative beliefs about yourself, other people, or the world (e.g., having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
    "Blaming yourself or someone else for the stressful experience or what happened after it?",
    "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
    "Loss of interest in activities that you used to enjoy?",
    "Feeling distant or cut off from other people?",
    "Trouble experiencing positive feelings (e.g., being unable to have loving feelings for people close to you or feeling numb)?",
    "Irritable behaviour, angry outbursts, or acting aggressively?",
    "Taking too many risks or doing things that could cause you harm?",
    "Being 'superalert' or watchful or on guard?",
    "Feeling jumpy or easily startled?",
    "Having difficulty concentrating?",
    "Trouble falling or staying asleep?",
  ],
  scoreKey: (answers) => answers.reduce((s, a) => s + (parseInt(a) || 0), 0),
  interpret: (score) => {
    if (score >= 33) return {
      level: "Probable PTSD",
      colour: "#C4956A",
      msg: "A score of 33 or above suggests probable PTSD. This screening result should be discussed with a qualified mental health professional for a full clinical assessment.",
    };
    if (score >= 20) return {
      level: "Moderate symptoms",
      colour: "#B8A87A",
      msg: "A score between 20–32 suggests moderate PTSD symptoms. Speaking with a mental health professional about your experiences would be beneficial.",
    };
    return {
      level: "Minimal symptoms",
      colour: "#7A9B7A",
      msg: "A score below 20 suggests minimal PTSD symptoms. If you are still struggling, please reach out to a healthcare professional.",
    };
  },
  source: "Weathers et al. (2013). The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD.",
};

/* ── COMPONENT ───────────────────────────────────────────────── */
function Screening({ user, setPage }) {
  const [selected, setSelected]     = useState(null); // null | "pc-ptsd5" | "pcl5"
  const [hasTrauma, setHasTrauma]   = useState(null); // for PC-PTSD-5 intro
  const [answers, setAnswers]       = useState([]);
  const [result, setResult]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  const test = selected === "pc-ptsd5" ? PC_PTSD5 : selected === "pcl5" ? PCL5 : null;

  const startTest = (id) => {
    setSelected(id);
    setHasTrauma(null);
    setAnswers([]);
    setResult(null);
    setSaved(false);
  };

  const handleAnswer = (idx, val) => {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
  };

  const allAnswered = test && (
    test.type === "yesno"
      ? answers.length === test.questions.length && answers.every(a => a === "yes" || a === "no")
      : answers.length === test.questions.length && answers.every(a => a !== undefined && a !== null && a !== "")
  );

  const handleSubmit = () => {
    const score = test.scoreKey(answers);
    const interp = test.interpret(score);
    setResult({ score, ...interp });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "screenings"), {
        userId:    user.uid,
        testId:    test.id,
        testTitle: test.title,
        score:     result.score,
        level:     result.level,
        answers:   answers,
        date:      serverTimestamp(),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
      alert("Could not save. Please try again.");
    }
    setSaving(false);
  };

  /* ── RESULT SCREEN ── */
  if (result) {
    return (
      <div className="dashboard">
        <div className="top-bar">
          <h1 className="page-title">{test.title} — Results</h1>
          <button onClick={() => setPage("dashboard")}>← Dashboard</button>
        </div>

        <div className="screening-result-card">
          <div className="result-disclaimer">
            ⚠️ This screening result is <strong>not a diagnosis</strong>. It is a tool to help you
            understand your experiences and decide whether to seek professional support.
          </div>

          <div className="result-score-row">
            <div className="result-score-circle" style={{ borderColor: result.colour }}>
              <span className="result-score-num">{result.score}</span>
              <span className="result-score-label">score</span>
            </div>
            <div className="result-interp">
              <div className="result-level" style={{ color: result.colour }}>{result.level}</div>
              <p>{result.msg}</p>
            </div>
          </div>

          {!saved ? (
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "💾 Save to my history"}
            </button>
          ) : (
            <div className="saved-confirmation">✅ Saved to your screening history.</div>
          )}

          <div className="result-resources">
            <h4>Next steps</h4>
            <div className="result-resource-chips">
              <a href="tel:988"              className="resource-chip">📞 988 Crisis Lifeline</a>
              <a href="sms:741741?body=HOME" className="resource-chip">💬 Crisis Text Line</a>
              <a href="tel:18009506264"      className="resource-chip">📞 NAMI Helpline</a>
            </div>
          </div>

          <p className="result-source"><em>Source: {test.source}</em></p>

          <div className="result-actions">
            <button className="btn-secondary-sm" onClick={() => startTest(test.id)}>Retake Test</button>
            <button className="btn-secondary-sm" onClick={() => { setSelected(null); setResult(null); }}>Back to Screening</button>
            <button className="btn-primary-sm"   onClick={() => setPage("dashboard")}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── TEST IN PROGRESS ── */
  if (test) {
    // PC-PTSD-5 needs trauma intro question first
    if (test.type === "yesno" && hasTrauma === null) {
      return (
        <div className="dashboard">
          <div className="top-bar">
            <h1 className="page-title">{test.title}</h1>
            <button onClick={() => setPage("dashboard")}>← Dashboard</button>
          </div>
          <div className="screening-card-wrap">
            <div className="screen-intro-card">
              <p className="screen-intro-text">{test.intro}</p>
              <div className="yn-btns">
                <button className="yn-btn yn-yes" onClick={() => setHasTrauma(true)}>Yes</button>
                <button className="yn-btn yn-no"  onClick={() => setHasTrauma(false)}>No</button>
              </div>
            </div>
            {hasTrauma === false && (
              <div className="screen-skip-msg">
                If you answered No, there is no need to continue this screening.
                If you're struggling for any reason, please consider reaching out to a professional.
                <div style={{ marginTop: 16 }}>
                  <button className="btn-ghost-sm" onClick={() => setSelected(null)}>← Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard">
        <div className="top-bar">
          <h1 className="page-title">{test.title}</h1>
          <button onClick={() => setSelected(null)}>← Back</button>
        </div>

        <div className="screening-card-wrap">
          <div className="screen-test-meta">
            <h3>{test.subtitle}</h3>
            <p>{test.intro}</p>
            <div className="screen-disclaimer-inline">
              This is a self-screening tool only, not a clinical diagnosis.
            </div>
          </div>

          <div className="screen-questions">
            {test.questions.map((q, i) => (
              <div
                className={`screen-question${answers[i] !== undefined && answers[i] !== "" ? " answered" : ""}`}
                key={i}
              >
                <div className="q-num-row">
                  <span className="q-num">{i + 1}</span>
                  <p className="q-text">{q}</p>
                </div>
                {test.type === "yesno" ? (
                  <div className="yn-options">
                    {["yes", "no"].map(opt => (
                      <button
                        key={opt}
                        className={`yn-option-btn${answers[i] === opt ? " selected" : ""}`}
                        onClick={() => handleAnswer(i, opt)}
                        aria-pressed={answers[i] === opt}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="likert-options">
                    {test.options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={`likert-btn${answers[i] === String(oi) ? " selected" : ""}`}
                        onClick={() => handleAnswer(i, String(oi))}
                        aria-pressed={answers[i] === String(oi)}
                      >
                        <span className="likert-num">{oi}</span>
                        <span className="likert-label">{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="screen-submit-row">
            <div className="screen-progress">
              {answers.filter(a => a !== undefined && a !== "").length} / {test.questions.length} answered
            </div>
            <button
              className="btn-submit"
              disabled={!allAnswered}
              onClick={handleSubmit}
            >
              Submit &amp; See Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── TEST CHOOSER ── */
  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">PTSD Screening</h1>
        <button onClick={() => setPage("dashboard")}>← Dashboard</button>
      </div>

      <div className="screening-card-wrap">
        <div className="screening-page-disclaimer">
          ⚠️ These tools are for <strong>self-awareness only</strong> — they do not provide a diagnosis.
          Results are saved privately to your account. Always discuss results with a qualified mental health professional.
        </div>

        <div className="screen-chooser">
          {[
            {
              test:  PC_PTSD5,
              time:  "~2 min",
              items: "5 items",
              tags:  ["Yes / No", "DSM-5"],
            },
            {
              test:  PCL5,
              time:  "~5–8 min",
              items: "20 items",
              tags:  ["0–4 scale", "DSM-5", "Clinical standard"],
            },
          ].map(({ test: t, time, items, tags }) => (
            <div className="chooser-card" key={t.id}>
              <div className="chooser-badge">{t.title}</div>
              <h3>{t.subtitle}</h3>
              <p>{t.description}</p>
              <div className="chooser-meta">
                <span>⏱ {time}</span>
                <span>📋 {items}</span>
                {tags.map(tag => <span key={tag} className="chooser-tag">{tag}</span>)}
              </div>
              <button className="btn-rose-sm" onClick={() => startTest(t.id)}>
                Begin {t.title}
              </button>
            </div>
          ))}
        </div>

        <div className="screen-resources-note">
          <h4>Need support right now?</h4>
          <div className="result-resource-chips">
            <a href="tel:988"              className="resource-chip">📞 988 Crisis Lifeline</a>
            <a href="sms:741741?body=HOME" className="resource-chip">💬 Crisis Text Line</a>
            <a href="tel:18009506264"      className="resource-chip">📞 NAMI 1-800-950-6264</a>
            <a href="tel:18006564673"      className="resource-chip">📞 RAINN 1-800-656-4673</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Screening;