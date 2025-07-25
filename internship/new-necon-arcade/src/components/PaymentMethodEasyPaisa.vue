<script setup>
import { ref } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['payment-details', 'cancel'])

const mobileNumber = ref('')
const transactionId = ref('')
const paymentError = ref('')

const submitPayment = () => {
  paymentError.value = ''
  if (!mobileNumber.value || !transactionId.value) {
    paymentError.value = 'Please enter your mobile number and transaction ID.'
    return
  }

  // Simulate payment processing
  setTimeout(() => {
    if (Math.random() > 0.1) { // 90% success rate
      emit('payment-details', {
        method: 'EasyPaisa',
        details: {
          mobileNumber: mobileNumber.value,
          transactionId: transactionId.value
        }
      })
    } else {
      paymentError.value = 'Payment failed. Please check your details and try again.'
    }
  }, 1500)
}
</script>

<template>
  <div class="easy-paisa-form cyber-card">
    <h3 class="form-title">Pay with EasyPaisa</h3>
    <span class="easypaisa-icon">💸</span>
    <p class="instructions">
      Please transfer <strong>₨{{ amount.toLocaleString() }}</strong> to our EasyPaisa account: <strong>03XX-XXXXXXX</strong>.
      Then, enter your mobile number and the transaction ID below.
    </p>

    <div class="form-group">
      <label for="mobileNumber">Your EasyPaisa Mobile Number:</label>
      <input 
        type="text" 
        id="mobileNumber" 
        v-model="mobileNumber" 
        placeholder="e.g., 03XX-XXXXXXX" 
        class="cyber-input"
      />
    </div>
    <div class="form-group">
      <label for="transactionId">EasyPaisa Transaction ID:</label>
      <input 
        type="text" 
        id="transactionId" 
        v-model="transactionId" 
        placeholder="e.g., ABC123XYZ" 
        class="cyber-input"
      />
    </div>

    <p v-if="paymentError" class="error-message">{{ paymentError }}</p>

    <div class="form-actions">
      <button @click="submitPayment" class="cyber-button">Submit Payment</button>
      <button @click="emit('cancel')" class="cyber-button secondary">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.easy-paisa-form {
  padding: 30px;
  background-color: var(--card-bg);
  border: 2px solid var(--neon-green);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 255, 102, 0.3);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.form-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--neon-green);
  text-align: center;
  margin-bottom: 10px;
}

.easypaisa-icon {
  font-size: 3rem;
  margin: 0 auto 15px;
  display: block;
  color: var(--neon-green); /* Example color for emoji */
}

.instructions {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}

.instructions strong {
  color: var(--neon-yellow);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.95rem;
  color: var(--neon-cyan);
  font-weight: 600;
}

.cyber-input {
  width: 100%;
  padding: 10px 15px;
  font-size: 1rem;
}

.error-message {
  color: var(--error-color);
  font-size: 0.9rem;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.form-actions .cyber-button {
  flex-grow: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .easy-paisa-form {
    padding: 20px;
  }
  .form-title {
    font-size: 1.5rem;
  }
  .instructions {
    font-size: 0.9rem;
  }
  .form-group label {
    font-size: 0.9rem;
  }
  .cyber-input {
    font-size: 0.95rem;
  }
  .form-actions {
    flex-direction: column;
  }
}
</style>
