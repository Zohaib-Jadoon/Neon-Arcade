<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import PaymentMethodCard from '../components/PaymentMethodCard.vue'
import PaymentMethodEasyPaisa from '../components/PaymentMethodEasyPaisa.vue'
import PaymentMethodCreditCard from '../components/PaymentMethodCreditCard.vue'
import OrderSummary from '../components/OrderSummary.vue'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const router = useRouter()

const cartItems = computed(() => store.getters.cartItems)
const cartTotal = computed(() => store.getters.cartTotal)
const user = computed(() => store.getters.user)

const selectedPaymentMethod = ref(null)
const paymentProcessing = ref(false)
const paymentSuccess = ref(false)
const paymentMessage = ref('')
const transactionId = ref('')

const paymentMethods = [
  { id: 'easypaisa', name: 'EasyPaisa', icon: '💸' },
  { id: 'jazzcash', name: 'JazzCash', icon: '📱' },
  { id: 'banktransfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'creditcard', name: 'Credit/Debit Card', icon: '💳' },
]

const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId
}

const handlePaymentDetails = async (details) => {
  paymentProcessing.value = true
  paymentMessage.value = 'Processing your payment...'
  try {
    // Calculate total amount including shipping for the order
    const totalAmountForOrder = cartTotal.value + (cartTotal.value > 0 ? 500 : 0);
    // Create an order first
    const orderData = {
      userId: user.value?.id,
      items: cartItems.value,
      totalAmount: totalAmountForOrder,
      paymentMethod: details.method,
      paymentDetails: details.details,
    }
    const newOrder = await store.dispatch('createOrder', orderData)
    // Simulate payment processing success/failure
    // In a real app, this would be an API call to a payment gateway
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({ success: true, transactionId: `TXN-${Date.now()}` })
        } else {
          reject({ success: false, message: 'Payment failed. Please try again.' })
        }
      }, 2000)
    })

    if (response.success) {
      paymentSuccess.value = true
      paymentMessage.value = 'Payment successful! Your order has been placed.'
      transactionId.value = response.transactionId
      await store.dispatch('updateOrderStatus', { orderId: newOrder.id, status: 'completed', paymentDetails: details.details })
      await store.dispatch('clearCart') // Clear cart after successful payment
    } else {
      paymentSuccess.value = false
      paymentMessage.value = response.message || 'Payment failed.'
      await store.dispatch('updateOrderStatus', { orderId: newOrder.id, status: 'failed', paymentDetails: details.details })
    }
  } catch (error) {
    paymentSuccess.value = false
    paymentMessage.value = error.message || 'An unexpected error occurred during payment.'
    // If order was created but payment failed, update its status
    if (store.getters.currentOrder) {
      await store.dispatch('updateOrderStatus', { orderId: store.getters.currentOrder.id, status: 'failed', paymentDetails: details.details })
    }
  } finally {
    paymentProcessing.value = false
  }
}

const resetPayment = () => {
  paymentSuccess.value = false
  paymentMessage.value = ''
  transactionId.value = ''
  selectedPaymentMethod.value = null
}

const goToOrders = () => {
  router.push('/profile') // Assuming profile page shows orders
}

// Calculate total amount including shipping for display in OrderSummary
const totalAmountForSummary = computed(() => {
  return cartTotal.value + (cartTotal.value > 0 ? 500 : 0);
});

const { state, context, nextEvents, error, sendTransition } = useFsm()
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('START') // Example transition event

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}
</script>

