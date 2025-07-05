const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  cart: [
    {
      id: Number,
      name: String,
      cuisine: String,
      price: String,
      item: String,
      image: String
    }
  ],
  orders: [
    {
      id: Number,
      items: Array,
      status: String,
      paymentMethod: String,
      date: String,
      cardDetails: Object
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
