PAYMENT METHOD CREDIT CARD



<script setup>
import { ref } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['success', 'error'])

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
        amount: props.amount,
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
  <div class="card-payment cyber-card">
    <div class="payment-header">
      <div class="card-icons">
        <span class="card-icon">💳</span>
        <span class="card-icon">🏦</span>
      </div>
      <h3 class="payment-title">Card Payment</h3>
    </div>

    <div v-if="!isProcessing" class="card-form">
      <div class="form-group">
        <label class="form-label">Card Number</label>
        <input
          :value="cardDetails.number"
          @input="onCardNumberInput"
          type="text"
          class="cyber-input"
          :class="{ 'error': errors.number }"
          placeholder="1234 5678 9012 3456"
          maxlength="19"
        />
        <span v-if="errors.number" class="error-message">{{ errors.number }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Expiry Date</label>
          <input
            :value="cardDetails.expiry"
            @input="onExpiryInput"
            type="text"
            class="cyber-input"
            :class="{ 'error': errors.expiry }"
            placeholder="MM/YY"
            maxlength="5"
          />
          <span v-if="errors.expiry" class="error-message">{{ errors.expiry }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">CVV</label>
          <input
            v-model="cardDetails.cvv"
            type="password"
            class="cyber-input"
            :class="{ 'error': errors.cvv }"
            placeholder="123"
            maxlength="4"
          />
          <span v-if="errors.cvv" class="error-message">{{ errors.cvv }}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Cardholder Name</label>
        <input
          v-model="cardDetails.name"
          type="text"
          class="cyber-input"
          :class="{ 'error': errors.name }"
          placeholder="John Doe"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="amount-display">
        <span class="amount-label">Amount to Pay:</span>
        <span class="amount-value">₨{{ amount.toLocaleString() }}</span>
      </div>

      <button 
        @click="processPayment"
        class="pay-btn cyber-button"
        :disabled="isProcessing"
      >
        Pay ₨{{ amount.toLocaleString() }}
      </button>
    </div>

    <div v-else class="processing-step">
      <div class="processing-animation">
        <div class="spinner"></div>
        <h4 class="processing-title">Processing Payment...</h4>
        <p class="processing-description">Please wait while we process your card payment</p>
      </div>
      
      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">Card:</span>
          <span class="detail-value">**** **** **** {{ cardDetails.number.slice(-4) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">₨{{ amount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div class="security-notice">
      <div class="security-icon">🔒</div>
      <p class="security-text">
        Your card details are encrypted and secure. We never store your payment information.
      </p>
    </div>
  </div>
</template>

<style scoped>
.card-payment {
  padding: 30px;
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  max-width: 400px;
  margin: 0 auto;
}

.payment-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-icons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.card-icon {
  font-size: 2rem;
}

.payment-title {
  font-family: 'Orbitron', monospace;
  color: var(--neon-green);
  margin: 0;
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 12px;
}

.amount-display {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.amount-label {
  color: var(--text-secondary);
  font-size: 14px;
  display: block;
  margin-bottom: 5px;
}

.amount-value {
  color: var(--neon-green);
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.5rem;
}

.pay-btn {
  width: 100%;
  padding: 15px;
  font-weight: 700;
  font-size: 16px;
}

.processing-step {
  text-align: center;
}

.processing-animation {
  margin-bottom: 25px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--neon-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.processing-title {
  color: var(--neon-green);
  font-weight: 600;
  margin-bottom: 8px;
}

.processing-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.transaction-details {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(0, 255, 65, 0.05);
  border: 1px solid var(--neon-green);
  border-radius: 6px;
}

.security-icon {
  color: var(--neon-green);
  font-size: 1.2rem;
}

.security-text {
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
