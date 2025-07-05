const express = require('express');
const cors = require('cors');
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

require('dotenv').config();

app.use(cors());
app.use(express.json());

// console.log("MONGO_URI is", process.env.MONGO_URI);
mongoose
  .connect("mongodb://localhost:27017/fooddelivery", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));



app.use('/orders', require('./routes/order'));
app.use('/cart', require('./routes/cart'));
app.use('/User',require('./models/User'));

// Sample restaurants
const restaurants = [
  { id: 1, name: "Pizza Place", cuisine: "Italian", price: "100$", item: "Margherita Pizza", image: "images/pizza.jpg" },
  { id: 2, name: "Burger King", cuisine: "Fast Food", price: "50$", item: "Cheeseburger", image: "images/burger.jpg" },
  { id: 3, name: "Taco Town", cuisine: "Mexican", price: "80$", item: "Beef Tacos", image: "images/tacos.jpg" },
  { id: 4, name: "Noodle House", cuisine: "Chinese", price: "70$", item: "Hakka Noodles", image: "images/hakka.jpg" },
  { id: 5, name: "Spice India", cuisine: "Indian", price: "90$", item: "Butter Chicken", image: "images/butter.jpg" },
  { id: 6, name: "Green Bowl", cuisine: "Healthy/Vegan", price: "60$", item: "Vegan Buddha Bowl", image: "images/vegan.jpg" }
];

// In-memory data storage
const users = {
  "naveen": { password: "naveen123", cart: [], orders: [] } // Pre-defined user
};

console.log("Users object:", users);

const User = require('./models/User'); // make sure this path is correct

// Insert predefined user if not already in DB
async function insertPredefinedUser() {
  const existing = await User.findOne({ username: 'naveen' });
  if (!existing) {
    const user = new User({
      username: 'naveen',
      password: 'naveen123',
      cart: [],
      orders: []
    });

    await user.save();
    console.log("✅ Predefined user 'naveen' inserted into MongoDB");
  } else {
    console.log("ℹ️ Predefined user 'naveen' already exists in MongoDB");
  }
}

insertPredefinedUser();



// Routes
// ----------------- Restaurant List -----------------
app.get('/restaurants', (req, res) => {
  res.json(restaurants);
});

// ----------------- User Signup -----------------
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // check if user exists in MongoDB
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // create and save new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: 'Signup successful and user stored in MongoDB' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});


// ----------------- User Login -----------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
});

// ----------------- Add to Cart -----------------
app.post('/cart', async (req, res) => {
  const { username, itemId } = req.body;
  const user = await User.findOne({ username });
  const item = restaurants.find(r => r.id === itemId);
  if (!user || !item) return res.status(400).json({ error: 'Invalid user or item' });

  user.cart.push(item);
  await user.save();

  res.json({ message: 'Item added to cart', cart: user.cart });
});

let orders = []; 


function generateUniqueOrderId() {
  return orders.length + 1;
}
app.post('/order-now', (req, res) => {
  const { username, item } = req.body;
  const user = users[username];
  if (!username || !item) {
    return res.status(400).json({ error: 'Username and item are required' });
  }


  const newOrder = {
    id: generateUniqueOrderId(), 
    username,
    items: [{ item }], 
    status: 'placed',
    timestamp: new Date()
  };

  
  orders.push(newOrder); 
  user.orders.push(newOrder);

  console.log(`\n✅ Order Placed Successfully:`);
  console.log(`Order ID: ${newOrder.id}`);
  console.log(`Food Item: ${item}`);
  console.log(`Status: ${newOrder.status}`);
  console.log(`User: ${username}`);
  console.log(`Timestamp: ${newOrder.timestamp.toLocaleString()}\n`);

  res.json({ message: 'Order placed directly', order: newOrder });
});


// ----------------- View Cart -----------------
app.get('/cart/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'User not found' });
  res.json(user.cart);
});


app.get('/get-orders/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ orders: user.orders || [] });
});


// ----------------- Cancel Order -----------------
// ----------------- Place Order with Payment & Card Details -----------------
// ----------------- Place Order with Payment & Card Details + Console Log -----------------
app.post('/place-order', async (req, res) => {
  const { username, paymentMethod } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.cart.length === 0) {
    return res.status(400).json({ error: 'No items in cart or invalid user' });
  }

  // Validate payment method
  const validMethods = ['Card', 'Cash on Delivery'];
  const method = validMethods.includes(paymentMethod) ? paymentMethod : 'Card';

  // Save item count before clearing cart
  const cartItemCount = user.cart.length;

  const order = {
    id: Date.now(),
    items: [...user.cart],
    status: 'Placed',
    paymentMethod: method,
    date: new Date().toISOString()
  };

  // Add dummy card details if payment is Card
  if (method === 'Card') {
    order.cardDetails = {
      cardNumber: '4111 1111 1111 1111',
      expiryDate: '12/29',
      cvv: '123'
    };
  }

  // Push order and clear cart
  user.orders.push(order);
  user.cart = [];

  await user.save();

  console.log(`✅ Order placed for user: ${username}, Items: ${cartItemCount}, Payment: ${order.paymentMethod}`);
  res.json({ message: 'Order placed', order });
});


app.post('/cancel-order', async (req, res) => {
  const { username, orderId } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ error: 'User not found' });

  const orderIndex = user.orders.findIndex(o => o.id == orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found or already canceled' });
  }

  const orderTime = new Date(user.orders[orderIndex].date);
  const currentTime = new Date();
  const timeDiff = (currentTime - orderTime) / 1000; // in seconds

  if (timeDiff > 60) {
    return res.status(403).json({ error: 'Order can only be canceled within 1 minute' });
  }

  user.orders.splice(orderIndex, 1); // Remove order
  await user.save();

  res.json({ message: 'Order canceled successfully' });
});


// ----------------- Start Server -----------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