<template>
  <div class="checkout-view container">
    <h1 class="page-title">Checkout</h1>

    <div v-if="cartItems.length === 0 && !paymentSuccess" class="empty-cart cyber-panel">
      <p>Your cart is empty. Please add items before checking out.</p>
      <button @click="router.push('/games')" class="cyber-button">Browse Games</button>
    </div>

    <div v-else-if="paymentProcessing" class="payment-status cyber-panel">
      <div class="loading-spinner"></div>
      <p class="status-message">Processing your payment...</p>
    </div>

    <div v-else-if="paymentSuccess" class="payment-success cyber-panel">
      <div class="success-icon">✅</div>
      <h2 class="success-title">Payment Successful!</h2>
      <p class="success-message">{{ paymentMessage }}</p>
      <p class="transaction-id">Transaction ID: <span class="neon-yellow">{{ transactionId }}</span></p>
      <div class="success-actions">
        <button @click="goToOrders" class="cyber-button">View My Orders</button>
        <button @click="router.push('/')" class="cyber-button secondary">Continue Shopping</button>
      </div>
    </div>

    <div v-else class="checkout-content">
      <div class="payment-section cyber-panel">
        <h2 class="section-heading">1. Select Payment Method</h2>
        <div class="payment-methods-grid">
          <PaymentMethodCard
            v-for="method in paymentMethods"
            :key="method.id"
            :method="method"
            :is-selected="selectedPaymentMethod === method.id"
            @select="selectPaymentMethod"
          />
        </div>
        <div v-if="selectedPaymentMethod" class="payment-details-form cyber-panel-inner">
          <PaymentMethodEasyPaisa
            v-if="selectedPaymentMethod === 'easypaisa'"
            :amount="totalAmountForSummary"
            @payment-details="handlePaymentDetails"
            @cancel="selectedPaymentMethod = null"
          />
          <div v-else-if="selectedPaymentMethod === 'jazzcash'" class="cyber-panel-inner payment-form-placeholder">
            <h3 class="form-title">Pay with JazzCash</h3>
            <span class="method-icon">📱</span>
            <p class="instructions">JazzCash payment integration coming soon!</p>
            <button @click="selectedPaymentMethod = null" class="cyber-button secondary">Choose another method</button>
          </div>
          <div v-else-if="selectedPaymentMethod === 'banktransfer'" class="cyber-panel-inner payment-form-placeholder">
            <h3 class="form-title">Pay with Bank Transfer</h3>
            <span class="method-icon">🏦</span>
            <p class="instructions">Bank transfer details coming soon!</p>
            <button @click="selectedPaymentMethod = null" class="cyber-button secondary">Choose another method</button>
          </div>
          <PaymentMethodCreditCard
            v-else-if="selectedPaymentMethod === 'creditcard'"
            :amount="totalAmountForSummary"
            @success="handlePaymentDetails"
            @error="handlePaymentDetails"
          />
        </div>
      </div>

      <div class="order-summary-section cyber-panel">
        <h2 class="section-heading">2. Order Summary</h2>
        <OrderSummary :cart-total="totalAmountForSummary" />
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
.checkout-view {
  padding: 80px 20px;
  min-height: calc(100vh - 60px);
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Orbitron', monospace; /* Ensure futuristic font */
  perspective: 1000px; /* For 3D effects */
  overflow-x: hidden; /* Prevent horizontal scroll from 3D transforms */
}

/* Page Title */
.page-title {
  font-size: 3.5rem; /* Slightly larger */
  text-align: center;
  margin-bottom: 60px; /* More space */
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  animation: glitch-text 3s infinite alternate; /* Glitch animation */
  position: relative;
  z-index: 10;
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

/* Inner Cyber Panel for forms */
.cyber-panel-inner {
  background-color: rgba(26, 26, 26, 0.8); /* Slightly more transparent */
  border: 1px solid var(--cyber-accent-purple);
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(153, 0, 255, 0.3), inset 0 0 5px rgba(153, 0, 255, 0.1);
  margin-top: 20px;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 50px;
  margin: 0 auto;
  max-width: 600px;
}
.empty-cart p {
  font-size: 1.5rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 30px;
}

/* Checkout Content Layout */
.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  transform: rotateX(2deg) rotateY(-2deg); /* Subtle 3D tilt for the whole content area */
  transform-origin: center center;
}

