import { useState } from "react";
import { Eye, EyeClosed } from "iconoir-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmedPasswordVisibility = () => {
    setShowConfirmedPassword(!showConfirmedPassword);
  };

  async function register(ev) {
    ev.preventDefault();
    if (confirmedPassword != password) {
      alert("passwords are not the same");
      return;
    }
    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      alert("registration successful");
    } else {
      alert("registration failed");
    }
  }

  return (
    <form className="register" action="" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        required
        autoComplete="username"
      />

      <div className="password-field">
        <label>Enter Password:</label>
        <div className="password-form-container">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input password-input"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeClosed /> : <Eye />}
          </button>
        </div>
      </div>

      <div className="password-field">
        <label>Confirm Password:</label>
        <div className="password-form-container">
          <input
            id="password"
            type={showConfirmedPassword ? "text" : "password"}
            placeholder="Password"
            value={confirmedPassword}
            onChange={(e) => setConfirmedPassword(e.target.value)}
            className="form-input password-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={toggleConfirmedPasswordVisibility}
            aria-label={
              showConfirmedPassword ? "Hide password" : "Show password"
            }
          >
            {showConfirmedPassword ? <EyeClosed /> : <Eye />}
          </button>
        </div>
      </div>
      <button className="register">Register</button>
    </form>
  );
}
