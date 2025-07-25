<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const isInCart = computed(() => store.getters.isInCart(props.game.id))
const isInWishlist = computed(() => store.getters.isInWishlist(props.game.id))
const isSeller = computed(() => store.getters.isSeller)

const addToCart = () => {
  store.dispatch('addToCart', props.game)
  alert(`${props.game.title} added to cart!`);
}

const toggleWishlist = () => {
  if (isInWishlist.value) {
    store.dispatch('removeFromWishlist', props.game.id)
    alert(`${props.game.title} removed from wishlist.`);
  } else {
    store.dispatch('addToWishlist', props.game)
    alert(`${props.game.title} added to wishlist!`);
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content cyber-panel" @click.stop>
      <button class="close-button" @click="closeModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div class="modal-header">
        <img :src="game.image" :alt="game.title" class="game-image" />
        <div class="game-info">
          <h2 class="game-title">{{ game.title }}</h2>
          <div class="game-meta">
            <span class="genre-tag">{{ game.genre }}</span>
            <span class="developer">by {{ game.developer }}</span>
          </div>
          <div class="game-rating">
            <div class="stars">
              <span v-for="n in Math.floor(game.rating)" :key="n" class="star filled">★</span>
              <span v-if="game.rating % 1 !== 0" class="star half">★</span>
            </div>
            <span class="rating-number">({{ game.rating }})</span>
          </div>
          <div class="game-platforms">
            <span v-for="platform in game.platform" :key="platform" class="platform-tag">
              {{ platform }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="game-description">
          <h3>Description</h3>
          <p>{{ game.description }}</p>
        </div>
        <div class="game-tags">
          <h3>Tags</h3>
          <div class="tags-list">
            <span v-for="tag in game.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="game-details">
          <div class="detail-item">
            <span class="detail-label">Release Date:</span>
            <span class="detail-value">{{ new Date(game.releaseDate).toLocaleDateString() }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Developer:</span>
            <span class="detail-value">{{ game.developer }}</span>
          </div>
        </div>

        <div class="game-actions-summary">
          <div class="price-section">
            <span v-if="game.originalPrice" class="original-price">₨{{ game.originalPrice.toLocaleString() }}</span>
            <span class="current-price">₨{{ game.price.toLocaleString() }}</span>
          </div>

          <div v-if="!isSeller" class="action-buttons">
            <button
              @click="toggleWishlist"
              class="wishlist-btn cyber-button secondary"
              :class="{ 'active': isInWishlist }"
            >
              <svg v-if="isInWishlist" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button
              @click="addToCart"
              class="add-to-cart-btn cyber-button primary"
              :disabled="isInCart"
            >
              {{ isInCart ? 'In Cart' : 'Add to Cart' }}
            </button>
          </div>
        </div>
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.5);
  max-width: 650px; /* Made the max smaller */
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  animation: fadeIn 0.3s ease-out;
}

.modal-content::before {
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

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: 2px solid var(--neon-red);
  color: var(--neon-red);
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.5);
}
.close-button:hover {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px var(--neon-red);
  transform: scale(1.1);
}

.modal-header {
  display: grid;
  grid-template-columns: 200px 1fr; /* Adjusted image column width for smaller card */
  gap: 30px;
  padding: 30px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  position: relative;
  z-index: 2;
}

.game-image {
  width: 100%;
  height: 180px; /* Adjusted height for smaller image */
  object-fit: cover;
  border: 2px solid var(--cyber-accent-green);
  border-radius: 8px;
  box-shadow: 0 0 15px var(--cyber-accent-green);
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Reduced gap */
}

.game-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem; /* Slightly smaller title */
  color: var(--cyber-accent-green);
  margin: 0;
  text-shadow: var(--cyber-glow-green);
}

.game-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.genre-tag {
  background: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 0 8px var(--cyber-accent-green);
}

.developer {
  color: var(--cyber-text-secondary);
  font-style: italic;
  font-size: 0.95rem; /* Slightly smaller developer text */
}

.game-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--cyber-text-secondary);
  font-size: 16px;
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
  color: var(--cyber-text-secondary);
  font-size: 14px;
}

.game-platforms {
  display: flex;
  gap: 8px;
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

.modal-body {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  z-index: 2;
}

.game-description h3,
.game-tags h3 {
  color: var(--cyber-text-primary);
  font-family: 'Orbitron', monospace;
  margin-bottom: 10px;
  text-shadow: 0 0 8px rgba(224, 224, 224, 0.2);
}

.game-description p {
  color: var(--cyber-text-secondary);
  line-height: 1.6;
}

.tags-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(0, 240, 255, 0.1);
  color: var(--cyber-border-color);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid var(--cyber-border-color);
  box-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  padding: 5px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.1);
}
.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--cyber-text-secondary);
  font-weight: 600;
}

.detail-value {
  color: var(--cyber-text-primary);
  font-weight: 600;
}

/* New section for price and actions */
.game-actions-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 25px;
  border-top: 1px dashed rgba(0, 240, 255, 0.1);
  margin-top: 25px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.original-price {
  color: var(--cyber-text-secondary);
  text-decoration: line-through;
  font-size: 16px;
}

.current-price {
  color: var(--cyber-accent-green);
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  text-shadow: var(--cyber-glow-green);
}

.action-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
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

.wishlist-btn {
  padding: 10px 15px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wishlist-btn svg {
  width: 24px;
  height: 24px;
}
.wishlist-btn.active {
  border-color: var(--neon-red);
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--neon-red);
}
.wishlist-btn.active:hover {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px var(--neon-red);
}

.add-to-cart-btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
}
.add-to-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.add-to-cart-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background-color: var(--cyber-accent-green); /* Keep original disabled background */
  border-color: var(--cyber-accent-green); /* Keep original disabled border */
  color: var(--cyber-dark-bg);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
    width: 95%;
    max-width: 95%; /* Adjust for mobile */
    clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Adjust angular shape for smaller screens */
  }
  .modal-header {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  .game-image {
    height: 150px;
  }
  .game-title {
    font-size: 1.5rem;
  }
  .current-price {
    font-size: 1.8rem;
  }
  .game-actions-summary {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  .action-buttons {
    justify-content: center;
  }
  .close-button {
    top: 10px;
    right: 10px;
    width: 35px;
    height: 35px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 15px;
  }
  .game-title {
    font-size: 1.8rem;
  }
  .game-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .genre-tag, .developer {
    font-size: 10px;
  }
  .game-description p {
    font-size: 0.9rem;
  }
  .current-price {
    font-size: 1.5rem;
  }
  .add-to-cart-btn, .wishlist-btn {
    width: 100%;
    padding: 10px 15px;
    font-size: 0.95rem;
  }
  .modal-body {
    padding: 20px;
  }
}

@media (min-width: 769px) {
  .game-actions-summary {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
