// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Pass = require('./models/Pass');
const User = require('./models/User');   // ✅ NEW

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// ✅ Default test route
app.get('/', (req, res) => {
  res.send("✅ Bus Pass Backend Running!");
});


/* --------------------------------------------------
 ✅ STEP 4 — AUTH MIDDLEWARE (Protect routes)
-------------------------------------------------- */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}


/* --------------------------------------------------
 ✅ STEP 5 — AUTH ROUTES (Signup + Login)
-------------------------------------------------- */

// ✅ Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed
    });

    await user.save();

    res.json({ status: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      status: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* --------------------------------------------------
 ✅ BUS PASS ROUTES — ALL PROTECTED BY auth()
-------------------------------------------------- */

// ✅ Create Pass
app.post('/api/passes', auth, async (req, res) => {
  try {
    const data = req.body;
    const issue = new Date();
    const expiry = new Date(issue);

    switch ((data.passType || 'Monthly').toLowerCase()) {
      case 'quarterly': expiry.setMonth(expiry.getMonth() + 3); break;
      case 'yearly': expiry.setFullYear(expiry.getFullYear() + 1); break;
      default: expiry.setMonth(expiry.getMonth() + 1);
    }

    const passObj = {
      ...data,
      issueDate: issue,
      expiryDate: expiry,
      status: 'Active',
      userId: req.userId      // ✅ Pass belongs to logged user
    };

    const newPass = new Pass(passObj);
    await newPass.save();

    res.json({ status: 'Pass created successfully', pass: newPass });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all passes for logged user
app.get('/api/passes', auth, async (req, res) => {
  try {
    const passes = await Pass.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Renew Pass
app.put('/api/passes/:id/renew', auth, async (req, res) => {
  try {
    const pass = await Pass.findOne({ _id: req.params.id, userId: req.userId });

    if (!pass) return res.status(404).json({ error: 'Pass not found' });

    const expiry = new Date(pass.expiryDate || new Date());
    expiry.setMonth(expiry.getMonth() + 1);

    pass.expiryDate = expiry;
    pass.status = 'Active';

    await pass.save();
    res.json({ status: 'Pass renewed successfully', pass });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Pass
app.delete('/api/passes/:id', auth, async (req, res) => {
  try {
    const deleted = await Pass.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) return res.status(404).json({ error: 'Pass not found' });

    res.json({ status: 'Pass deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Start Server
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
