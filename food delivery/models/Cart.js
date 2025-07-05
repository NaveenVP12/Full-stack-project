const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  username: { type: String, required: true },
  itemId: { type: String, required: true },  // Or a reference to another collection
  itemName: { type: String, required: true }
});

module.exports = mongoose.model('Cart', cartSchema);
