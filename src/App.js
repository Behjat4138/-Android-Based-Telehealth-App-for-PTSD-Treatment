import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Screening  from "./pages/Screening";
//import LandingPage from "./pages/LandingPage";
import LandingPage from "./pages/LandingPage";

function App() {
  const [user, setUser]               = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState("dashboard");
  // showAuth: true = show login/register, false = show landing page
  const [showAuth, setShowAuth]       = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#FAF6F0" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "#9E8579",
        fontWeight: 300 }}>Loading…</div>
    </div>
  );

  // ── Logged in routes ──────────────────────────────────────
  if (user) {
    if (page === "mood")      return <MoodTracker user={user} setPage={setPage} />;
    if (page === "screening") return <Screening   user={user} setPage={setPage} />;
    return <Dashboard user={user} setUser={setUser} setPage={setPage} />;
  }

  // ── Auth screens ──────────────────────────────────────────
  if (showAuth) {
    return (
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
        <p
          className="switch-text"
          style={{ marginTop: 8, opacity: 0.7 }}
          onClick={() => setShowAuth(false)}
        >
          ← Back to home
        </p>
      </div>
    );
  }

  // ── Landing page (default for logged-out users) ───────────
  return <LandingPage onGetStarted={() => { setShowAuth(true); setIsRegistering(false); }} />;
}

export default App;