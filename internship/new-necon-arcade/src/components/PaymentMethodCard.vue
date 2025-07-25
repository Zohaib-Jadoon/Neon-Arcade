<script setup>
import { ref } from 'vue'

const props = defineProps({
  method: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const cardDetails = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const isProcessing = ref(false)
const errors = ref({})

const formatCardNumber = (value) => {
  // Remove all non-digits
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  // Add spaces every 4 digits
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4)
  }
  return v
}

const onCardNumberInput = (event) => {
  cardDetails.value.number = formatCardNumber(event.target.value)
}

const onExpiryInput = (event) => {
  cardDetails.value.expiry = formatExpiry(event.target.value)
}

const validateCard = () => {
  errors.value = {}
  // Card number validation
  const cardNumber = cardDetails.value.number.replace(/\s/g, '')
  if (!cardNumber || cardNumber.length < 16) {
    errors.value.number = 'Please enter a valid card number'
  }
  // Expiry validation
  if (!cardDetails.value.expiry || cardDetails.value.expiry.length !== 5) {
    errors.value.expiry = 'Please enter a valid expiry date'
  } else {
    const [month, year] = cardDetails.value.expiry.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    if (parseInt(month) < 1 || parseInt(month) > 12) {
      errors.value.expiry = 'Invalid month'
    } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.value.expiry = 'Card has expired'
    }
  }
  // CVV validation
  if (!cardDetails.value.cvv || cardDetails.value.cvv.length < 3) {
    errors.value.cvv = 'Please enter a valid CVV'
  }
  // Name validation
  if (!cardDetails.value.name.trim()) {
    errors.value.name = 'Please enter the cardholder name'
  }

  return Object.keys(errors.value).length === 0
}

const processPayment = async () => {
  if (!validateCard()) {
    return
  }

  isProcessing.value = true

  try {
    // Simulate card payment processing
    await new Promise(resolve => setTimeout(resolve, 4000))

    // Generate transaction ID
    const transactionId = 'CC' + Date.now()

    // Simulate success (85% success rate)
    if (Math.random() > 0.15) {
      emit('success', {
        method: 'Credit/Debit Card',
        transactionId,
        cardLast4: cardDetails.value.number.slice(-4),
        cardType: getCardType(cardDetails.value.number),
        timestamp: new Date().toISOString()
      })
    } else {
      throw new Error('Payment declined by bank')
    }
  } catch (error) {
    emit('error', error)
  } finally {
    isProcessing.value = false
  }
}

const getCardType = (number) => {
  const cleanNumber = number.replace(/\s/g, '')
  if (cleanNumber.startsWith('4')) return 'Visa'
  if (cleanNumber.startsWith('5')) return 'Mastercard'
  if (cleanNumber.startsWith('3')) return 'American Express'
  return 'Unknown'
}
</script>

<template>
  <div
    class="payment-method-card"
    :class="{ 'selected': isSelected }"
    @click="emit('select', method.id)"
  >
    <span class="method-icon">{{ method.icon }}</span>
    <h3 class="method-name">{{ method.name }}</h3>
    <div v-if="isSelected" class="selected-indicator">✅</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

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
  --neon-red: #ff3366;
  --neon-yellow: #ffff00;
}

.payment-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px; /* Increased padding */
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background-color: var(--cyber-panel-bg); /* Cyberpunk panel background */
  border: 2px solid var(--cyber-border-color); /* Neon border */
  border-radius: 15px; /* Slightly rounded corners */
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 8px rgba(0, 240, 255, 0.1); /* Stronger glow */
  overflow: hidden;
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(2deg) rotateX(-2deg); /* Subtle 3D tilt */
}

.payment-method-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.05), transparent);
  animation: shimmer 5s infinite;
  transform: translateX(-100%);
  z-index: 1;
}

.payment-method-card:hover {
  transform: translateY(-8px) scale(1.02) perspective(1000px) rotateY(0deg) rotateX(0deg); /* Lift, enlarge, and straighten on hover */
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.7), inset 0 0 12px rgba(0, 240, 255, 0.3);
}

.payment-method-card:hover::before {
  animation-play-state: paused; /* Pause shimmer on hover */
  transform: translateX(0);
}

.payment-method-card.selected {
  border-color: var(--cyber-accent-green); /* Neon green border when selected */
  box-shadow: 0 0 30px rgba(0, 255, 102, 0.8), inset 0 0 15px rgba(0, 255, 102, 0.4); /* Stronger green glow */
  background-color: rgba(0, 255, 102, 0.15); /* Subtle green tint */
  transform: translateY(-10px) scale(1.03) perspective(1000px) rotateY(0deg) rotateX(0deg); /* More pronounced lift */
}

.method-icon {
  font-size: 3.5rem; /* Larger icon */
  margin-bottom: 15px;
  display: block;
  color: var(--cyber-border-color); /* Neon cyan color */
  text-shadow: 0 0 10px var(--cyber-border-color), 0 0 20px rgba(0, 240, 255, 0.5); /* Neon glow */
  position: relative;
  z-index: 2;
}

.method-name {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem; /* Slightly larger font */
  color: var(--cyber-text-primary); /* Primary text color */
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3); /* Subtle text glow */
  position: relative;
  z-index: 2;
}

.selected-indicator {
  position: absolute;
  top: 15px; /* Adjusted position */
  right: 15px; /* Adjusted position */
  font-size: 1.8rem; /* Larger indicator */
  color: var(--cyber-accent-green); /* Neon green checkmark */
  text-shadow: 0 0 10px var(--cyber-accent-green); /* Green glow */
  animation: pulse-indicator 1.5s infinite alternate; /* Pulsing animation */
  z-index: 2;
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-indicator {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-method-card {
    padding: 20px;
    transform: none; /* Remove 3D tilt on smaller screens */
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Straighten clip-path */
  }
  .method-icon {
    font-size: 3rem;
  }
  .method-name {
    font-size: 1.1rem;
  }
  .selected-indicator {
    font-size: 1.5rem;
    top: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .payment-method-card {
    padding: 15px;
  }
  .method-icon {
    font-size: 2.5rem;
  }
  .method-name {
    font-size: 1rem;
  }
  .selected-indicator {
    font-size: 1.3rem;
    top: 8px;
    right: 8px;
  }
}
</style>
