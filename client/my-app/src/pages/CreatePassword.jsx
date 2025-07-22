import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeClosed } from "iconoir-react";

export default function CreatePassword() {
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function createNewPassword(ev) {
    ev.preventDefault();
    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: JSON.stringify({ website, username, password }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <form className="create-password" action="" onSubmit={createNewPassword}>
      <h2>Add a new password:</h2>
      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(ev) => setWebsite(ev.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <div className="password-form-container">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input password-input"
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeClosed size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <button className="add">Add</button>
    </form>
  );
}
