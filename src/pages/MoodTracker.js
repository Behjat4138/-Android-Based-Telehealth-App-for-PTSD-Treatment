import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const MOODS = [
  { label: "Joyful",   emoji: "😄", value: 5, color: "#F4C430", bg: "#FFFBEB", cheer: "You're glowing today! ✨" },
  { label: "Good",     emoji: "🙂", value: 4, color: "#9BAF9B", bg: "#F0F7F0", cheer: "Glad you're doing well! 💚" },
  { label: "Okay",     emoji: "😐", value: 3, color: "#C4B5A5", bg: "#FAF6F0", cheer: "Steady goes it. You're here! 🌿" },
  { label: "Sad",      emoji: "😔", value: 2, color: "#A0B4C8", bg: "#F0F4F8", cheer: "It's okay to feel this way. 💙" },
  { label: "Anxious",  emoji: "😰", value: 1, color: "#D4A5A0", bg: "#FFF0EE", cheer: "Take a breath. You are safe. 🌸" },
];

const AVATAR_CHEERS = {
  5: { avatar: "🧚", msg: "You're absolutely shining today!", anim: "bounce" },
  4: { avatar: "🌻", msg: "Doing well — keep that momentum!", anim: "sway" },
  3: { avatar: "🌙", msg: "Neutral days matter too. You showed up!", anim: "float" },
  2: { avatar: "🐻", msg: "Sending you a big warm hug right now.", anim: "float" },
  1: { avatar: "🕊️", msg: "You are brave for checking in. Breathe.", anim: "float" },
};

