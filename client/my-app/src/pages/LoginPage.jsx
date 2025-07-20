import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Eye, EyeClosed } from "iconoir-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch("http://localhost:4000/login", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      response.json().then((res) => {
        alert(res.error);
      });
    }
  }

  if (redirect) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <form className="login" action="" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <div className="password-container">
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
          {showPassword ? <EyeClosed /> : <Eye />}
        </button>
      </div>
      <button className="login">Login</button>
    </form>
  );
}
