import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const LANG = {
  en: {
    hello: (n) => `Hello, ${n} 👋`,
    logout: "Logout",
    cards: [
      { icon:"🧠", title:"AI Companion",       body:"A safe, private space to talk. Share what is on your mind and get compassionate support." },
      { icon:"📋", title:"PTSD Screening",     body:"Take the PC-PTSD-5 or PCL-5 — clinically validated self-assessments, saved to your history." },
      { icon:"💚", title:"Coping Resources",   body:"Breathing, grounding, book recommendations, and calming tools — chosen for your needs." },
      { icon:"📊", title:"Mood Tracker",       body:"Track how you are feeling each day and see your mood journey over time." },
      { icon:"🧘", title:"Guided Meditation",  body:"A 2-minute guided meditation for morning or bedtime — calm your nervous system gently." },
      { icon:"🗺️", title:"Find a Clinic",      body:"Locate nearby mental health clinics and support centres on an interactive map." },
    ],
    open: "Open →",
  },
  zu: {
    hello: (n) => `Sawubona, ${n} 👋`,
    logout: "Phuma",
    cards: [
      { icon:"🧠", title:"Umngane we-AI",         body:"Isikhala esiphephile, samafihlo sokuxoxa. Yabelana nalokho okusenhliziyweni yakho." },
      { icon:"📋", title:"Ukuhlola i-PTSD",        body:"Thatha i-PC-PTSD-5 noma i-PCL-5 — izinhlolovo ezivunyelwe ngokwezehlakalo, zigcinwa emnlandweni wakho." },
      { icon:"💚", title:"Izinsiza Zokumelana",    body:"Ukuphefumula, ukubuyela emhlabeni, izincomo zamahhashi, nezinto ezikhuthazayo." },
      { icon:"📊", title:"Ukulandela Imizwa",      body:"Landela indlela ozizwa ngayo nsuku zonke futhi ubone uhambo lwakho lwemizwa." },
      { icon:"🧘", title:"Ukuzindla Okukhokhiwe",  body:"Ukuzindla kwemizuzu emi-2 yokusasa noma kokulala — khululeka kahle umzimba wakho." },
      { icon:"🗺️", title:"Thola Ikhliniki",       body:"Thola amakhliniki ezempilo yengqondo aseduze nezinkiko zesekelo kumapu omdlalo." },
    ],
    open: "Vula →",
  },
};

const PAGE_KEYS = ["ai", "screening", "coping", "mood", "meditation", "clinics"];

function Dashboard({ user, setUser, setPage, lang = "en", setLang }) {
  const tx = LANG[lang] || LANG.en;
  const firstName = user?.displayName?.split(" ")[0] || "Friend";

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>{tx.hello(firstName)}</h1>
        <div className="topbar-right">
          {/* Global language toggle */}
          <div className="lang-toggle">
            <button className={`lang-btn${lang==="en"?" active":""}`} onClick={() => setLang("en")}>EN</button>
            <button className={`lang-btn${lang==="zu"?" active":""}`} onClick={() => setLang("zu")}>ZU</button>
          </div>
          <button onClick={handleLogout}>{tx.logout}</button>
        </div>
      </div>

      <div className="card-container">
        {tx.cards.map((c, i) => (
          <div
            key={c.title} className="card"
            style={{ cursor:"pointer" }}
            onClick={() => setPage(PAGE_KEYS[i])}
            role="button" tabIndex={0}
            onKeyDown={e => e.key==="Enter" && setPage(PAGE_KEYS[i])}
          >
            <div style={{ fontSize:32, marginBottom:12 }}>{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <button
              className="card-link-btn"
              onClick={e => { e.stopPropagation(); setPage(PAGE_KEYS[i]); }}
            >{tx.open}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;