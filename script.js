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

    // Updated Language Switcher Logic (Generic)
    // Matches elements with class .lang-btn and toggles elements with class .lang-content-en / .lang-content-jp
    const langButtons = document.querySelectorAll('.lang-btn');
    const htmlTag = document.documentElement;

    function setLanguage(lang) {
        // Update Buttons
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Content
        const enElements = document.querySelectorAll('.lang-content-en, #menu-en');
        const jpElements = document.querySelectorAll('.lang-content-jp, #menu-jp');

        if (lang === 'en') {
            enElements.forEach(el => el.classList.remove('hidden'));
            jpElements.forEach(el => el.classList.add('hidden'));
            htmlTag.setAttribute('lang', 'en');
            localStorage.setItem('kizuna_lang', 'en');
        } else {
            enElements.forEach(el => el.classList.add('hidden'));
            jpElements.forEach(el => el.classList.remove('hidden'));
            htmlTag.setAttribute('lang', 'ja');
            localStorage.setItem('kizuna_lang', 'jp');
        }
    }

    // Init Language from LocalStorage or Default
    const savedLang = localStorage.getItem('kizuna_lang') || 'en';
    setLanguage(savedLang);

    // Event Listeners for Lang Buttons
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }

    // Updated Menu Filtering Logic (with Empty State & Active Text)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const noResultsMsg = document.getElementById('no-results-message');
    // Create status element if it doesn't exist


    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // 1. Sync Active State across EN and JP buttons
            filterButtons.forEach(b => {
                if (b.getAttribute('data-filter') === filterValue) {
                    b.classList.add('active');
                    b.setAttribute('aria-pressed', 'true');
                } else {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                }
            });

            // 2. Update Status Text (Bilingual)
            const statusEn = document.getElementById('filter-status-en');
            const statusJp = document.getElementById('filter-status-jp');

            // Find specific buttons to get their label text
            const enBtn = document.querySelector(`.lang-content-en .filter-btn[data-filter="${filterValue}"]`);
            const jpBtn = document.querySelector(`.lang-content-jp .filter-btn[data-filter="${filterValue}"]`);

            if (statusEn && enBtn) {
                statusEn.textContent = filterValue === 'all' ? "" : `Showing: ${enBtn.textContent}`;
            }
            if (statusJp && jpBtn) {
                statusJp.textContent = filterValue === 'all' ? "" : `表示中: ${jpBtn.textContent}`;
            }

            let visibleCount = 0;

            if (menuItems.length > 0) {
                menuItems.forEach(item => {
                    let isMatch = false;

                    if (filterValue === 'all') {
                        isMatch = true;
                    } else {
                        const tagsInfo = item.querySelector('.dietary-tags');
                        if (tagsInfo) {
                            const hasTag = tagsInfo.querySelector(`.tag.${filterValue}`);
                            if (hasTag) isMatch = true;
                        }
                    }

                    if (isMatch) {
                        item.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }

            // Show/Hide Empty State
            if (visibleCount === 0) {
                if (noResultsMsg) noResultsMsg.classList.remove('hidden');
            } else {
                if (noResultsMsg) noResultsMsg.classList.add('hidden');
            }

            // Announce filter change
            const announcement = filterValue === 'all' ? "Showing all items" : `Showing ${btn.textContent} items`;
            if (liveRegion) liveRegion.textContent = announcement;
        });
    });

    // Add to Cart Feedback
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

            // Visual Feedback on Button
            const submitBtn = addToCartForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Added ✓ <span class="jp-modal">追加しました ✓</span>';
            submitBtn.classList.add('success-feedback'); // Optional: add a class for color change if desired

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('success-feedback');
                modal.close(); // Close modal after short delay so user sees feedback
            }, 1000);
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




});


