import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const LANG = {
  en: {
    hello: (n) => `Hello, ${n} 👋`,
    logout: "Logout",
    cards: [
      { icon:"🧠", title:"AI Companion",        body:"A safe, private space to talk. Share what is on your mind and get compassionate support.", page:"ai" },
      { icon:"📋", title:"PTSD Screening",      body:"Take the PC-PTSD-5 or PCL-5 — clinically validated self-assessments.", page:"screening" },
      { icon:"📊", title:"Screening History",   body:"View all your past screening results, scores, and what they mean.", page:"screening-history" },
      { icon:"💚", title:"Coping Resources",    body:"Breathing, grounding, book recommendations, and calming tools.", page:"coping" },
      { icon:"📓", title:"Mood Tracker",        body:"Track how you are feeling each day and see your mood journey over time.", page:"mood" },
      { icon:"🧘", title:"Guided Meditation",   body:"A 2-minute guided meditation for morning or bedtime — calm your nervous system.", page:"meditation" },
      { icon:"🗺️", title:"Find a Clinic",       body:"Locate nearby mental health clinics and support centres on an interactive map.", page:"clinics" },
    ],
    open: "Open →",
  },
  zu: {
    hello: (n) => `Sawubona, ${n} 👋`,
    logout: "Phuma",
    cards: [
      { icon:"🧠", title:"Umngane we-AI",          body:"Isikhala esiphephile sokuxoxa. Yabelana nalokho okusenhliziyweni yakho.", page:"ai" },
      { icon:"📋", title:"Ukuhlola i-PTSD",         body:"Thatha i-PC-PTSD-5 noma i-PCL-5 — izinhlolovo ezivunyelwe.", page:"screening" },
      { icon:"📊", title:"Umlando Wokuhlola",       body:"Buka imiphumela yakho yokuhlola edlule, amanani, nezincazelo zawo.", page:"screening-history" },
      { icon:"💚", title:"Izinsiza Zokumelana",     body:"Ukuphefumula, ukubuyela emhlabeni, izincomo zamahhashi.", page:"coping" },
      { icon:"📓", title:"Ukulandela Imizwa",       body:"Landela indlela ozizwa ngayo nsuku zonke futhi ubone uhambo lwakho lwemizwa.", page:"mood" },
      { icon:"🧘", title:"Ukuzindla Okukhokhiwe",   body:"Ukuzindla kwemizuzu emi-2 yokusasa noma kokulala.", page:"meditation" },
      { icon:"🗺️", title:"Thola Ikhliniki",        body:"Thola amakhliniki ezempilo yengqondo aseduze kumapu.", page:"clinics" },
    ],
    open: "Vula →",
  },
};

function Dashboard({ user, setUser, setPage, lang = "en", setLang }) {
  const tx = LANG[lang] || LANG.en;
  const firstName = user?.displayName?.split(" ")[0] || "Friend";

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>{tx.hello(firstName)}</h1>
        <div className="topbar-right">
          <div className="lang-toggle">
            <button className={`lang-btn${lang==="en"?" active":""}`} onClick={() => setLang("en")}>EN</button>
            <button className={`lang-btn${lang==="zu"?" active":""}`} onClick={() => setLang("zu")}>ZU</button>
          </div>
          <button onClick={async () => { await signOut(auth); setUser(null); }}>{tx.logout}</button>
        </div>
      </div>

      <div className="card-container">
        {tx.cards.map(c => (
          <div key={c.title} className="card" style={{ cursor:"pointer" }}
            onClick={() => setPage(c.page)} role="button" tabIndex={0}
            onKeyDown={e => e.key==="Enter" && setPage(c.page)}>
            <div style={{ fontSize:32, marginBottom:12 }}>{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <button className="card-link-btn" onClick={e => { e.stopPropagation(); setPage(c.page); }}>{tx.open}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;