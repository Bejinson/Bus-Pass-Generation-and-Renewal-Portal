// server.js
require('dotenv').config();  // ✅ Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Pass = require('./models/Pass');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB (Atlas via dotenv)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Default route for Render testing
app.get('/', (req, res) => {
  res.send('🚍 Bus Pass Backend is running successfully!');
});

// ✅ Create Pass (no photo upload)
app.post('/api/passes', async (req, res) => {
  try {
    const data = req.body;
    const issue = new Date();
    const expiry = new Date(issue);

    // 🗓️ Set expiry based on pass type
    switch ((data.passType || 'Monthly').toLowerCase()) {
      case 'quarterly':
        expiry.setMonth(expiry.getMonth() + 3);
        break;
      case 'yearly':
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
      default:
        expiry.setMonth(expiry.getMonth() + 1);
    }

    const passObj = {
      ...data,
      issueDate: issue,
      expiryDate: expiry,
      status: 'Active'
    };

    const newPass = new Pass(passObj);
    await newPass.save();
    res.json({ status: 'Pass created successfully', pass: newPass });

  } catch (err) {
    console.error('❌ Error creating pass:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ List Passes
app.get('/api/passes', async (req, res) => {
  try {
    const passes = await Pass.find().sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    console.error('❌ Error fetching passes:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Renew Pass
app.put('/api/passes/:id/renew', async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);
    if (!pass) return res.status(404).json({ error: 'Pass not found' });

    const expiry = new Date(pass.expiryDate || new Date());
    expiry.setMonth(expiry.getMonth() + 1);
    pass.expiryDate = expiry;
    pass.status = 'Active';
    await pass.save();

    res.json({ status: 'Pass renewed successfully', pass });
  } catch (err) {
    console.error('❌ Error renewing pass:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Pass
app.delete('/api/passes/:id', async (req, res) => {
  try {
    const deleted = await Pass.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Pass not found' });
    res.json({ status: 'Pass deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting pass:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
