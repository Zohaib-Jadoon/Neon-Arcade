<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFsm } from '../composables/useFsm' // Assuming this path is correct

const store = useStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('gamer') // Default role
const errorMessage = ref('')
const successMessage = ref('')

// Seller profile fields
const companyName = ref('')
const contactPhone = ref('')
const address = ref('')

// FSM integration (unchanged)
const { state, context, nextEvents, error: fsmError, sendTransition, fetchInitialState } = useFsm()
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('START') // Example transition event

onMounted(() => {
  fetchInitialState(fsmKey)
})

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}

const handleSignup = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  const userData = {
    name: name.value,
    email: email.value,
    password: password.value, // In a real app, this would be hashed
    role: role.value,
  }

  if (role.value === 'seller') {
    userData.sellerProfile = {
      companyName: companyName.value,
      contactEmail: email.value, // Seller's contact email is their login email
      contactPhone: contactPhone.value,
      address: address.value,
      gamesListed: 0, // Initialize games listed for new sellers
    }
    // Basic validation for seller fields
    if (!companyName.value || !contactPhone.value || !address.value) {
      errorMessage.value = 'Please fill in all seller profile details.'
      return
    }
  }

  try {
    // Send FSM transition for signup
    const response = await sendTransition('globalKey', 'SIGNUP', userData);

    if (response.errorMessage) {
      errorMessage.value = response.errorMessage;
      return;
    }

    successMessage.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    errorMessage.value = error.message || 'Signup failed. Please try again.'
  }
}
</script>

<template>
  <div class="signup-view">
    <div class="signup-container cyber-card" :class="{ 'has-error': errorMessage }">
      <h1 class="signup-title neon-glow">Sign Up</h1>
      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="name" required class="cyber-input" />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required class="cyber-input" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required class="cyber-input" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required class="cyber-input" />
        </div>
        <div class="form-group">
          <label for="role">Register As:</label>
          <select id="role" v-model="role" class="cyber-input">
            <option value="gamer">Gamer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <div v-if="role === 'seller'" class="seller-fields">
          <h2 class="seller-fields-title">Seller Profile Details</h2>
          <div class="form-group">
            <label for="companyName">Company Name:</label>
            <input type="text" id="companyName" v-model="companyName" required class="cyber-input" />
          </div>
          <div class="form-group">
            <label for="contactPhone">Contact Phone:</label>
            <input type="tel" id="contactPhone" v-model="contactPhone" required class="cyber-input" />
          </div>
          <div class="form-group">
            <label for="address">Address:</label>
            <textarea id="address" v-model="address" required rows="3" class="cyber-input"></textarea>
          </div>
        </div>
        <p v-if="errorMessage" class="error-message animate-shake">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <button type="submit" class="signup-button cyber-button">Sign Up</button>
      </form>
      <div class="links">
        <router-link to="/login" class="link">Already have an account? Login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Define additional CSS variables for consistent theming */
:root {
  --card-bg: #1a1a2e;
  --card-border: #00f0ff;
  --neon-green: #00ff99;
  --neon-cyan: #00f0ff;
  --neon-purple: #9900ff; /* Added for seller fields title */
  --error-color: #ff4d4d;
  --success-color: #4CAF50; /* For success message */
  --text-color: #e0e0e0;
  --input-bg: #0f0f1a;
  --input-border-focus: #00ff99;
  --button-hover-bg: #000000; /* Black hover color */
  --button-active-bg: #333333; /* Darker grey for active */
  --link-hover-color: #00ff99;
  --button-text-color-hover: #00ff99; /* Neon green text on black hover */
  --border-color: #00f0ff; /* For dashed border */
}

.signup-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
}

.signup-container {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 40px;
  box-shadow:
    0 5px 20px rgba(0, 240, 255, 0.5), /* Main glow */
    0 10px 30px rgba(0, 240, 255, 0.3), /* Deeper glow */
    0 15px 40px rgba(0, 240, 255, 0.1); /* Fainter, wider glow for depth */
  text-align: center;
  max-width: 550px;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform-style: preserve-3d;
}

