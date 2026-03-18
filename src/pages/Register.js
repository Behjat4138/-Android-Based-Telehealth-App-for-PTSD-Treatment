import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

function isLikelyRealEmail(email) {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return /^[^.]+\.[a-zA-Z]{2,}$/.test(domain);
}

function Register({ setUser }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleRegister = async () => {
    setError("");
    const trimmed = email.trim().toLowerCase();

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!isLikelyRealEmail(trimmed)) {
      setError("Please use a real email address (e.g. you@gmail.com). A fake email means you cannot verify your account.");
      return;
    }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmed, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name.trim() });
      await sendEmailVerification(user);
      alert("Almost there! A verification email has been sent to " + trimmed + ". Please check your inbox and click the link before logging in.");
      await user.reload();
      setUser({ ...auth.currentUser });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <div className="auth-error">{error}</div>}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        autoComplete="name"
      />
      <input
        type="email"
        placeholder="Email (e.g. you@gmail.com)"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(""); }}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={e => { setPassword(e.target.value); setError(""); }}
        autoComplete="new-password"
        onKeyDown={e => e.key === "Enter" && handleRegister()}
      />
      <button onClick={handleRegister}>Create Account</button>
    </div>
  );
}

export default Register;