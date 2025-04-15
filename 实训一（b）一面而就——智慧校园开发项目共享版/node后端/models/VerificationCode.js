const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: /^1[3-9]\d{9}$/
  },
  code: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5分钟后自动删除
  }
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema); 