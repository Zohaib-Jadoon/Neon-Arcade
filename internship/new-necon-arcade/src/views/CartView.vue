<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import OrderSummary from '../components/OrderSummary.vue'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const router = useRouter()
const isLoading = ref(true)
const promoCode = ref('')
const promoDiscount = ref(0)
const showPromoSuccess = ref(false)

const cartItems = computed(() => store.getters.cartItems)
const cartTotal = computed(() => store.getters.cartTotal)
const cartItemCount = computed(() => store.getters.cartItemCount)
const subtotal = computed(() => cartTotal.value)
const tax = computed(() => subtotal.value * 0.08) // 8% tax
const shipping = computed(() => cartItems.value.length > 0 ? 0 : 0) // Free shipping
const discount = computed(() => subtotal.value * (promoDiscount.value / 100))
const finalTotal = computed(() => subtotal.value + tax.value + shipping.value - discount.value)

const validPromoCodes = {
  'CYBER20': 20,
  'NEON15': 15,
  'GAMER10': 10,
  'WELCOME5': 5
}

// Initialize FSM composable
const { state, context, nextEvents, error, sendTransition } = useFsm()

const updateQuantity = async (gameId, event) => {
  const quantity = parseInt(event.target.value)
  if (quantity > 0) {
    try {
      await sendTransition('globalKey', 'UPDATE_QUANTITY', { gameId, quantity })
    } catch (error) {
      console.error('FSM transition error:', error)
    }
    store.dispatch('updateCartQuantity', { gameId, quantity })
  }
}

const removeItem = async (gameId) => {
  try {
    await sendTransition('globalKey', 'REMOVE_ITEM', { gameId })
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  store.dispatch('removeFromCart', gameId)
}

const applyPromoCode = async () => {
  const code = promoCode.value.toUpperCase()
  if (validPromoCodes[code]) {
    try {
      await sendTransition('globalKey', 'APPLY_PROMO', { code })
    } catch (error) {
      console.error('FSM transition error:', error)
    }
    promoDiscount.value = validPromoCodes[code]
    showPromoSuccess.value = true
    setTimeout(() => {
      showPromoSuccess.value = false
    }, 3000)
  } else {
    // Show error message
    alert('Invalid promo code')
  }
}

const proceedToCheckout = async () => {
  try {
    await sendTransition('globalKey', 'PROCEED_TO_CHECKOUT')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  router.push('/checkout')
}

const continueShopping = async () => {
  try {
    await sendTransition('globalKey', 'CONTINUE_SHOPPING')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  router.push('/games')
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})
</script>

<template>
  <div class="cart-view">
    <div class="container">
      <!-- Header -->
      <div class="cart-header">
        <h1 class="page-title">Shopping Cart</h1>
        <p class="page-subtitle">Review your cyberpunk gaming collection</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container cyber-panel">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartItems.length === 0" class="empty-cart cyber-panel">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Your cart is empty</h2>
        <p class="empty-cart-text">Discover amazing cyberpunk games and start building your collection</p>
        <button @click="continueShopping" class="continue-shopping-btn cyber-button">
          Browse Games
        </button>
      </div>

      <!-- Cart Content -->
      <div v-else class="cart-content">
        <div class="cart-main">
          <!-- Cart Items -->
          <div class="cart-items-section cyber-panel">
            <div class="section-header">
              <h2 class="section-title">Items ({{ cartItemCount }})</h2>
            </div>
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item cyber-panel-inner">
                <div class="item-image">
                  <img :src="item.image" :alt="item.title" />
                </div>
                <div class="item-details">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <div class="item-meta">
                    <span class="item-genre">{{ item.genre }}</span>
                    <div class="item-platforms">
                      <span v-for="platform in item.platform" :key="platform" class="platform-tag">
                        {{ platform }}
                      </span>
                    </div>
                  </div>
                  <div class="item-rating">
                    <div class="stars">
                      <span v-for="n in Math.floor(item.rating)" :key="n" class="star filled">★</span>
                    </div>
                    <span class="rating-number">({{ item.rating }})</span>
                  </div>
                </div>
                <div class="item-controls">
                  <div class="quantity-controls">
                    <label for="quantity">Quantity:</label>
                    <input
                      type="number"
                      :value="item.quantity"
                      @change="updateQuantity(item.id, $event)"
                      min="1"
                      class="cyber-input quantity-input"
                    />
                  </div>
                  <div class="item-price">
                    <span v-if="item.originalPrice" class="original-price">₨{{ item.originalPrice.toLocaleString() }}</span>
                    <span class="current-price">₨{{ item.price.toLocaleString() }}</span>
                  </div>
                  <button
                    @click="removeItem(item.id)"
                    class="remove-btn cyber-button secondary"
                    title="Remove from cart"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Promo Code Section -->
          <div class="promo-section cyber-panel">
            <h3 class="promo-title">Promo Code</h3>
            <div class="promo-form">
              <input
                v-model="promoCode"
                type="text"
                placeholder="Enter promo code"
                class="promo-input cyber-input"
              />
              <button @click="applyPromoCode" class="apply-btn cyber-button">
                Apply
              </button>
            </div>
            <div v-if="showPromoSuccess" class="promo-success">
              ✅ Promo code applied! {{ promoDiscount }}% discount
            </div>
            <div class="promo-suggestions">
              <span class="promo-hint">Try: CYBER20, NEON15, GAMER10</span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="cart-sidebar cyber-panel">
          <OrderSummary :cart-total="finalTotal" />
          <button
            @click="proceedToCheckout"
            class="checkout-btn cyber-button"
            :disabled="cartItemCount === 0"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* General Cyberpunk Theme Variables */
:root {
  --cyber-dark-bg: #0a0a0a;
  --cyber-panel-bg: #1a1a1a;
  --cyber-border-color: #00f0ff; /* Neon Cyan */
  --cyber-accent-green: #00ff66; /* Neon Green */
  --cyber-accent-purple: #9900ff;
  --cyber-text-primary: #e0e0e0;
  --cyber-text-secondary: #a0a0a0;
  --cyber-glow-intensity: 0 0 15px var(--cyber-border-color), 0 0 30px var(--cyber-border-color);
  --cyber-glow-green: 0 0 15px var(--cyber-accent-green), 0 0 30px var(--cyber-accent-green);
  --cyber-glow-purple: 0 0 15px var(--cyber-accent-purple), 0 0 30px var(--cyber-accent-purple);
  --cyber-shadow-offset: 5px;
}

/* Base styles for the view */
.cart-view {
  padding-top: 90px;
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Orbitron', monospace; /* Ensure futuristic font */
  perspective: 1000px; /* For 3D effects */
  overflow-x: hidden; /* Prevent horizontal scroll from 3D transforms */
}

/* Page Header */
.cart-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 3.5rem; /* Slightly larger */
  font-weight: 900;
  margin-bottom: 15px;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  animation: glitch-text 3s infinite alternate; /* Glitch animation */
  position: relative;
  z-index: 10;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--cyber-text-secondary);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.2);
}

