'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  description: {type: String, required: true},
  amount: {type: Number,required: true},
  category: {type: String, required: true},
  date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Transaction', transactionSchema);