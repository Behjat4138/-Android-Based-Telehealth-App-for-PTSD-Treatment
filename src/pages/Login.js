import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

// Very basic real-email check: must have a dot in the domain part
function isLikelyRealEmail(email) {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  // domain must contain at least one dot and a TLD with 2+ chars
  return /^[^.]+\.[a-zA-Z]{2,}$/.test(domain);
}

function Login({ setUser }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleLogin = async () => {
    setError("");
    const trimmed = email.trim().toLowerCase();

    if (!isLikelyRealEmail(trimmed)) {
      setError("Please enter a valid email address (e.g. you@gmail.com).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmed, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox.");
        return;
      }
      setUser(user);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!isLikelyRealEmail(trimmed)) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setError("");
      alert("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome back</h2>
      {error && <div className="auth-error">{error}</div>}
      <input
        type="email"
        placeholder="Email (e.g. you@gmail.com)"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(""); }}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => { setPassword(e.target.value); setError(""); }}
        autoComplete="current-password"
        onKeyDown={e => e.key === "Enter" && handleLogin()}
      />
      <button onClick={handleLogin}>Login</button>
      <p className="forgot-link" onClick={handleForgotPassword}>Forgot Password?</p>
    </div>
  );
}

export default Login;