function MoodTracker({ user, setPage }) {
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood]     = useState(null);
  const [note, setNote]     = useState("");
  const [moods, setMoods]   = useState([]);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [lang, setLang]     = useState("en");

  const t = {
    en: {
      title: "Mood Tracker", howFeeling: "How are you feeling today?",
      addNote: "Add a note (optional)...", notePlaceholder: "What's on your mind?",
      save: "Save Mood", saving: "Saving…", saved: "Saved! ✓",
      history: "Your Mood Journey", noHistory: "No entries yet — log your first mood above!",
      moodTrend: "Mood Trend", back: "← Dashboard",
    },
    zu: {
      title: "Ukulandela Imizwa", howFeeling: "Uzizwa kanjani namuhla?",
      addNote: "Engeza inothi (okokuzithandela)...", notePlaceholder: "Ucabangani?",
      save: "Gcina Imizwa", saving: "Kugcinwa…", saved: "Kugcinwe! ✓",
      history: "Uhambo Lwakho Lwemizwa", noHistory: "Awekho amarekhodi — gcina imizwa yakho yokuqala!",
      moodTrend: "Ukuguquka Kwemizwa", back: "← Ibhodi",
    },
    xh: {
      title: "Ukulandela Iimvakalelo", howFeeling: "Uziva njani namhlanje?",
      addNote: "Yongeza inqaku (okokhetho)...", notePlaceholder: "Ucinga ntoni?",
      save: "Gcina Iimvakalelo", saving: "Kugcinwa…", saved: "Kugcinwe! ✓",
      history: "Uhambo Lwakho Lweemvakalelo", noHistory: "Akukho mingcili — gcina eyokuqala!",
      moodTrend: "Utshintsho Lweemvakalelo", back: "← Ibhodi",
    },
  };
  const tx = t[lang] || t.en;

  const saveMood = async () => {
    if (!mood) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "moods"), {
        userId: user.uid, date, mood: mood.label,
        moodValue: mood.value, note, createdAt: new Date().toISOString(),
      });
      setSaved(true);
      setNote("");
      setTimeout(() => setSaved(false), 2500);
      fetchMoods();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const fetchMoods = async () => {
    try {
      const q = query(
        collection(db, "moods"),
        where("userId", "==", user.uid),
        orderBy("date", "asc")
      );
      const snap = await getDocs(q);
      setMoods(snap.docs.map(d => d.data()));
    } catch (e) {
      // orderBy requires index — fallback without ordering
      try {
        const q2 = query(collection(db, "moods"), where("userId", "==", user.uid));
        const snap2 = await getDocs(q2);
        const data = snap2.docs.map(d => d.data()).sort((a,b) => a.date.localeCompare(b.date));
        setMoods(data);
      } catch (e2) { console.error(e2); }
    }
  };

  useEffect(() => { fetchMoods(); }, []); // eslint-disable-line

  const cheer = mood ? AVATAR_CHEERS[mood.value] : null;

  // Build chart
  const chartData = {
    labels: moods.map(m => m.date),
    datasets: [{
      label: "Mood",
      data: moods.map(m => m.moodValue || MOODS.find(x => x.label === m.mood)?.value || 3),
      borderColor: "#D4A5A0",
      backgroundColor: "rgba(212,165,160,0.15)",
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      pointBackgroundColor: moods.map(m => {
        const match = MOODS.find(x => x.label === m.mood);
        return match ? match.color : "#C4B5A5";
      }),
      pointRadius: 6,
      pointHoverRadius: 9,
    }],
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: {
        label: ctx => {
          const entry = moods[ctx.dataIndex];
          const m = MOODS.find(x => x.label === entry?.mood);
          return ` ${m?.emoji || ""} ${entry?.mood || ""}${entry?.note ? " — " + entry.note : ""}`;
        }
      }
    }},
    scales: {
      y: {
        min: 0.5, max: 5.5, ticks: {
          stepSize: 1,
          callback: v => { const m = MOODS.find(x => x.value === v); return m ? `${m.emoji} ${m.label}` : ""; },
          font: { size: 13 },
        },
        grid: { color: "rgba(196,181,165,0.2)" },
      },
      x: { grid: { color: "rgba(196,181,165,0.15)" }, ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="dashboard">

      {/* TOP BAR */}
      <div className="top-bar">
        <h1 className="page-title">{tx.title}</h1>
        <div className="topbar-right">
          {/* Language toggle — same line */}
          <div className="lang-toggle">
            {["en","zu","xh"].map(l => (
              <button
                key={l}
                className={`lang-btn${lang === l ? " active" : ""}`}
                onClick={() => setLang(l)}
                aria-label={l === "en" ? "English" : l === "zu" ? "Zulu" : "Xhosa"}
              >
                {l === "en" ? "EN" : l === "zu" ? "ZU" : "XH"}
              </button>
            ))}
          </div>
          <button onClick={() => setPage("dashboard")}>{tx.back}</button>
        </div>
      </div>

      {/* Journal purpose card */}
      <div className="mood-purpose-card">
        <div className="mood-purpose-icon">📓</div>
        <div>
          <h3 className="mood-purpose-title">{lang === "zu" ? "Inhloso Yokulandela Imizwa" : "About Mood Tracking"}</h3>
          <p className="mood-purpose-body">
            {lang === "zu"
              ? "Ukulandela imizwa 'kunikeza ulwazi mayelana nezindlela nezinto ezikhuthaza izimo zemizwa, okugqugquzela ukunakekela kwawe ngokuzikhethela futhi kuhlinzeka ngezinsiza zokuphatha impilo yengqondo'. Ngemuva kweviki, igrafu ikhiqizwa ekhombisa izinguquko zemizwa yakho isikhathi esedlule."
              : "Mood tracking: After each week, a mood variation graph is produced to show the trends in your moods over time."
            }
          </p>
        </div>
      </div>

      {/* LOG MOOD CARD */}
      <div className="mood-log-card">
        <h2 className="mood-question">{tx.howFeeling}</h2>

        {/* MOOD PICKER */}
        <div className="mood-picker">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`mood-option${mood?.label === m.label ? " selected" : ""}`}
              style={mood?.label === m.label ? { background: m.bg, borderColor: m.color } : {}}
              onClick={() => { setMood(m); setSaved(false); }}
              aria-pressed={mood?.label === m.label}
              aria-label={m.label}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label-text">{m.label}</span>
              {mood?.label === m.label && (
                <span className="mood-cheer-chip">{m.cheer}</span>
              )}
            </button>
          ))}
        </div>

        {/* AVATAR CHEER */}
        {cheer && (
          <div className={`avatar-cheer anim-${cheer.anim}`} aria-live="polite">
            <span className="cheer-avatar">{cheer.avatar}</span>
            <span className="cheer-msg">{cheer.msg}</span>
          </div>
        )}

        {/* NOTE + DATE ROW */}
        <div className="mood-input-row">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mood-date-input"
            aria-label="Date"
          />
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={tx.notePlaceholder}
            className="mood-note-input"
            rows={2}
            aria-label={tx.addNote}
          />
          <button
            className={`mood-save-btn${saved ? " saved" : ""}`}
            onClick={saveMood}
            disabled={!mood || saving}
            aria-label={tx.save}
          >
            {saving ? tx.saving : saved ? tx.saved : tx.save}
          </button>
        </div>
      </div>

      {/* HISTORY */}
      {moods.length > 0 && (
        <div className="mood-history-section">
          <h2 className="mood-history-title">{tx.history}</h2>

          {/* Chart */}
          <div className="mood-chart-card">
            <h3 className="mood-chart-label">{tx.moodTrend}</h3>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Recent entries */}
          <div className="mood-entries">
            {[...moods].reverse().slice(0, 10).map((m, i) => {
              const match = MOODS.find(x => x.label === m.mood);
              return (
                <div className="mood-entry" key={i} style={{ borderLeftColor: match?.color || "#C4B5A5" }}>
                  <span className="entry-emoji">{match?.emoji || "😐"}</span>
                  <div className="entry-info">
                    <span className="entry-label">{match?.label || m.mood}</span>
                    <span className="entry-date">{m.date}</span>
                    {m.note && <span className="entry-note">"{m.note}"</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodTracker;