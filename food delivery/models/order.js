const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  username: String,
  items: Array,
  status: String,
  paymentMethod: String,
  cardDetails: {
    cardNumber: String,
    expiryDate: String,
    cvv: String
  },
  date: String
});

module.exports = mongoose.model('Order', orderSchema);