/* Cyber Panel Base Style */
.cyber-panel {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 8px;
  box-shadow: var(--cyber-glow-intensity), inset 0 0 10px rgba(0, 240, 255, 0.2);
  padding: 30px;
  position: relative;
  transform-style: preserve-3d; /* For nested 3D elements */
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  animation: border-pulse 4s infinite alternate; /* Subtle border pulse */
}

.cyber-panel::before,
.cyber-panel::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid var(--cyber-accent-green);
  box-shadow: 0 0 8px var(--cyber-accent-green);
}

.cyber-panel::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.cyber-panel::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

/* Inner Cyber Panel for forms and items */
.cyber-panel-inner {
  background-color: rgba(26, 26, 26, 0.8); /* Slightly more transparent */
  border: 1px solid var(--cyber-accent-purple);
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(153, 0, 255, 0.3), inset 0 0 5px rgba(153, 0, 255, 0.1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.cyber-panel-inner:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 15px rgba(153, 0, 255, 0.5), inset 0 0 8px rgba(153, 0, 255, 0.2);
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 80px 20px;
  margin: 0 auto;
  max-width: 600px;
}

.loading-spinner {
  width: 60px; /* Larger spinner */
  height: 60px;
  border: 5px solid rgba(0, 255, 102, 0.3);
  border-top: 5px solid var(--cyber-accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite, pulse-glow 2s infinite alternate;
  margin: 0 auto 20px;
  box-shadow: var(--cyber-glow-green);
}

.loading-text {
  color: var(--cyber-text-secondary);
  font-size: 1.2rem;
  text-shadow: 0 0 5px rgba(0, 255, 102, 0.2);
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 50px;
  margin: 0 auto;
  max-width: 600px;
}

.empty-cart-icon {
  font-size: 5rem;
  margin-bottom: 30px;
  opacity: 0.5;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
}

.empty-cart-title {
  font-size: 2.2rem;
  color: var(--cyber-text-primary);
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.empty-cart-text {
  color: var(--cyber-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.continue-shopping-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
}

/* Cart Content Layout */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  transform: rotateX(2deg) rotateY(-2deg); /* Subtle 3D tilt for the whole content area */
  transform-origin: center center;
}

/* Section Headers */
.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 2rem; /* Larger */
  color: var(--cyber-border-color);
  margin: 0;
  text-shadow: var(--cyber-glow-intensity);
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--cyber-accent-green), var(--cyber-border-color));
  margin: 10px auto 0;
  box-shadow: var(--cyber-glow-green);
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 20px;
  align-items: center;
}

