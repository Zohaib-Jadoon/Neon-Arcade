<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const user = computed(() => store.getters.user)
const sellerSales = computed(() => store.getters.getSalesBySeller(user.value?.id))
const filterStatus = ref('all')
const filterDate = ref('')

const filteredSales = computed(() => {
  let sales = sellerSales.value
  if (filterStatus.value !== 'all') {
    sales = sales.filter(sale => sale.status === filterStatus.value)
  }
  if (filterDate.value) {
    sales = sales.filter(sale => sale.saleDate === filterDate.value)
  }
  return sales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
})

const totalRevenue = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + sale.totalRevenue, 0)
})

const totalUnitsSold = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + sale.quantity, 0)
})

const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'status-completed';
    case 'pending': return 'status-pending';
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
}
</script>

<template>
  <div class="sales-tracking-view container">
    <h1 class="page-title">Sales Tracking</h1>
    <p class="page-subtitle">Monitor your game sales and revenue.</p>

    <div class="sales-summary cyber-panel">
      <div class="summary-item">
        <span class="summary-label">Total Revenue:</span>
        <span class="summary-value neon-green">₨{{ totalRevenue.toLocaleString() }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Units Sold:</span>
        <span class="summary-value neon-cyan">{{ totalUnitsSold }}</span>
      </div>
    </div>

    <div class="filters-section cyber-panel">
      <h2 class="section-heading">Filters</h2>
      <div class="filter-controls">
        <div class="form-group">
          <label for="statusFilter">Status:</label>
          <select id="statusFilter" v-model="filterStatus" class="cyber-input">
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="form-group">
          <label for="dateFilter">Date:</label>
          <input type="date" id="dateFilter" v-model="filterDate" class="cyber-input" />
        </div>
      </div>
    </div>

    <div v-if="filteredSales.length === 0" class="no-sales cyber-panel">
      <p>No sales data found for the selected filters.</p>
    </div>

    <div v-else class="sales-table-container cyber-panel">
      <h2 class="section-heading">Sales Details</h2>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Game Title</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
              <th>Total Revenue</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in filteredSales" :key="sale.saleId">
              <td>{{ sale.saleId }}</td>
              <td>{{ sale.gameTitle }}</td>
              <td>{{ sale.quantity }}</td>
              <td>₨{{ sale.pricePerUnit.toLocaleString() }}</td>
              <td><span class="neon-green">₨{{ sale.totalRevenue.toLocaleString() }}</span></td>
              <td>{{ new Date(sale.saleDate).toLocaleDateString() }}</td>
              <td><span :class="['status-tag', getStatusClass(sale.status)]">{{ sale.status }}</span></td>
            </tr>
          </tbody>
        </table>
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

.sales-tracking-view {
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

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 15px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.page-subtitle {
  font-size: 1.3rem;
  text-align: center;
  color: var(--cyber-text-secondary);
  margin-bottom: 40px;
}

.cyber-panel {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  padding: 30px;
  position: relative;
  overflow: hidden;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  margin-bottom: 40px; /* Added for spacing between panels */
}

.cyber-panel::before {
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

.cyber-panel:hover::before {
  animation-play-state: paused; /* Pause shimmer on hover */
  transform: translateX(0);
}

.section-heading {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  margin-bottom: 30px;
  text-align: center;
  position: relative; /* For z-index over shimmer */
  z-index: 2;
}

.sales-summary {
  display: flex;
  justify-content: space-around;
  padding: 30px;
}

.summary-item {
  text-align: center;
  position: relative;
  z-index: 2;
}

.summary-label {
  font-size: 1rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 5px;
  display: block;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-value {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px;
}
.summary-value.neon-green { color: var(--cyber-accent-green); text-shadow: var(--cyber-glow-green); }
.summary-value.neon-cyan { color: var(--cyber-border-color); text-shadow: var(--cyber-glow-intensity); }

.filters-section {
  padding: 30px;
}

.filter-controls {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.form-group label {
  font-size: 1.1rem;
  color: var(--cyber-accent-green);
  font-weight: 600;
}

.cyber-input {
  width: 100%;
  padding: 12px 15px;
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

.no-sales {
  text-align: center;
  font-size: 1.5rem;
  color: var(--cyber-text-secondary);
  padding: 50px 20px;
  border: 2px dashed var(--cyber-text-secondary);
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
}

.sales-table-container {
  padding: 30px;
}

.table-responsive {
  overflow-x: auto;
  position: relative;
  z-index: 2;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2); /* Cyan border for table rows */
  color: var(--cyber-text-primary);
}

th {
  background-color: rgba(0, 240, 255, 0.1); /* Light cyan background for headers */
  color: var(--cyber-border-color);
  font-family: 'Orbitron', monospace;
  font-size: 0.9rem;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}

td {
  font-size: 0.95rem;
}

tr:hover {
  background-color: rgba(0, 240, 255, 0.05); /* Light cyan hover effect */
  box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.2);
}

.status-tag {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.status-completed {
  background-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--cyber-accent-green);
}
.status-pending {
  background-color: var(--neon-yellow);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--neon-yellow);
}
.status-cancelled {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--neon-red);
}

/* Animations from previous components for consistency */
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

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .page-subtitle {
    font-size: 1.1rem;
  }
  .cyber-panel {
    padding: 25px;
  }
  .section-heading {
    font-size: 1.8rem;
  }
  .summary-value {
    font-size: 2rem;
  }
  .form-group label {
    font-size: 1rem;
  }
  .cyber-input {
    padding: 10px 12px;
    font-size: 1rem;
  }
  th, td {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  .status-tag {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .sales-tracking-view {
    padding-top: 80px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .page-subtitle {
    font-size: 1rem;
  }
  .cyber-panel {
    padding: 20px;
    clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Adjust angular shape for smaller screens */
  }
  .section-heading {
    font-size: 1.5rem;
  }
  .sales-summary {
    flex-direction: column;
    gap: 20px;
  }
  .summary-value {
    font-size: 1.8rem;
  }
  .filter-controls {
    flex-direction: column;
    gap: 20px;
  }
  .form-group {
    min-width: unset;
    width: 100%;
  }
  .no-sales {
    font-size: 1.2rem;
  }
  th, td {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .sales-tracking-view {
    padding-top: 70px;
  }
  .page-title {
    font-size: 2rem;
  }
  .summary-value {
    font-size: 1.5rem;
  }
  .cyber-input {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
  .status-tag {
    padding: 3px 6px;
    font-size: 0.7rem;
  }
}
</style>