/* Section Headings */
.section-heading {
  font-family: 'Orbitron', monospace;
  font-size: 2rem; /* Larger */
  color: var(--cyber-border-color);
  margin-bottom: 30px;
  text-align: center;
  text-shadow: var(--cyber-glow-intensity);
  position: relative;
}
.section-heading::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--cyber-accent-green), var(--cyber-border-color));
  margin: 10px auto 0;
  box-shadow: var(--cyber-glow-green);
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* Payment Details Form */
.payment-details-form {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px dashed var(--cyber-border-color);
}

.payment-form-placeholder {
  padding: 30px;
  text-align: center;
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-accent-purple);
  border-radius: 8px;
  box-shadow: var(--cyber-glow-purple);
}
.payment-form-placeholder .form-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--cyber-accent-green);
  margin-bottom: 15px;
}
.payment-form-placeholder .method-icon {
  font-size: 3rem;
  margin: 0 auto 15px;
  display: block;
  color: var(--cyber-accent-green);
}
.payment-form-placeholder .instructions {
  font-size: 1rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 20px;
}

/* Payment Status */
.payment-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  margin: 0 auto;
  max-width: 700px;
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 8px;
  box-shadow: var(--cyber-glow-intensity);
  padding: 40px;
}

.loading-spinner {
  border: 8px solid rgba(0, 255, 102, 0.3);
  border-top: 8px solid var(--cyber-accent-green);
  border-radius: 50%;
  width: 80px; /* Larger spinner */
  height: 80px;
  animation: spin 1s linear infinite, pulse-glow 2s infinite alternate; /* Add pulse glow */
  margin-bottom: 30px;
  box-shadow: var(--cyber-glow-green);
}

.status-message {
  font-size: 1.8rem; /* Larger */
  font-family: 'Orbitron', monospace;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 2s infinite alternate;
}

/* Payment Success */
.payment-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background-color: rgba(0, 255, 102, 0.1);
  border: 2px solid var(--cyber-accent-green);
  border-radius: 8px;
  padding: 40px;
  box-shadow: var(--cyber-glow-green);
  margin: 0 auto;
  max-width: 700px;
  animation: border-pulse-green 3s infinite alternate;
}
.success-icon {
  font-size: 5rem; /* Larger icon */
  color: var(--cyber-accent-green);
  margin-bottom: 25px;
  animation: pulse-glow 2s infinite alternate;
}
.success-title {
  font-family: 'Orbitron', monospace;
  font-size: 3rem; /* Larger title */
  margin-bottom: 20px;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}
.payment-success .success-message {
  font-size: 1.3rem;
  color: var(--cyber-text-primary);
  margin-bottom: 25px;
}
.transaction-id {
  font-size: 1.2rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 35px;
}
.transaction-id .neon-yellow {
  color: #ffff00; /* Specific yellow for transaction ID */
  text-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00;
}
.success-actions {
  display: flex;
  gap: 20px;
}

/* Cyber Button Styling */
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

@keyframes border-pulse-green {
  0% { border-color: var(--cyber-accent-green); box-shadow: var(--cyber-glow-green); }
  50% { border-color: var(--cyber-border-color); box-shadow: var(--cyber-glow-intensity); }
  100% { border-color: var(--cyber-accent-green); box-shadow: var(--cyber-glow-green); }
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
@media (max-width: 900px) {
  .checkout-content {
    grid-template-columns: 1fr;
    transform: none; /* Remove 3D tilt on smaller screens */
  }
  .order-summary-section {
    margin-top: 40px;
    padding-top: 40px;
    border-top: 1px dashed var(--cyber-border-color);
  }
  .cyber-panel::before, .cyber-panel::after {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.8rem;
  }
  .section-heading {
    font-size: 1.8rem;
  }
  .payment-methods-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  .success-title {
    font-size: 2.5rem;
  }
  .payment-success .success-message {
    font-size: 1.1rem;
  }
  .success-actions {
    flex-direction: column;
    gap: 15px;
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
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
  .success-icon {
    font-size: 4rem;
  }
  .success-title {
    font-size: 2rem;
  }
  .checkout-view {
    padding: 60px 15px;
  }
  .cyber-panel {
    padding: 20px;
  }
  .section-heading {
    font-size: 1.6rem;
  }
}
</style>