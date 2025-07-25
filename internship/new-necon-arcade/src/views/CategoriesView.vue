<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameCard from '../components/GameCard.vue' // Assuming this path is correct
import { useFsm } from '../composables/useFsm' // Assuming this path is correct

const store = useStore()
const selectedCategory = ref('all')
const isLoading = ref(true)

const categories = computed(() => store.state.categories)
const allGames = computed(() => store.getters.allGames)

const getGamesByCategory = (category) => {
  return allGames.value.filter(game => game.genre === category)
}

const filteredGames = computed(() => {
  if (selectedCategory.value === 'all') {
    return allGames.value
  }
  return getGamesByCategory(selectedCategory.value)
})

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const { state, context, nextEvents, error, sendTransition } = useFsm()
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('GO_CATEGORIES') // Transition event for Categories page

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
  // Send FSM transition on page mount
  sendTransition(fsmKey, fsmTransition.value).then(response => {
    console.log('FSM Response:', response)
  }).catch(err => {
    console.error('FSM Error:', err)
  })
})
</script>

<template>
  <div class="categories-view">
    <div class="container">
      <!-- Header -->
      <div class="categories-header">
        <h1 class="page-title neon-glow">Game Categories</h1>
        <p class="page-subtitle">Explore games by genre and discover new favorites</p>
      </div>

      <!-- Categories Grid -->
      <div class="categories-grid">
        <div
          class="category-card"
          :class="{ 'active': selectedCategory === 'all' }"
          @click="selectCategory('all')"
        >
          <div class="category-icon" style="color: var(--neon-green)">🎮</div>
          <h3 class="category-name">All Games</h3>
          <p class="category-description">Browse all available games</p>
          <span class="game-count">{{ allGames.length }} games</span>
        </div>
        <div
          v-for="category in categories"
          :key="category"
          class="category-card"
          :class="{ 'active': selectedCategory === category }"
          @click="selectCategory(category)"
        >
          <div class="category-icon" :style="{ color: store.state.categoryColors[category] }">
            {{ store.state.categoryIcons[category] }}
          </div>
          <h3 class="category-name">{{ category }}</h3>
          <p class="category-description">{{ store.state.categoryDescriptions[category] }}</p>
          <span class="game-count">{{ getGamesByCategory(category).length }} games</span>
        </div>
      </div>

      <!-- Selected Category Info -->
      <div class="selected-category-info">
        <h2 class="selected-title">
          {{ selectedCategory === 'all' ? 'All Games' : selectedCategory }}
        </h2>
        <span class="results-count">{{ filteredGames.length }} games found</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading categories...</p>
      </div>

      <!-- Games Grid -->
      <div v-else class="games-grid">
        <GameCard
          v-for="game in filteredGames"
          :key="game.id"
          :game="game"
          class="game-card-item"
        />
      </div>

      <!-- No Games Message -->
      <div v-if="!isLoading && filteredGames.length === 0" class="no-games">
        <div class="no-games-icon">🎮</div>
        <h3 class="no-games-title">No games in this category</h3>
        <p class="no-games-text">Check back soon for new releases!</p>
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
  --neon-purple: #9900ff;
  --error-color: #ff4d4d;
  --success-color: #4CAF50;
  --text-color: #e0e0e0;
  --text-secondary: #a0a0a0;
  --input-bg: #0f0f1a;
  --input-border-focus: #00ff99;
  --button-hover-bg: #000000; /* Black hover color */
  --button-active-bg: #333333; /* Darker grey for active */
  --link-hover-color: #00ff99;
  --button-text-color-hover: #00ff99; /* Neon green text on black hover */
  --border-color: #00f0ff;
  --neon-green-glow: rgba(0, 255, 153, 0.7); /* Consistent glow color */
}

.categories-view {
  padding-top: 90px;
  min-height: 100vh;
  padding-bottom: 50px;
  background: linear-gradient(135deg, #0a0a1a, #1a1a2e); /* Consistent background */
  color: var(--text-color); /* Default text color */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.categories-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 15px;
  color: var(--neon-green);
  text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  animation: neon-flicker 1.5s infinite alternate;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 60px;
}

.category-card {
  background: rgba(26, 26, 26, 0.8);
  border: 2px solid var(--card-border);
  padding: 30px 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow:
    0 5px 15px rgba(0, 240, 255, 0.3), /* Subtle initial 3D shadow */
    0 2px 5px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
  transition: left 0.5s;
  z-index: 1; /* Ensure it's above content but below text */
}

.category-card:hover::before {
  left: 100%;
}

.category-card:hover {
  border-color: var(--neon-green);
  transform: translateY(-8px); /* More pronounced lift */
  box-shadow:
    0 10px 30px var(--neon-green-glow), /* Stronger glow on hover */
    0 5px 15px rgba(0, 0, 0, 0.5); /* Deeper shadow for lift */
}

.category-card.active {
  border-color: var(--neon-green);
  background: rgba(0, 255, 65, 0.15); /* Slightly more opaque active background */
  box-shadow:
    0 0 25px var(--neon-green-glow), /* Stronger glow for active */
    inset 0 0 10px rgba(0, 255, 153, 0.4); /* Inner glow for active */
  transform: translateY(-3px); /* Slight lift for active */
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: block;
  position: relative;
  z-index: 2; /* Ensure icon is above ::before */
}

.category-name {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  color: var(--text-color);
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}

.category-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
}

.game-count {
  color: var(--neon-green);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 2;
}

.selected-category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color); /* Added top border for separation */
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); /* Subtle glow for the info bar */
}

.selected-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--neon-green);
  margin: 0;
  text-shadow: 0 0 8px var(--neon-green);
}

.results-count {
  color: var(--text-secondary);
  font-weight: 600;
}

.loading-container {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--card-border); /* Use card border for base */
  border-top: 3px solid var(--neon-green); /* Neon green for spinning part */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  box-shadow: 0 0 15px var(--neon-green-glow); /* Glow around spinner */
}

.loading-text {
  color: var(--text-secondary);
  font-size: 18px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.game-card-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow:
    0 5px 15px rgba(0, 0, 0, 0.3), /* Initial subtle shadow for depth */
    0 2px 5px rgba(0, 240, 255, 0.1); /* Slight neon hint */
}

.game-card-item:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.5), /* Deeper shadow on hover */
    0 5px 15px rgba(0, 240, 255, 0.4); /* Stronger neon hint on hover */
}

.no-games {
  text-align: center;
  padding: 80px 20px;
}

.no-games-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
  color: var(--neon-cyan); /* Give it a neon color */
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.no-games-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 10px;
}

.no-games-text {
  color: var(--text-secondary);
  font-size: 1.1rem;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  .selected-category-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>