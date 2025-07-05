const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Only keep order route (restaurant data is now on frontend)
app.post('/order/:id', (req, res) => {
    const restaurantId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Optionally: simulate checking if the restaurant ID is valid
    const validIds = [1, 2];
    if (!validIds.includes(parseInt(restaurantId))) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Simulate order processing
    const order = { restaurantId, quantity, status: 'Order placed' };

    console.log('Received order:', order); // Log to console for now

    res.json({ message: 'Order placed successfully', order });
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
