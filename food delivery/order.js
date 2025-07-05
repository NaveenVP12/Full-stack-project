const express = require('express');
const Order = require('../models/order');
const Cart = require('../models/Cart');  // Assuming you have a Cart model to fetch cart items
const router = express.Router();

// Place an Order
router.post('/place-order', async (req, res) => {
  const { username } = req.body;

  try {
    // Fetch cart items for the user (replace with your actual cart model)
    const cartItems = await Cart.find({ username });

    const items = cartItems.map(ci => ({
      item: ci.itemId,  // You might want to fetch item names based on itemId
      name: ci.itemName
    }));

    // Create and save order
    const order = new Order({ username, items });
    await order.save();

    // Clear cart after placing the order (optional)
    await Cart.deleteMany({ username });

    res.json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get Order History (Placed and Cancelled)
router.get('/history/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const placedOrders = await Order.find({ username, status: 'Placed' });
    const cancelledOrders = await Order.find({ username, status: 'Cancelled' });

    res.json({ placed: placedOrders, cancelled: cancelledOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// Cancel an Order
router.post('/cancel-order', async (req, res) => {
  const { username, orderId } = req.body;

  try {
    await Order.updateOne({ _id: orderId, username }, { $set: { status: 'Cancelled' } });
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;
