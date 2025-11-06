import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    idType: 'Student',
    idNumber: '',
    passType: 'Monthly'
  });

  // 🧾 Load existing passes
  const load = () =>
    axios.get('http://localhost:7001/api/passes')
      .then((r) => setPasses(r.data))
      .catch((err) => console.error(err));

  useEffect(() => {
    load();
  }, []);

  // ➕ Create new pass (without file)
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:7001/api/passes', form);
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

  // 🔁 Renew pass
  const renew = async (id) => {
    const extendBy = prompt('Extend by (Monthly/Quarterly/Yearly):', 'Monthly');
    if (!extendBy) return;
    await axios.put(`http://localhost:7001/api/passes/${id}/renew`, { extendBy });
    load();
  };

  // ❌ Delete pass
  const remove = async (id) => {
    if (!confirm('Delete this pass?')) return;
    await axios.delete(`http://localhost:7001/api/passes/${id}`);
    load();
  };

  return (
    <div className="container py-4">
      <h2>🚌 Bus Pass Portal</h2>
      <form onSubmit={submit} className="row g-2">
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
        <select
          className="form-select"
          value={form.idType}
          onChange={(e) => setForm({ ...form, idType: e.target.value })}
        >
          <option>Student</option>
          <option>Employee</option>
          <option>General</option>
        </select>
        <select
          className="form-select"
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
