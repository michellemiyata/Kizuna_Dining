document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (menuToggle && mainMenu) {
        if (getComputedStyle(menuToggle).display !== 'none') {
            mainMenu.setAttribute('aria-hidden', 'true');
        }

        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);

            if (isExpanded) {
                mainMenu.style.display = 'none';
                mainMenu.setAttribute('aria-hidden', 'true');
            } else {
                mainMenu.style.display = 'flex';
                mainMenu.setAttribute('aria-hidden', 'false');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mainMenu.style.display = 'flex';
                mainMenu.removeAttribute('aria-hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
            } else {
                if (menuToggle.getAttribute('aria-expanded') === 'false') {
                    mainMenu.style.display = 'none';
                    mainMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // Modal Logic
    const modal = document.getElementById('item-details-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const triggers = document.querySelectorAll('.menu-item-trigger');

    // Data elements in modal
    const mImage = document.getElementById('modal-image');
    const mTitle = document.getElementById('modal-title');
    const mDesc = document.getElementById('modal-description');
    const mPrice = document.getElementById('modal-price');
    const mTags = document.getElementById('modal-tags');

    // Keep track of the last focused element to return focus on close
    let lastFocusedElement;

    // Open Modal
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            lastFocusedElement = trigger;

            // Extract data
            const img = trigger.querySelector('img');
            const title = trigger.querySelector('h3').textContent;
            const desc = trigger.querySelector('.description').textContent;
            const price = trigger.querySelector('.price').textContent;
            const tags = trigger.querySelector('.dietary-tags');

            // Populate Modal
            mTitle.textContent = title;
            mDesc.textContent = desc;
            mPrice.textContent = price;

            // Image logic
            if (img) {
                mImage.src = img.src;
                mImage.alt = img.alt; // Important for accessibility
                mImage.style.display = 'block';
            } else {
                mImage.style.display = 'none';
            }

            // Tag logic
            mTags.innerHTML = '';
            if (tags) {
                mTags.innerHTML = tags.innerHTML;
            }

            modal.showModal();
        });
    });

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.close();
        });
    }

    // Modal close event listener (covers Esc key and form submit)
    modal.addEventListener('close', () => {
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    });

    // Optional: Close on backdrop click (standard dialog behavior doesn't do this by default, but it's good UX)
    modal.addEventListener('click', (event) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            modal.close();
        }
    });

    // Cart Logic
    const cartBtn = document.getElementById('cart-btn');
    const cartCountSpan = document.getElementById('cart-count');
    const addToCartForm = document.getElementById('add-to-cart-form');
    const qtyInput = document.getElementById('quantity');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const liveRegion = document.getElementById('cart-live-region');

    let cart = [];
    let currentItem = {}; // Hold current item data for adding

    // Quantity Controls
    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            if (qtyInput) {
                let val = parseInt(qtyInput.value);
                if (val > 1) qtyInput.value = val - 1;
            }
        });

        qtyPlus.addEventListener('click', () => {
            if (qtyInput) {
                let val = parseInt(qtyInput.value);
                if (val < 10) qtyInput.value = val + 1;
            }
        });
    }

    // Update current item data when modal opens (hook into existing triggers)
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            // Reset quantity
            if (qtyInput) qtyInput.value = 1;

            // Capture data for cart
            currentItem = {
                title: trigger.querySelector('h3').textContent,
                price: parseFloat(trigger.querySelector('.price').textContent.replace('$', '')),
            };
        });
    });

    // Add to Cart
    if (addToCartForm) {
        addToCartForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const qty = parseInt(qtyInput.value);

            // Add to cart state
            const existingItem = cart.find(item => item.title === currentItem.title);
            if (existingItem) {
                existingItem.qty += qty;
            } else {
                cart.push({ ...currentItem, qty });
            }

            updateCartUI();

            // Accessibility Feedback
            const message = `Added ${qty} ${currentItem.title} to order. Total items: ${getConfiguredCartCount()}`;
            liveRegion.textContent = message;

            // Close modal
            modal.close();
        });
    }

    function getConfiguredCartCount() {
        return cart.reduce((acc, item) => acc + item.qty, 0);
    }

    function updateCartUI() {
        const count = getConfiguredCartCount();
        cartCountSpan.textContent = count;
        cartBtn.setAttribute('aria-label', `Shopping Cart, ${count} items`);
    }

    // Cart Modal Logic
    const cartModal = document.getElementById('cart-modal');
    const closeCartModalBtn = document.getElementById('close-cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Open Cart Modal
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            renderCartItems();
            cartModal.showModal();
        });
    }

    // Close Cart Modal
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => {
            cartModal.close();
        });
    }

    // Close on backdrop click
    if (cartModal) {
        cartModal.addEventListener('click', (event) => {
            const rect = cartModal.getBoundingClientRect();
            const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                cartModal.close();
            }
        });
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            cartTotalPriceSpan.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>Qty: ${item.qty} x $${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-action">
                    <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                    <button class="remove-btn" data-index="${index}" aria-label="Remove ${item.title} from cart">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalPriceSpan.textContent = '$' + total.toFixed(2);

        // Add event listeners to remove buttons
        const removeBtns = document.querySelectorAll('.remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    function removeFromCart(index) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        updateCartUI();
        renderCartItems();

        // Feedback
        if (liveRegion) liveRegion.textContent = `Removed ${removedItem.title} from cart.`;
    }

    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            // Save cart to LocalStorage
            localStorage.setItem('kizuna_cart', JSON.stringify(cart));

            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }

    // Menu Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filterValue = btn.getAttribute('data-filter');

            if (menuItems.length > 0) {
                menuItems.forEach(item => {
                    if (filterValue === 'all') {
                        item.classList.remove('hidden');
                        return;
                    }

                    const tagsInfo = item.querySelector('.dietary-tags');
                    // If no tags exist and filter is not 'all', hide it
                    if (!tagsInfo) {
                        item.classList.add('hidden');
                        return;
                    }

                    // Check if item has the requested tag class (e.g., .veg or .gf)
                    const hasTag = tagsInfo.querySelector(`.tag.${filterValue}`);

                    if (hasTag) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }

            // Announce filter change to screen readers (standard feedback via live region)
            const announcement = filterValue === 'all' ? "Showing all items" : `Showing ${btn.textContent} items`;
            if (liveRegion) liveRegion.textContent = announcement;
        });
    });

    // Language Switcher Logic
    const langSelect = document.getElementById('language-select');
    const menuEn = document.getElementById('menu-en');
    const menuJp = document.getElementById('menu-jp');
    const htmlTag = document.documentElement;

    if (langSelect && menuEn && menuJp) {
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;

            if (lang === 'en') {
                menuEn.classList.remove('hidden');
                menuJp.classList.add('hidden');
                htmlTag.setAttribute('lang', 'en');
            } else {
                menuEn.classList.add('hidden');
                menuJp.classList.remove('hidden');
                htmlTag.setAttribute('lang', 'ja');
            }
        });
    }
});


