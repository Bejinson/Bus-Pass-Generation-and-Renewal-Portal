import axios from "axios";
import { useState } from "react";

export default function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://bus-pass-backend-rkbf.onrender.com/api/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
      alert("Login successful");

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="container p-5">
      <h3>Sign In</h3>
      <form onSubmit={login} className="d-flex flex-column gap-2">
        <input
          className="form-control"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary">Sign In</button>
      </form>
    </div>
  );
}
