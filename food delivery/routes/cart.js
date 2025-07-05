// routes/cart.js
const express = require('express');
const Cart = require('../models/Cart');
const router = express.Router();

router.post('/add-to-cart', (req, res) => {
  const { username, item } = req.body;
  Cart.findOne({ username })
    .then(cart => {
      if (!cart) {
        const newCart = new Cart({ username, items: [item] });
        return newCart.save();
      } else {
        cart.items.push(item);
        return cart.save();
      }
    })
    .then(cart => res.json(cart))
    .catch(err => res.status(400).json({ error: 'Error adding item to cart' }));
});

router.get('/:username', (req, res) => {
  Cart.findOne({ username: req.params.username })
    .then(cart => res.json(cart))
    .catch(err => res.status(400).json({ error: 'Error fetching cart' }));
});

module.exports = router;