.signup-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 240, 255, 0.05),
    rgba(0, 240, 255, 0.05) 2px,
    transparent 2px,
    transparent 4px
  );
  z-index: 0;
  opacity: 0.1;
}

.signup-container:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 25px rgba(0, 240, 255, 0.7),
    0 15px 40px rgba(0, 240, 255, 0.5),
    0 20px 50px rgba(0, 240, 255, 0.2);
}

.signup-container.has-error {
  box-shadow:
    0 5px 20px var(--error-color),
    0 10px 30px rgba(255, 77, 77, 0.7),
    0 15px 40px rgba(255, 77, 77, 0.4);
  animation: pulse-red 0.5s ease-in-out;
}

.signup-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: var(--neon-green);
  text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  animation: neon-flicker 1.5s infinite alternate;
  position: relative;
  z-index: 1;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--neon-cyan);
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}

.cyber-input {
  width: calc(100% - 24px);
  padding: 12px;
  font-size: 1rem;
  background-color: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 4px;
  color: var(--text-color);
  outline: none;
  box-shadow:
    inset 0 0 8px rgba(0, 240, 255, 0.3),
    0 1px 0 rgba(0, 240, 255, 0.1),
    0 -1px 0 rgba(0, 240, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.cyber-input:focus {
  border-color: var(--input-border-focus);
  box-shadow:
    0 0 15px var(--input-border-focus),
    inset 0 0 10px rgba(0, 240, 255, 0.6);
}

.signup-container.has-error .cyber-input {
  border-color: var(--error-color);
  box-shadow:
    0 0 10px var(--error-color),
    inset 0 0 8px rgba(255, 77, 77, 0.6);
}

.seller-fields {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed var(--border-color);
  position: relative;
  z-index: 1;
}

.seller-fields-title {
  font-size: 1.8rem;
  color: var(--neon-purple);
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 8px var(--neon-purple);
}

.error-message {
  color: var(--error-color);
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(255, 77, 77, 0.5);
}

.success-message {
  color: var(--success-color);
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
}

.cyber-button {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  background-color: var(--neon-green);
  color: var(--card-bg);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow:
    0 5px 15px rgba(0, 255, 153, 0.7),
    0 2px 5px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.1s ease, color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.cyber-button:hover::before {
  transform: translateX(100%);
}

.cyber-button:hover {
  background-color: var(--button-hover-bg);
  color: var(--button-text-color-hover);
  box-shadow:
    0 0 20px rgba(0, 255, 153, 0.9),
    0 0 30px rgba(0, 255, 153, 0.5),
    0 8px 20px rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

.cyber-button:active {
  background-color: var(--button-active-bg);
  color: var(--button-text-color-hover);
  box-shadow:
    0 2px 5px rgba(0, 255, 153, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.5);
  transform: translateY(2px);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.link {
  color: var(--neon-cyan);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.link:hover {
  color: var(--link-hover-color);
  text-shadow: 0 0 8px var(--link-hover-color);
}

/* Animations */
@keyframes neon-flicker {
  0%, 100% {
    text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  }
  50% {
    text-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green);
  }
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 5px 20px rgba(0, 240, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 35px var(--error-color);
  }
  100% {
    box-shadow: 0 5px 20px rgba(0, 240, 255, 0.5);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .signup-container {
    padding: 30px;
  }
  .signup-title {
    font-size: 2rem;
  }
  .cyber-button {
    font-size: 1rem;
    padding: 12px;
  }
  .seller-fields-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .signup-container {
    padding: 20px;
  }
  .signup-title {
    font-size: 1.8rem;
  }
  .form-group label {
    font-size: 1rem;
  }
  .cyber-input {
    padding: 10px;
  }
}
</style>