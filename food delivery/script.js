document.addEventListener('DOMContentLoaded', function () {
    const restaurantData = [
        {
            id: 1,
            name: "Pizza Place",
            item: "Margherita Pizza",
            cuisine: "Italian",
            price: "$$",
            image: "images/pizza.jpg"
        },
        {
            id: 2,
            name: "Burger King",
            item: "Cheeseburger",
            cuisine: "Fast Food",
            price: "$",
            image: "images/burger.jpg"
        }
    ];

    const restaurantList = document.getElementById('restaurant-list');
    const orderFormSection = document.getElementById('order-form-section');
    const orderForm = document.getElementById('order-form');
    const quantityInput = document.getElementById('quantity');
    let selectedRestaurantId = null;

    // Dynamically render restaurants
    restaurantData.forEach(restaurant => {
        const div = document.createElement('div');
        div.className = 'restaurant';

        div.innerHTML = `
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <p><strong>Item:</strong> ${restaurant.item}</p>
                <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                <p><strong>Price:</strong> ${restaurant.price}</p>
                <button class="order-btn" data-id="${restaurant.id}">Order Now</button>
            </div>
        `;
        restaurantList.appendChild(div);
    });

    // Add event listener to order buttons after they are created
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function () {
            selectedRestaurantId = this.getAttribute('data-id');
            orderFormSection.style.display = 'block';
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    });

    // Handle order form submission
    orderForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const quantity = quantityInput.value;

        fetch(`http://localhost:3000/order/${selectedRestaurantId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert(`Order placed successfully!\nRestaurant: ${selectedRestaurantId}\nQuantity: ${quantity}`);
                }
                quantityInput.value = '';
                orderFormSection.style.display = 'none';
            })
            .catch(error => {
                console.error('Error placing order:', error);
                alert('Something went wrong while placing the order.');
            });
    });
});
