// routes/orders.js
const express = require('express');
const Order = require('../models/order');
const router = express.Router();

router.post('/place-order', (req, res) => {
  const { username, items } = req.body;
  const newOrder = new Order({ username, items });
  newOrder.save()
    .then(order => res.json(order))
    .catch(err => res.status(400).json({ error: 'Error placing order' }));
});

router.get('/:username', (req, res) => {
  Order.find({ username: req.params.username })
    .then(orders => res.json(orders))
    .catch(err => res.status(400).json({ error: 'Error fetching orders' }));
});

module.exports = router;
