<script setup>
import { ref } from 'vue'
import { useFsm } from '../composables/useFsm' // Assuming this path is correct

const email = ref('')
const message = ref('')
const error = ref('')

// FSM integration (unchanged)
const { state, context, nextEvents, error: fsmError, sendTransition } = useFsm()
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

const handleSubmit = () => {
  message.value = ''
  error.value = ''

  if (!email.value) {
    error.value = 'Please enter your email address.'
    return
  }

  // Simulate API call for password reset
  setTimeout(() => {
    if (email.value === 'test@example.com' || email.value === 'gamer@example.com' || email.value === 'seller@example.com') {
      message.value = 'If an account with that email exists, a password reset link has been sent.'
      email.value = '' // Clear email field
    } else {
      // For security, we give a generic message even if email doesn't exist
      message.value = 'If an account with that email exists, a password reset link has been sent.'
      email.value = ''
    }
  }, 1500)
}
</script>

<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container cyber-card" :class="{ 'has-error': error }">
      <h1 class="forgot-password-title neon-glow">Forgot Password</h1>
      <p class="instructions">Enter your email address below and we'll send you a link to reset your password.</p>
      <form @submit.prevent="handleSubmit" class="forgot-password-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required class="cyber-input" />
        </div>
        <p v-if="error" class="error-message animate-shake">{{ error }}</p>
        <p v-if="message" class="success-message">{{ message }}</p>
        <button type="submit" class="submit-button cyber-button">Reset Password</button>
      </form>
      <div class="links">
        <router-link to="/login" class="link">Back to Login</router-link>
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
  --error-color: #ff4d4d;
  --success-color: #4CAF50;
  --text-color: #e0e0e0;
  --text-secondary: #a0a0a0; /* For instructions text */
  --input-bg: #0f0f1a;
  --input-border-focus: #00ff99;
  --button-hover-bg: #000000; /* Black hover color */
  --button-active-bg: #333333; /* Darker grey for active */
  --link-hover-color: #00ff99;
  --button-text-color-hover: #00ff99; /* Neon green text on black hover */
}

.forgot-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
}

.forgot-password-container {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 40px;
  box-shadow:
    0 5px 20px rgba(0, 240, 255, 0.5), /* Main glow */
    0 10px 30px rgba(0, 240, 255, 0.3), /* Deeper glow */
    0 15px 40px rgba(0, 240, 255, 0.1); /* Fainter, wider glow for depth */
  text-align: center;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform-style: preserve-3d;
}

.forgot-password-container::before {
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

.forgot-password-container:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 25px rgba(0, 240, 255, 0.7),
    0 15px 40px rgba(0, 240, 255, 0.5),
    0 20px 50px rgba(0, 240, 255, 0.2);
}

.forgot-password-container.has-error {
  box-shadow:
    0 5px 20px var(--error-color),
    0 10px 30px rgba(255, 77, 77, 0.7),
    0 15px 40px rgba(255, 77, 77, 0.4);
  animation: pulse-red 0.5s ease-in-out;
}

.forgot-password-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--neon-green);
  text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  animation: neon-flicker 1.5s infinite alternate;
  position: relative;
  z-index: 1;
}

.instructions {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.forgot-password-form {
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

.forgot-password-container.has-error .cyber-input {
  border-color: var(--error-color);
  box-shadow:
    0 0 10px var(--error-color),
    inset 0 0 8px rgba(255, 77, 77, 0.6);
}

.error-message {
  color: var(--error-color);
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(255, 77, 77, 0.5);
  animation: shake 0.5s ease-in-out; /* Apply shake animation */
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

/* Responsive Design */
@media (max-width: 768px) {
  .forgot-password-container {
    padding: 30px;
  }
  .forgot-password-title {
    font-size: 2rem;
  }
  .submit-button {
    font-size: 1rem;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .forgot-password-container {
    padding: 20px;
  }
  .forgot-password-title {
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