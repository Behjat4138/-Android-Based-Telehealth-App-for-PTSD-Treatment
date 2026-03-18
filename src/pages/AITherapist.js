import { useState, useRef, useEffect } from "react";

// Language strings
const LANG = {
  en: {
    title: "AI Companion",
    disclaimer: "This is an AI companion, not a licensed therapist. For crisis support call",
    placeholder: "Share what's on your mind… (Enter to send)",
    send: "Send ↑",
    sending: "…",
    newChat: "New Chat",
    back: "← Dashboard",
    footerNote: "Conversations are not stored or shared. Each session is private.",
    error: "Something went wrong. Please check your connection and try again.",
    greeting: (name) => `Hi${name ? `, ${name}` : ""} 👋 I'm here with you. This is a safe, private space to share whatever is on your mind.\n\nI'm not a therapist, but I'm here to listen, support, and offer coping tools when they might help.\n\nHow are you feeling right now?`,
    freshStart: "Hi again 👋 Fresh start — I'm here. How are you feeling right now?",
  },
  zu: {
    title: "Umngane we-AI",
    disclaimer: "Lona ungumngane we-AI, hhayi isazi sezempilo. Ukuze uthole usizo lwesimo esikhulukazi shayela",
    placeholder: "Yabelana nalokho okusengqondweni yakho… (Chofoza u-Enter ukuthumela)",
    send: "Thumela ↑",
    sending: "…",
    newChat: "Ingxoxo Entsha",
    back: "← Ibhodi",
    footerNote: "Izingxoxo azigcinwa noma zabelwane. Inhloko yonke iyimfihlo.",
    error: "Kukhona okungahambanga kahle. Sicela uzame futhi.",
    greeting: (name) => `Sawubona${name ? `, ${name}` : ""} 👋 Ngilapha nawe. Lesi isikhala esiphephile, samafihlo ukwabelana nalokho okusenhliziyweni yakho.\n\nAngiyena inyanga, kodwa ngilapha ukuzwa, ukusekela, futhi ngibhekele izinto zokumelana nezinkinga lapho zingasiza.\n\nUzizwa kanjani njengamanje?`,
    freshStart: "Sawubona futhi 👋 Siqala kabusha — Ngilapha. Uzizwa kanjani njengamanje?",
  },
};

const SYSTEM_PROMPT = `You are a compassionate, trauma-informed AI companion for PTSDCare — an app supporting youth and young adults dealing with PTSD and trauma in KwaZulu-Natal, South Africa.

Your role:
- Offer a warm, non-judgmental, supportive presence
- Use simple, clear language appropriate for young people (ages 14–25)
- Acknowledge feelings before offering suggestions
- Suggest grounding, breathing, or coping strategies when appropriate
- Never diagnose, prescribe, or claim to replace professional care
- If someone expresses suicidal thoughts or severe crisis, respond with empathy AND strongly encourage them to call the South African Suicide Crisis Line: 0800 567 567 or SMS 31393
- Keep responses concise — 2–4 short paragraphs maximum
- Be warm, human, and genuine — not clinical or robotic
- Occasionally use gentle emojis to add warmth
- If the user writes in Zulu, respond in Zulu

Always end your first response in a conversation by asking one gentle, open question to invite the person to share more.`;

function AITherapist({ user, setPage, lang = "en" }) {
  const tx = LANG[lang] || LANG.en;
  const firstName = user?.displayName?.split(" ")[0] || "";

  const [messages, setMessages] = useState([
    { role: "assistant", content: tx.greeting(firstName) },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Use the claude.ai internal proxy — no API key needed in the browser
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        // Fallback: try direct API (works when deployed with proper CORS headers)
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I'm here — could you say that again?";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      // Try direct Anthropic API as fallback
      try {
        const resp2 = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (!resp2.ok) throw new Error("API error");
        const data2 = await resp2.json();
        const reply2 = data2.content?.[0]?.text || "I'm here — could you say that again?";
        setMessages(prev => [...prev, { role: "assistant", content: reply2 }]);
      } catch (e2) {
        console.error(e2);
        setError(tx.error);
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: tx.freshStart }]);
    setError("");
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">{tx.title}</h1>
        <div className="topbar-right">
          <button className="btn-ghost-sm" onClick={clearChat}>{tx.newChat}</button>
          <button onClick={() => setPage("dashboard")}>{tx.back}</button>
        </div>
      </div>

      <div className="ai-disclaimer">
        🤖 {tx.disclaimer}{" "}
        <a href="tel:0800567567"><strong>0800 567 567</strong></a> (SA) or{" "}
        <a href="tel:988"><strong>988</strong></a> (US).
      </div>

      <div className="ai-chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg-row ${m.role}`}>
            {m.role === "assistant" && <div className="ai-avatar">🌿</div>}
            <div className={`ai-bubble ${m.role}`}>
              {m.content.split("\n").map((line, j) =>
                line ? <p key={j}>{line}</p> : <br key={j} />
              )}
            </div>
            {m.role === "user" && (
              <div className="ai-avatar user-avatar">
                {firstName?.[0]?.toUpperCase() || "👤"}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="ai-msg-row assistant">
            <div className="ai-avatar">🌿</div>
            <div className="ai-bubble assistant ai-typing"><span /><span /><span /></div>
          </div>
        )}

        {error && <div className="ai-error-row">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tx.placeholder}
          className="ai-input"
          rows={2}
          disabled={loading}
        />
        <button
          className="ai-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          {loading ? tx.sending : tx.send}
        </button>
      </div>

      <p className="ai-footer-note">{tx.footerNote}</p>
    </div>
  );
}

export default AITherapist;