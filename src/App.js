import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Dashboard       from "./pages/Dashboard";
import MoodTracker     from "./pages/MoodTracker";
import Screening       from "./pages/Screening";
import LandingPage     from "./pages/LandingPage";
import CopingResources from "./pages/CopingResources";
import AITherapist     from "./pages/AITherapist";
import Meditation      from "./pages/Meditation";
import ClinicMap       from "./pages/ClinicMap";

function App() {
  const [user, setUser]                   = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState("dashboard");
  const [showAuth, setShowAuth]           = useState(false);
  // Global language — "en" | "zu"
  const [lang, setLang]                   = useState("en");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#FAF6F0" }}>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:28, color:"#9E8579", fontWeight:300 }}>
        Loading…
      </div>
    </div>
  );

  // Logged-in routes — pass lang + setLang to every page
  const pageProps = { user, setPage, lang, setLang };

  if (user) {
    if (page === "mood")       return <MoodTracker     {...pageProps} />;
    if (page === "screening")  return <Screening       {...pageProps} />;
    if (page === "coping")     return <CopingResources {...pageProps} />;
    if (page === "ai")         return <AITherapist     {...pageProps} />;
    if (page === "meditation") return <Meditation      {...pageProps} />;
    if (page === "clinics")    return <ClinicMap        {...pageProps} />;
    return <Dashboard {...pageProps} setUser={setUser} />;
  }

  // Auth screens
  if (showAuth) return (
    <div>
      {isRegistering ? (
        <>
          <Register setUser={setUser} />
          <p className="switch-text" onClick={() => setIsRegistering(false)}>
            Already have an account? Login
          </p>
        </>
      ) : (
        <>
          <Login setUser={setUser} />
          <p className="switch-text" onClick={() => setIsRegistering(true)}>
            Create Account
          </p>
        </>
      )}
      <p className="switch-text" style={{ marginTop:8, opacity:0.6 }}
         onClick={() => setShowAuth(false)}>
        ← Back to home
      </p>
    </div>
  );

  return <LandingPage onGetStarted={() => { setShowAuth(true); setIsRegistering(false); }} />;
}

export default App;