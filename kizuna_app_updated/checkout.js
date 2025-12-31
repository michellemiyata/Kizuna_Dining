document.addEventListener('DOMContentLoaded', () => {
    const orderMethodRadios = document.querySelectorAll('input[name="order-method"]');
    const pickupDetails = document.getElementById('pickup-details');
    const deliveryDetails = document.getElementById('delivery-details');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalPriceSpan = document.getElementById('checkout-total-price');
    const placeOrderBtn = document.getElementById('place-order-btn');

    // 1. Toggle Delivery/Pickup forms
    orderMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pickup') {
                pickupDetails.classList.remove('hidden');
                deliveryDetails.classList.add('hidden');
            } else {
                pickupDetails.classList.add('hidden');
                deliveryDetails.classList.remove('hidden');
            }
        });
    });

    // 2. Load Cart from LocalStorage
    const cartData = localStorage.getItem('kizuna_cart');
    let cart = [];

    if (cartData) {
        cart = JSON.parse(cartData);
    }

    // 3. Render Order Summary
    renderOrderSummary();

    function renderOrderSummary() {
        checkoutItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            checkoutItemsContainer.innerHTML = '<p>Your cart is empty. <a href="index.html">Go back to menu</a></p>';
            placeOrderBtn.disabled = true;
            checkoutTotalPriceSpan.textContent = '$0.00';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.classList.add('checkout-item');
            itemEl.innerHTML = `
                <span>${item.qty}x ${item.title}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            checkoutItemsContainer.appendChild(itemEl);
        });

        checkoutTotalPriceSpan.textContent = '$' + total.toFixed(2);
    }

    // 4. Place Order Logic
    placeOrderBtn.addEventListener('click', () => {
        // Simple validation visualization
        const method = document.querySelector('input[name="order-method"]:checked').value;

        if (method === 'delivery') {
            const address = document.getElementById('address').value;
            if (!address) {
                alert('Please enter a delivery address.');
                return;
            }
        }

        alert(`Order confirmed! Method: ${method.toUpperCase()}. Thank you for choosing Kizuna Dining.`);

        // Clear cart
        localStorage.removeItem('kizuna_cart');
        window.location.href = 'index.html';
    });
});
