import axios from "axios";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const signup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://bus-pass-backend-rkbf.onrender.com/api/signup",
        form
      );
      alert("Signup successful 🎉");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="container p-5">
      <h3>Create Account</h3>
      <form onSubmit={signup} className="d-flex flex-column gap-2">
        <input
          className="form-control"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="form-control"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="form-control"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn btn-success">Sign Up</button>
      </form>
    </div>
  );
}
