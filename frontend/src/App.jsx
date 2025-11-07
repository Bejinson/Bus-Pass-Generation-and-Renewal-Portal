import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Login from './Login';
import Signup from './Signup';

axios.defaults.baseURL = "https://bus-pass-backend-rkbf.onrender.com";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    idType: 'Student',
    idNumber: '',
    passType: 'Monthly'
  });

  const API_BASE = '/api/passes';

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  // ✅ Load passes
  const load = () => {
    axios.get(API_BASE)
      .then((r) => setPasses(r.data))
      .catch((err) => console.error('Error loading passes:', err));
  };

  useEffect(() => {
    if (loggedIn) load();
  }, [loggedIn]);

  // ✅ Create pass
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_BASE, form);
      alert(res.data.status);
      setForm({
        name: '',
        email: '',
        phone: '',
        idType: 'Student',
        idNumber: '',
        passType: 'Monthly'
      });
      load();
    } catch (err) {
      alert('Error creating pass');
      console.error(err);
    }
  };

  // ✅ Renew pass
  const renew = async (id) => {
    const extendBy = prompt('Extend by (Monthly/Quarterly/Yearly):', 'Monthly');
    if (!extendBy) return;

    try {
      await axios.put(`${API_BASE}/${id}/renew`, { extendBy });
      load();
    } catch (err) {
      console.error('Error renewing pass:', err);
    }
  };

  // ✅ Delete pass
  const remove = async (id) => {
    if (!confirm('Delete this pass?')) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      load();
    } catch (err) {
      console.error('Error deleting pass:', err);
    }
  };

  // ✅ If NOT logged in → show login/signup
  if (!loggedIn) {
    return (
      <div className="container p-4">
        <Login setLoggedIn={setLoggedIn} />
        <Signup />
      </div>
    );
  }

  // ✅ Logged in → show pass dashboard
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between">
        <h2>🚌 Bus Pass Portal</h2>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      <form onSubmit={submit} className="row g-2 mt-3">
        <input
          required
          className="form-control"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="ID Number"
          value={form.idNumber}
          onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
        />

        <select className="form-select"
          value={form.idType}
          onChange={(e) => setForm({ ...form, idType: e.target.value })}
        >
          <option>Student</option>
          <option>Employee</option>
          <option>General</option>
        </select>

        <select className="form-select"
          value={form.passType}
          onChange={(e) => setForm({ ...form, passType: e.target.value })}
        >
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Yearly</option>
        </select>

        <button className="btn btn-primary mt-2">Apply</button>
      </form>

      <hr />
      <h4>Existing Passes</h4>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.passType}</td>
              <td>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '-'}</td>
              <td>{p.status}</td>
              <td>
                <button className="btn btn-sm btn-success me-1" onClick={() => renew(p._id)}>
                  Renew
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
