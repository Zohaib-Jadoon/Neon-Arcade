<script setup>
import { computed } from 'vue'

const props = defineProps({
  cartTotal: {
    type: Number,
    required: true
  }
})

const shippingFee = computed(() => {
  return props.cartTotal > 0 ? 500 : 0 // Example: 500 Rs shipping if cart is not empty
})

const totalPayable = computed(() => {
  return props.cartTotal + shippingFee.value
})
</script>

<template>
  <div class="order-summary cyber-panel">
    <h2 class="summary-title">Order Summary</h2>
    <div class="summary-details">
      <div class="detail-row">
        <span>Subtotal:</span>
        <span>₨{{ cartTotal.toLocaleString() }}</span>
      </div>
      <div class="detail-row">
        <span>Shipping:</span>
        <span>₨{{ shippingFee.toLocaleString() }}</span>
      </div>
      <div class="detail-row total-row">
        <span>Total:</span>
        <span>₨{{ totalPayable.toLocaleString() }}</span>
      </div>
    </div>
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

.order-summary {
  padding: 30px;
  background-color: var(--cyber-panel-bg); /* Use cyberpunk panel background */
  border: 2px solid var(--cyber-border-color); /* Neon border */
  border-radius: 15px; /* Slightly rounded corners */
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(0, 240, 255, 0.2); /* Stronger glow */
  display: flex;
  flex-direction: column;
  gap: 25px;
  height: fit-content;
  position: relative;
  overflow: hidden;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg); /* Subtle 3D tilt */
  transition: all 0.3s ease;
}

.order-summary::before {
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

.order-summary:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px); /* Straighten and lift on hover */
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.3);
}

.order-summary:hover::before {
  animation-play-state: paused; /* Pause shimmer on hover */
  transform: translateX(0);
}

.summary-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.2rem; /* Larger title */
  color: var(--cyber-accent-green); /* Neon green title */
  margin-bottom: 15px;
  text-align: center;
  text-shadow: var(--cyber-glow-green); /* Green glow */
  animation: glitch-text 4s infinite alternate; /* Glitch effect */
  position: relative;
  z-index: 2;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 18px; /* Increased gap */
  position: relative;
  z-index: 2;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem; /* Slightly larger font */
  color: var(--cyber-text-primary); /* Primary text color */
  padding-bottom: 5px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.2); /* Dashed border for detail */
}

.detail-row span:first-child {
  color: var(--cyber-text-secondary); /* Secondary text color */
}

.total-row {
  font-size: 1.8rem; /* Larger total font */
  font-weight: 700;
  color: var(--neon-yellow); /* Neon yellow for total */
  border-top: 2px solid var(--cyber-border-color); /* Solid neon border */
  padding-top: 20px; /* Increased padding */
  margin-top: 15px; /* Increased margin */
  text-shadow: 0 0 10px var(--neon-yellow), 0 0 20px rgba(255, 255, 0, 0.5); /* Yellow glow */
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes glitch-text {
  0% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-1px, 1px);
  }
  40% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(1px, -1px);
  }
  60% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-0.5px, 0.5px);
  }
  80% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0.5px, -0.5px);
  }
  100% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-summary {
    padding: 25px;
    transform: none; /* Remove 3D tilt on smaller screens */
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Straighten clip-path */
  }
  .summary-title {
    font-size: 1.8rem;
  }
  .detail-row {
    font-size: 1.1rem;
  }
  .total-row {
    font-size: 1.5rem;
    padding-top: 15px;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .order-summary {
    padding: 20px;
  }
  .summary-title {
    font-size: 1.6rem;
  }
  .detail-row {
    font-size: 1rem;
  }
  .total-row {
    font-size: 1.3rem;
  }
}
</style>
