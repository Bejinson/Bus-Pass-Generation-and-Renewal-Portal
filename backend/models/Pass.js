// models/Pass.js
const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  idType: { type: String, enum: ['Student', 'Employee', 'General'], default: 'Student' },
  idNumber: { type: String, required: true },
  passType: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'], default: 'Monthly' },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  photoUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Active', 'Expired', 'Revoked'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Pass', passSchema);
