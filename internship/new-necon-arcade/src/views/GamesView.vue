<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameCard from '../components/GameCard.vue'
import GameDetailModal from '../components/GameDetailModal.vue'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const searchQuery = ref('')
const selectedGenre = ref('all')
const selectedPlatform = ref('all')
const selectedPriceRange = ref('all')
const sortBy = ref('name')
const isLoading = ref(true)
const selectedGame = ref(null)
const showGameDetailModal = ref(false)

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

// Use allGames from the store
const allGames = computed(() => store.getters.allGames)

const games = computed(() => {
  let filtered = allGames.value
  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(game =>
      game.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())))
    )
  }
  // Genre filter
  if (selectedGenre.value !== 'all') {
    filtered = filtered.filter(game => game.genre === selectedGenre.value)
  }
  // Platform filter
  if (selectedPlatform.value !== 'all') {
    filtered = filtered.filter(game => game.platform.includes(selectedPlatform.value))
  }
  // Price range filter
  if (selectedPriceRange.value !== 'all') {
    const [min, max] = selectedPriceRange.value.split('-').map(Number)
    filtered = filtered.filter(game => {
      if (max) {
        return game.price >= min && game.price <= max
      } else {
        return game.price >= min
      }
    })
  }
  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.title.localeCompare(b.title)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.releaseDate) - new Date(a.releaseDate)
      default:
        return 0
    }
  })
  return filtered
})

const genres = computed(() => ['all', ...new Set(allGames.value.map(game => game.genre))])
const platforms = computed(() => ['all', ...new Set(allGames.value.flatMap(game => game.platform))])

const openGameDetailModal = (game) => {
  selectedGame.value = game
  showGameDetailModal.value = true
}

const closeGameDetailModal = () => {
  showGameDetailModal.value = false
  selectedGame.value = null
}

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="games-view container">
    <!-- Header Section -->
    <div class="games-header">
      <h1 class="page-title">All Games</h1>
      <p class="page-subtitle">Browse our full catalog of cyberpunk and futuristic titles.</p>
    </div>
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search games..."
          class="search-input cyber-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-controls">
        <div class="filter-group">
          <label class="filter-label">Genre</label>
          <select v-model="selectedGenre" class="filter-select cyber-input">
            <option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre === 'all' ? 'All Genres' : genre }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Platform</label>
          <select v-model="selectedPlatform" class="filter-select cyber-input">
            <option v-for="platform in platforms" :key="platform" :value="platform">
              {{ platform === 'all' ? 'All Platforms' : platform }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Price Range</label>
          <select v-model="selectedPriceRange" class="filter-select cyber-input">
            <option value="all">All Prices</option>
            <option value="0-8000">₨0 - ₨8,000</option>
            <option value="8000-14000">₨8,000 - ₨14,000</option>
            <option value="14000-20000">₨14,000 - ₨20,000</option>
            <option value="20000">₨20,000+</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="sortBy" class="filter-select cyber-input">
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
    </div>
    <!-- Results Info -->
    <div class="results-info">
      <span class="results-count">{{ games.length }} games found</span>
    </div>
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading games...</p>
    </div>
    <!-- Games Grid -->
    <div v-else class="games-grid">
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
        @quick-view="openGameDetailModal"
        class="game-card-item"
      />
    </div>
    <!-- No Results -->
    <div v-if="!isLoading && games.length === 0" class="no-results">
      <div class="no-results-icon">🎮</div>
      <h3 class="no-results-title">No games found</h3>
      <p class="no-results-text">Try adjusting your filters or search terms</p>
    </div>
    <!-- Game Detail Modal -->
    <GameDetailModal
      :game="selectedGame"
      :show="showGameDetailModal"
      @close="closeGameDetailModal"
      v-if="selectedGame"
    />
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
}

.games-view {
  padding-top: 90px; /* Adjust for fixed navbar */
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Rajdhani', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.games-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 15px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.page-subtitle {
  font-size: 1.3rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 30px;
}

.filters-section {
  background: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  padding: 30px;
  margin-bottom: 40px;
  border-radius: 15px;
  box-shadow: var(--cyber-glow-intensity);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
}

.search-container {
  position: relative;
  margin-bottom: 30px;
}

.cyber-input {
  width: 100%;
  padding: 15px 50px 15px 20px;
  font-size: 1.1rem;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--cyber-text-secondary);
  color: var(--cyber-text-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.1);
}
.cyber-input:focus {
  outline: none;
  border-color: var(--cyber-accent-green);
  box-shadow: 0 0 10px var(--cyber-accent-green), inset 0 0 5px var(--cyber-accent-green);
}
.cyber-input::placeholder {
  color: var(--cyber-text-secondary);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cyber-text-secondary);
  font-size: 1.3rem;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: var(--cyber-text-primary);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.1);
}

.filter-select {
  -webkit-appearance: none; /* Remove default arrow */
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300F0FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 20px;
}

.results-info {
  margin-bottom: 30px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.results-count {
  color: var(--cyber-accent-green);
  font-weight: 600;
  font-size: 1.1rem;
  text-shadow: var(--cyber-glow-green);
}

.loading-container {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--cyber-text-secondary);
  border-top: 4px solid var(--cyber-accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 25px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--cyber-text-secondary);
  font-size: 20px;
  font-family: 'Rajdhani', sans-serif;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
}

.game-card-item {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  perspective: 1000px; /* For 3D effect */
}
.game-card-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3);
}

.no-results {
  text-align: center;
  padding: 100px 20px;
  background: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: var(--cyber-glow-intensity);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
  color: var(--cyber-text-secondary);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.no-results-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  margin-bottom: 15px;
}

.no-results-text {
  color: var(--cyber-text-secondary);
  font-size: 1.2rem;
}

/* Animations from Navbar for consistency */
@keyframes glitch-text {
  0% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(-1px, 1px);
  }
  40% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(1px, -1px);
  }
  60% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(-0.5px, 0.5px);
  }
  80% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0.5px, -0.5px);
  }
  100% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0, 0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .filters-section {
    padding: 25px;
  }
  .search-input {
    padding: 12px 45px 12px 18px;
    font-size: 1rem;
  }
  .filter-controls {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
  }
  .filter-label {
    font-size: 0.9rem;
  }
  .filter-select {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  .section-title {
    font-size: 1.8rem;
  }
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .games-view {
    padding-top: 80px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .page-subtitle {
    font-size: 1.1rem;
  }
  .filters-section {
    padding: 20px;
  }
  .filter-controls {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 15px;
  }
  .games-grid {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 25px;
  }
  .no-results-title {
    font-size: 1.5rem;
  }
  .no-results-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .games-view {
    padding-top: 70px;
  }
  .page-title {
    font-size: 2rem;
  }
  .search-input {
    padding: 10px 40px 10px 15px;
    font-size: 0.9rem;
  }
  .search-icon {
    font-size: 1.1rem;
    right: 15px;
  }
  .filter-label {
    font-size: 0.85rem;
  }
  .filter-select {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
  .section-title {
    font-size: 1.5rem;
  }
}
</style>