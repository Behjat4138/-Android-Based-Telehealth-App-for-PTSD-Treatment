import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard({ user, setUser, setPage }) {

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const cards = [
    {
      icon: "🧠",
      title: "AI Therapist",
      body: "Conversational support — coming soon.",
      action: null,
    },
    {
      icon: "📋",
      title: "PTSD Screening",
      body: "Take the PC-PTSD-5 or PCL-5 — clinically validated self-assessments.",
      action: () => setPage("screening"),
    },
    {
      icon: "📚",
      title: "Coping Resources",
      body: "Guided coping strategies and grounding techniques.",
      action: null,
    },
    {
      icon: "📊",
      title: "Mood Tracker",
      body: "Track how you're feeling and see trends over time.",
      action: () => setPage("mood"),
    },
  ];

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>Hello, {user.displayName || "Friend"} 👋</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="card-container">
        {cards.map(c => (
          <div
            key={c.title}
            className="card"
            style={{ cursor: c.action ? "pointer" : "default" }}
            onClick={c.action || undefined}
            role={c.action ? "button" : undefined}
            tabIndex={c.action ? 0 : undefined}
            onKeyDown={c.action ? (e) => e.key === "Enter" && c.action() : undefined}
          >
            <h3>{c.icon} {c.title}</h3>
            <p>{c.body}</p>
            {c.action && (
              <button
                className="card-link-btn"
                onClick={(e) => { e.stopPropagation(); c.action(); }}
                aria-label={`Open ${c.title}`}
              >
                Open →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;