.item-image {
  width: 120px;
  height: 80px;
  border: 2px solid var(--cyber-accent-purple);
  box-shadow: 0 0 10px rgba(153, 0, 255, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-image img:hover {
  transform: scale(1.05);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-title {
  color: var(--cyber-text-primary);
  font-size: 1.3rem;
  margin: 0;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-genre {
  background: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.item-platforms {
  display: flex;
  gap: 5px;
}

.platform-tag {
  background: rgba(0, 255, 65, 0.1);
  color: var(--cyber-accent-green);
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 8px;
  border: 1px solid var(--cyber-accent-green);
  text-transform: uppercase;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--cyber-text-secondary);
  font-size: 14px;
}

.star.filled {
  color: #ffcc00; /* Gold for stars */
  text-shadow: 0 0 5px #ffcc00;
}

.rating-number {
  color: var(--cyber-text-secondary);
  font-size: 12px;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--cyber-border-color);
  border-radius: 6px;
  padding: 5px;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.1);
}

.cyber-input {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  box-shadow: inset 0 0 5px rgba(153, 0, 255, 0.2);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: var(--cyber-border-color);
  box-shadow: inset 0 0 8px rgba(0, 240, 255, 0.3), 0 0 5px var(--cyber-border-color);
}

.quantity-input {
  width: 70px;
  padding: 8px;
  text-align: center;
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.original-price {
  color: var(--cyber-text-secondary);
  text-decoration: line-through;
  font-size: 14px;
}

.current-price {
  color: var(--cyber-accent-green);
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: var(--cyber-glow-green);
}

.remove-btn {
  background: none;
  border: 2px solid var(--cyber-text-secondary);
  color: var(--cyber-text-secondary);
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(160, 160, 160, 0.2);
}

.remove-btn:hover {
  border-color: #ff0000; /* Red for remove */
  color: #ff0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
  transform: scale(1.1);
}

/* Promo Section */
.promo-section {
  padding: 20px;
}

.promo-title {
  color: var(--cyber-accent-green);
  margin-bottom: 15px;
  font-size: 1.1rem;
  text-shadow: var(--cyber-glow-green);
}

.promo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.promo-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
}

.apply-btn {
  padding: 10px 20px;
  font-size: 14px;
  white-space: nowrap;
}

.promo-success {
  color: var(--cyber-accent-green);
  font-weight: 600;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--cyber-accent-green);
  border-radius: 4px;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.promo-suggestions {
  font-size: 12px;
  color: var(--cyber-text-secondary);
}

.promo-hint {
  font-style: italic;
}

/* Cart Sidebar (Order Summary) */
.cart-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px; /* Adjust based on your header height */
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  background: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  border-color: var(--cyber-accent-green);
}

.checkout-btn:hover:not(:disabled) {
  background: transparent;
  color: var(--cyber-accent-green);
  box-shadow: var(--cyber-glow-green);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Cyber Button Styling (re-defined for this component for self-containment) */
.cyber-button {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  border: 2px solid var(--cyber-accent-purple);
  padding: 12px 25px;
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  box-shadow: var(--cyber-glow-purple);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%); /* Angular shape */
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.5s ease;
}

.cyber-button:hover {
  background-color: var(--cyber-border-color);
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
  transform: translateY(-3px) scale(1.02); /* Lift and slightly enlarge */
}

.cyber-button:hover::before {
  left: 100%;
}

.cyber-button.secondary {
  background-color: transparent;
  border-color: var(--cyber-text-secondary);
  color: var(--cyber-text-secondary);
  box-shadow: none;
}

.cyber-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: var(--cyber-border-color);
  color: var(--cyber-border-color);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 5px rgba(0, 255, 102, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 102, 0.8), 0 0 30px rgba(0, 255, 102, 0.6); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 102, 0.5); }
}

@keyframes border-pulse {
  0% { border-color: var(--cyber-border-color); box-shadow: var(--cyber-glow-intensity); }
  50% { border-color: var(--cyber-accent-green); box-shadow: var(--cyber-glow-green); }
  100% { border-color: var(--cyber-border-color); box-shadow: var(--cyber-glow-intensity); }
}

@keyframes glitch-text {
  0% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-2px, 2px);
  }
  40% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(2px, -2px);
  }
  60% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-1px, 1px);
  }
  80% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(1px, -1px);
  }
  100% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
}

/* Responsive Design */
@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 30px;
    transform: none; /* Remove 3D tilt on smaller screens */
  }
  
  .cart-sidebar {
    position: static;
  }
  
  .cyber-panel::before, 
  .cyber-panel::after {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.8rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: center;
  }
  
  .item-image {
    width: 100%;
    height: 150px;
    margin: 0 auto;
  }
  
  .item-meta {
    justify-content: center;
  }
  
  .item-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .promo-form {
    flex-direction: column;
  }
  
  .cyber-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2.2rem;
    margin-bottom: 40px;
  }
  
  .cart-item {
    padding: 15px;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .item-title {
    font-size: 1.2rem;
  }
  
  .current-price {
    font-size: 1rem;
  }
  
  .cart-view {
    padding: 60px 15px;
  }
  
  .cyber-panel {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
}
</style>