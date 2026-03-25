import { useState, useRef, useEffect } from "react";

const LANG = {
  en: {
    title: "AI Companion",
    disclaimer: "This is an AI companion, not a licensed therapist. For crisis support call",
    placeholder: "Share what's on your mind… (Enter to send)",
    send: "Send ↑", sending: "…", newChat: "New Chat", back: "← Dashboard",
    footerNote: "Conversations are not stored or shared. Each session is private.",
    error: "The AI is busy right now. Please wait a moment and try again.",
    greeting: (name) => `Hi${name ? `, ${name}` : ""} 👋 I'm here with you. This is a safe, private space.\n\nI'm here to listen and offer support. How are you feeling right now?`,
    freshStart: "Hi again 👋 I'm here. How are you feeling right now?",
    tokenNote: "Using free AI — responses may take a few seconds.",
  },
  zu: {
    title: "Umngane we-AI",
    disclaimer: "Lona ungumngane we-AI, hhayi isazi sezempilo. Ukuze uthole usizo shayela",
    placeholder: "Yabelana nalokho okusengqondweni yakho…",
    send: "Thumela ↑", sending: "…", newChat: "Ingxoxo Entsha", back: "← Ibhodi",
    footerNote: "Izingxoxo azigcinwa. Inhloko yonke iyimfihlo.",
    error: "I-AI imatasa manje. Sicela ulinde bese uzama futhi.",
    greeting: (name) => `Sawubona${name ? `, ${name}` : ""} 👋 Ngilapha nawe. Lesi isikhala esiphephile.\n\nUzizwa kanjani njengamanje?`,
    freshStart: "Sawubona futhi 👋 Ngilapha. Uzizwa kanjani?",
    tokenNote: "Kusetshenziselwa i-AI yamahhala — izimpendulo zingathatha imizuzwana.",
  },
};

// Free Hugging Face Inference API — no cost, just needs a free HF token
// Model: microsoft/DialoGPT-medium — free conversational model
// OR: mistralai/Mistral-7B-Instruct-v0.1 — better quality, also free tier
const HF_API = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";

// You can get a FREE token at huggingface.co/settings/tokens (no credit card)
// Paste it here for the demo:
const HF_TOKEN = process.env.REACT_APP_HF_TOKEN || "";

const SYSTEM = `You are a compassionate, trauma-informed AI companion for PTSDCare, supporting youth in KwaZulu-Natal, South Africa. You are warm, gentle, non-judgmental. Keep responses short (2-3 paragraphs). Never diagnose. For crisis mention SA line: 0800 567 567. Acknowledge feelings first, then gently offer support or coping suggestions.`;

function buildPrompt(messages) {
  // Mistral instruct format
  let prompt = `<s>[INST] ${SYSTEM}\n\n`;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "user") {
      if (i === 0) prompt += `${m.content} [/INST]`;
      else prompt += `[INST] ${m.content} [/INST]`;
    } else if (m.role === "assistant" && i > 0) {
      prompt += ` ${m.content} </s>`;
    }
  }
  return prompt;
}

// Fallback: simple rule-based responses when no API token
const FALLBACK_RESPONSES = [
  "I hear you, and I want you to know your feelings are completely valid. It takes courage to reach out and share what you're going through. 💙\n\nWould you like to try a short breathing exercise together? Sometimes just a few slow breaths can help us feel a little more grounded.",
  "Thank you for sharing that with me. You don't have to face this alone. 🌿\n\nIf things ever feel overwhelming, please remember the SA crisis line is available 24/7: 0800 567 567. You can also try our grounding tools in the Coping Resources section.",
  "It sounds like you've been carrying a lot. That's really hard, and it makes sense that you're feeling this way. 🌸\n\nOne thing that can help in moments like this is the 5-4-3-2-1 technique — noticing things around you with your senses. Would that be helpful right now?",
  "I'm really glad you're here and talking. That in itself is a brave step. 🤝\n\nRemember: healing isn't linear. Some days are harder than others, and that doesn't mean you're not making progress.",
  "What you're describing sounds really difficult, and your feelings make complete sense given what you've experienced. 💙\n\nIf you haven't tried our Guided Meditation yet, it might help — especially the 'Safe Place' visualisation before bed. Would you like some other coping suggestions?",
];
let fallbackIdx = 0;

function AITherapist({ user, setPage, lang = "en" }) {
  const tx = LANG[lang] || LANG.en;
  const firstName = user?.displayName?.split(" ")[0] || "";

  const [messages, setMessages] = useState([
    { role: "assistant", content: (LANG[lang] || LANG.en).greeting(firstName) },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const bottomRef = useRef(null);

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

    // Try Hugging Face free API first
    if (HF_TOKEN) {
      try {
        const prompt = buildPrompt(newMessages);
        const res = await fetch(HF_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HF_TOKEN}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false },
          }),
        });

        if (res.status === 503) {
          // Model is loading — retry after 20s
          await new Promise(r => setTimeout(r, 20000));
          const res2 = await fetch(HF_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HF_TOKEN}` },
            body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false } }),
          });
          const d2 = await res2.json();
          const reply2 = d2?.[0]?.generated_text?.trim() || getFallback();
          setMessages(prev => [...prev, { role: "assistant", content: reply2 }]);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error(`HF API ${res.status}`);
        const data = await res.json();
        const reply = data?.[0]?.generated_text?.trim() || getFallback();
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("HF API failed, using fallback:", e.message);
      }
    }

    // Fallback: thoughtful pre-written responses (great for demo without token)
    await new Promise(r => setTimeout(r, 1200)); // feel natural
    setUsingFallback(true);
    setMessages(prev => [...prev, { role: "assistant", content: getFallback() }]);
    setLoading(false);
  };

  const getFallback = () => {
    const r = FALLBACK_RESPONSES[fallbackIdx % FALLBACK_RESPONSES.length];
    fallbackIdx++;
    return r;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: (LANG[lang] || LANG.en).freshStart }]);
    setError(""); setUsingFallback(false);
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

      {usingFallback && (
        <div className="ai-fallback-note">
          💡 {HF_TOKEN ? tx.tokenNote : "Add a free Hugging Face token in .env (REACT_APP_HF_TOKEN) for live AI. Using curated responses for now."}
        </div>
      )}

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
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={tx.placeholder}
          className="ai-input" rows={2} disabled={loading}
        />
        <button className="ai-send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
          {loading ? tx.sending : tx.send}
        </button>
      </div>
      <p className="ai-footer-note">{tx.footerNote}</p>
    </div>
  );
}

export default AITherapist;