<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['quick-view'])

const userRole = computed(() => store.getters.user?.role)
const isSeller = computed(() => userRole.value === 'seller')

const discountPercentage = computed(() => {
  if (props.game.originalPrice && props.game.originalPrice > props.game.price) {
    return Math.round(((props.game.originalPrice - props.game.price) / props.game.originalPrice) * 100)
  }
  return 0
})

const starRating = computed(() => {
  const rating = props.game.rating
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  return { fullStars, hasHalfStar }
})

const addToCart = () => {
  store.dispatch('addToCart', props.game)
  alert(`${props.game.title} added to cart!`);
}
</script>

<template>
  <div class="game-card cyber-panel">
    <div class="card-image">
      <img :src="game.image" :alt="game.title" />
      <div v-if="!isSeller" class="card-overlay">
        <div class="overlay-content">
          <button @click="emit('quick-view', game)" class="cyber-button secondary quick-view-btn">Quick View</button>
          <button @click="addToCart" class="cyber-button primary add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
      <div v-if="discountPercentage > 0" class="discount-badge">
        -{{ discountPercentage }}%
      </div>
      <div v-if="game.featured" class="featured-badge">
        Featured
      </div>
    </div>
    <div class="card-content">
      <div class="game-genre">{{ game.genre }}</div>
      <h3 class="game-title">{{ game.title }}</h3>
      <div class="game-rating">
        <div class="stars">
          <span v-for="n in starRating.fullStars" :key="n" class="star filled">★</span>
          <span v-if="starRating.hasHalfStar" class="star half">★</span>
          <span v-for="n in (5 - Math.ceil(game.rating))" :key="n + 10" class="star">★</span>
        </div>
        <span class="rating-number">({{ game.rating }})</span>
      </div>
      <div class="game-platforms">
        <span v-for="platform in game.platform" :key="platform" class="platform-tag">
          {{ platform }}
        </span>
      </div>
      <div class="game-price">
        <span v-if="game.originalPrice" class="original-price">₨{{ game.originalPrice.toLocaleString() }}</span>
        <span class="current-price">₨{{ game.price.toLocaleString() }}</span>
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

.game-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  max-width: 320px; /* Make the card smaller */
  clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Less aggressive clip to ensure buttons are inside */
}

.game-card::before {
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

.game-card:hover::before {
  animation-play-state: paused; /* Pause shimmer on hover */
  transform: translateX(0);
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0, 240, 255, 0.5);
}

.card-image {
  position: relative;
  overflow: hidden;
  height: 250px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.game-card:hover .card-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Cyber Button Styling (re-used from previous components) */
.cyber-button {
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  padding: 12px 25px;
  border: 2px solid;
  border-radius: 8px; /* Slightly rounded for button */
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
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

.cyber-button:hover::before {
  left: 100%;
}

.cyber-button.primary {
  background-color: var(--cyber-accent-green);
  border-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
}
.cyber-button.primary:hover {
  background-color: var(--cyber-border-color);
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
  transform: translateY(-3px) scale(1.02);
}

.cyber-button.secondary {
  background-color: transparent;
  border-color: var(--cyber-border-color);
  color: var(--cyber-border-color);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.cyber-button.secondary:hover {
  background-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
  transform: translateY(-3px) scale(1.02);
}

.quick-view-btn,
.add-to-cart-btn {
  padding: 8px 18px; /* Adjust padding */
  font-size: 0.85rem; /* Adjust font size */
}

.discount-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--neon-red);
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  box-shadow: 0 0 10px var(--neon-red);
  z-index: 3;
}

.featured-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  box-shadow: 0 0 10px var(--cyber-accent-green);
  z-index: 3;
}

.card-content {
  padding: 15px; /* Slightly reduce padding for smaller card */
  position: relative;
  z-index: 2;
}

.game-genre {
  color: var(--cyber-accent-green);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-shadow: 0 0 5px rgba(0, 255, 102, 0.3);
}

.game-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--cyber-text-primary);
  margin-bottom: 12px;
  line-height: 1.3;
  text-shadow: 0 0 8px rgba(224, 224, 224, 0.2);
}

.game-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--cyber-text-secondary);
  font-size: 14px;
  text-shadow: none;
}

.star.filled {
  color: var(--neon-yellow);
  text-shadow: 0 0 8px var(--neon-yellow);
}

.star.half {
  color: var(--neon-yellow);
  position: relative;
  text-shadow: 0 0 8px var(--neon-yellow);
}

.rating-number {
  font-size: 12px;
  color: var(--cyber-text-secondary);
}

.game-platforms {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.platform-tag {
  background: rgba(0, 255, 102, 0.1);
  color: var(--cyber-accent-green);
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 12px;
  border: 1px solid var(--cyber-accent-green);
  box-shadow: 0 0 5px rgba(0, 255, 102, 0.3);
}

.game-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.original-price {
  color: var(--cyber-text-secondary);
  text-decoration: line-through;
  font-size: 14px;
}

.current-price {
  color: var(--cyber-accent-green);
  font-size: 1.3rem;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  text-shadow: var(--cyber-glow-green);
}

/* Animations from previous components for consistency */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-image {
    height: 200px;
  }
  .game-title {
    font-size: 1.1rem;
  }
  .current-price {
    font-size: 1.2rem;
  }
  .cyber-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .game-card {
    clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Consistent clip-path */
  }
  .game-title {
    font-size: 1rem;
  }
  .current-price {
    font-size: 1.1rem;
  }
  .quick-view-btn,
  .add-to-cart-btn {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
}
</style>
