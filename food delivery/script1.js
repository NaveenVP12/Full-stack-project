
let currentUser = null;

function showSection(id) {
  document.querySelectorAll('main > section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
  if (id === 'cart-section') loadCart();
  if (id === 'history-section') loadHistory();
}

function toggleForm() {
  const btn = document.querySelector('#login-form button');
  btn.textContent = btn.textContent === 'Login' ? 'Sign Up' : 'Login';
}


const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const action = loginForm.querySelector('button').textContent === 'Login' ? 'login' : 'signup';

  fetch(`http://localhost:3000/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert(data.error);
      currentUser = username;
      alert(`${action} successful`);
      showSection('restaurant-list');
    });
});


const cartBtns = document.querySelectorAll('.cart-btn');
const cartItemsList = document.getElementById('cart-items');

cartBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentUser) return alert('Please login first');
    const itemId = parseInt(btn.getAttribute('data-id'));
    const itemName=btn.getAttribute('data-name');

    fetch('http://localhost:3000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, itemId })
    })
      .then(res => res.json())
      .then(data => {
        alert('Added to cart');
     
        
        
        const li = document.createElement('li');
        li.textContent = itemName;
        cartItemsList.appendChild(li);});
  });
});


function loadCart() {
  fetch(`http://localhost:3000/cart/${currentUser}`)
    .then(res => res.json())
    .then(items => {
      const list = document.getElementById('cart-items');
      list.innerHTML = '';
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.item} (${item.name})`;
        list.appendChild(li);
      });
    });
}

// Place Order
function placeOrder() {
  const username = localStorage.getItem("loggedInUser");
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || "Cash on Delivery";

  fetch('/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, paymentMethod })
  })
  .then(res => res.json())
  .then(data => {
    const order = data.order;

    // Show confirmation and Cancel button
    const confirmation = document.getElementById('order-confirmation');
    confirmation.style.display = "block";
    document.getElementById('order-id').textContent = order.id;

    const cancelBtn = document.getElementById('cancel-order-btn');
    const cancelMsg = document.getElementById('cancel-msg');

    cancelBtn.disabled = false;
    cancelMsg.textContent = "";

    cancelBtn.onclick = () => {
      fetch('/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, orderId: order.id })
      })
      .then(res => res.json())
      .then(data => {
        cancelMsg.textContent = data.message;
        cancelBtn.disabled = true;
      });
    };

    loadOrderHistory();
    setTimeout(() => {
      cancelBtn.disabled = true;
      cancelMsg.textContent = " Time's up! Cannot cancel this order.";
    }, 60000);
  });
}



function loadHistory() {
  fetch(`http://localhost:3000/orders/${currentUser}`)
    .then(res => res.json())
    .then(data => {
      const placed = document.getElementById('placed-orders');
      const cancelled = document.getElementById('cancelled-orders');
      placed.innerHTML = '';
      cancelled.innerHTML = '';

      data.placed.forEach(order => {
        const li = document.createElement('li');
        li.textContent = `Order #${order.id} - ${order.items.map(i => i.item).join(', ')}`;
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => cancelOrder(order.id);
        li.appendChild(cancelBtn);
        placed.appendChild(li);
      });

      data.cancelled.forEach(order => {
        const li = document.createElement('li');
        li.textContent = `Order #${order.id} - ${order.items.map(i => i.item).join(', ')} (Cancelled)`;
        cancelled.appendChild(li);
      });
    });
}
function orderNow(itemName) {
  if (!currentUser) return alert('Please login first');

  fetch('http://localhost:3000/order-now', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, item: itemName })
  })
    .then(res => res.json())
    .then(data => {
      alert(`Order placed for ${itemName}!`);
      loadHistory(); 
    });
}



document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();
  if (response.ok) {
    currentUser = username;
    alert("Login successful!");
    showSection('restaurant-list');
  } else {
    alert(result.error);
  }
});

function placeOrder() {
  if (!currentUser) return alert("Please log in first.");
  showSection('payment-section');
}

document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const paymentType = document.querySelector('input[name="payment-method"]:checked').value;

  const response = await fetch('http://localhost:3000/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser })
  });

  const data = await response.json();
  if (response.ok) {
    alert(`Order placed! Payment: ${paymentType}\nOrder ID: ${data.order.id}`);
    showSection('restaurant-list');
  } else {
    alert(data.error);
  }
});

document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const cardSection = document.getElementById('card-details');
    cardSection.style.display = (radio.value === 'Card') ? 'block' : 'none';
  });
});

function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

let allOrders = [];

function loadOrderHistory() {
  const username = localStorage.getItem("loggedInUser");
  fetch(`/get-orders/${username}`)
    .then(res => res.json())
    .then(data => {
      allOrders = data.orders || [];
      filterOrders('Placed'); // Default view
    });
}

function filterOrders(status) {
  const filtered = allOrders.filter(order => order.status === status);
  const orderDiv = document.getElementById('order-history');
  orderDiv.innerHTML = '';

  if (filtered.length === 0) {
    orderDiv.innerHTML = `<p>No ${status.toLowerCase()} orders found.</p>`;
    return;
  }

  filtered.forEach(order => {
    const item = document.createElement('div');
    item.innerHTML = `
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
      <hr>
    `;
    orderDiv.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", loadOrderHistory);


function cancelOrder(orderId) {
  fetch('http://localhost:3000/cancel-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, orderId })
  })
    .then(res => res.json())
    .then(() => {
      alert('Order cancelled');

      
      document.getElementById('cart-items').innerHTML = '';

    
      localStorage.setItem(`${currentUser}_cart`, JSON.stringify([]));

     
      loadHistory();
      loadOrderHistory();
    });
}
