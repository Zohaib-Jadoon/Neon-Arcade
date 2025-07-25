<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const router = useRouter()
const { sendTransition } = useFsm()

const logout = async () => {
  try {
    await sendTransition('globalKey', 'LOGOUT')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  store.dispatch('logout')
  router.push('/login')
}

const navigateWithTransition = async (path, transition) => {
  try {
    if (transition) {
      await sendTransition('globalKey', transition)
      console.log(`FSM transitioned with event: ${transition}`)
    }
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  router.push(path)
}
</script>

<template>
  <nav class="navbar seller-navbar">
    <div class="navbar-left">
      <a @click.prevent="navigateWithTransition('/seller/dashboard', 'GO_HOME')" href="#" class="logo-link">
        <img src="/src/assets/logo.svg" alt="Neon Arcade Logo" class="logo" />
        <span class="site-title">Seller Hub</span>
      </a>
    </div>
    <div class="navbar-center">
      <a @click.prevent="navigateWithTransition('/seller/dashboard', 'GO_HOME')" href="#" class="nav-link">📊 Dashboard</a>
      <a @click.prevent="navigateWithTransition('/seller/games', 'GO_GAME_MANAGEMENT')" href="#" class="nav-link">🎮 Games</a>
      <a @click.prevent="navigateWithTransition('/seller/sales', 'GO_SALES_TRACKING')" href="#" class="nav-link">📈 Sales</a>
      <a @click.prevent="navigateWithTransition('/seller/profile', 'GO_PROFILE')" href="#" class="nav-link">👤 Profile</a>
    </div>
    <div class="navbar-right">
      <router-link to="/" class="cyber-button auth-button customer-site-button">🏠 Customer Site</router-link>
      <button @click="logout" class="cyber-button auth-button logout-button">Logout</button>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

/* General Cyberpunk Theme Variables */
:root {
  --cyber-dark-bg: #0a0a0a;
  --cyber-panel-bg: #1a1a1a;
  --cyber-border-color: #00f0ff; /* Neon Cyan */
  --cyber-accent-green: #00ff66; /* Neon Green */
  --cyber-accent-purple: #9900ff; /* Seller specific accent */
  --cyber-text-primary: #e0e0e0;
  --cyber-text-secondary: #a0a0a0;
  --cyber-glow-intensity: 0 0 15px var(--cyber-border-color), 0 0 30px var(--cyber-border-color);
  --cyber-glow-green: 0 0 15px var(--cyber-accent-green), 0 0 30px var(--cyber-accent-green);
  --cyber-glow-purple: 0 0 15px var(--cyber-accent-purple), 0 0 30px var(--cyber-accent-purple);
  --cyber-shadow-offset: 5px;
  --neon-red: #ff3366;
  --neon-yellow: #ffff00;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 25px; /* Smaller padding */
  background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.85) 100%);
  border-bottom: 3px solid var(--cyber-accent-purple); /* Purple border for seller */
  box-shadow: 0 0 30px rgba(153, 0, 255, 0.8), inset 0 -8px 20px rgba(153, 0, 255, 0.3); /* Stronger purple glow */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(8px);
  animation: border-pulse-purple 5s infinite alternate;
  border-radius: 0 0 25px 25px; /* More rounded bottom corners */
  clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0% calc(100% - 25px)); /* More rounded clip-path */
  transform: perspective(1000px) rotateX(2deg) translateY(0px);
  transition: all 0.5s ease;
}

.navbar:hover {
  transform: perspective(1000px) rotateX(0deg) translateY(-2px);
  box-shadow: 0 0 40px rgba(153, 0, 255, 1), inset 0 -10px 25px rgba(153, 0, 255, 0.4);
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px; /* Smaller gap */
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo {
  height: 35px; /* Smaller logo */
  width: 35px;
  filter: drop-shadow(0 0 8px var(--cyber-accent-purple)); /* Glow for logo, purple */
  animation: pulse-glow-logo-purple 3s infinite alternate;
}

.site-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.6rem; /* Smaller title */
  color: var(--cyber-accent-purple); /* Purple title */
  text-shadow: var(--cyber-glow-purple);
  animation: glitch-text-purple 4s infinite alternate; /* Glitch animation, purple */
}

.nav-link {
  color: var(--cyber-text-primary);
  text-decoration: none;
  padding: 6px 15px; /* Adjusted padding */
  font-size: 1rem; /* Adjusted font size */
  font-weight: 600;
  transition: color 0.3s ease, text-shadow 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px; /* Slightly thinner underline */
  background: linear-gradient(90deg, transparent, var(--cyber-accent-purple), transparent); /* Purple underline */
  box-shadow: var(--cyber-glow-purple);
  transform: scaleX(0);
  transform-origin: center;
  transition: width 0.3s ease, left 0.3s ease, transform 0.3s ease;
}

.nav-link:hover {
  color: var(--cyber-accent-purple);
  text-shadow: var(--cyber-glow-purple);
  transform: translateY(-2px) translateZ(5px);
}

.nav-link:hover::before {
  width: 100%;
  left: 0;
  transform: scaleX(1);
}

.nav-link.router-link-exact-active {
  color: var(--cyber-accent-purple);
  text-shadow: var(--cyber-glow-purple);
}

.nav-link.router-link-exact-active::before {
  width: 100%;
  left: 0;
  transform: scaleX(1);
}

/* Cyber Button Styling for Auth Buttons */
.cyber-button {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  border: 2px solid var(--cyber-accent-purple);
  padding: 6px 15px; /* Adjusted padding */
  font-family: 'Orbitron', monospace;
  font-size: 0.9rem; /* Adjusted font size */
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  box-shadow: var(--cyber-glow-purple);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%); /* Angular shape */
  margin-left: 10px; /* Adjusted spacing */
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

.cyber-button:hover {
  background-color: var(--cyber-border-color); /* Cyan on hover */
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity), 0 0 30px var(--cyber-accent-purple);
  transform: translateY(-3px) scale(1.02) translateZ(10px);
}

.cyber-button:hover::before {
  left: 100%;
}

.auth-button {
  background-color: transparent;
  border-color: var(--cyber-accent-purple); /* Purple border */
  color: var(--cyber-accent-purple); /* Purple text */
  box-shadow: 0 0 10px rgba(153, 0, 255, 0.3);
}

.auth-button:hover {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-purple);
}

.customer-site-button {
  border-color: var(--cyber-accent-green); /* Green for customer site link */
  color: var(--cyber-accent-green);
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
}

.customer-site-button:hover {
  background-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
}

.logout-button {
  border-color: #ff3366; /* Neon Red */
  color: #ff3366;
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
}

.logout-button:hover {
  background-color: #ff3366;
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
}

/* Animations */
@keyframes border-pulse-purple {
  0% { border-color: var(--cyber-accent-purple); box-shadow: 0 0 25px rgba(153, 0, 255, 0.6), inset 0 -5px 15px rgba(153, 0, 255, 0.2); }
  50% { border-color: var(--cyber-border-color); box-shadow: 0 0 25px rgba(0, 240, 255, 0.6), inset 0 -5px 15px rgba(0, 240, 255, 0.2); }
  100% { border-color: var(--cyber-accent-purple); box-shadow: 0 0 25px rgba(153, 0, 255, 0.6), inset 0 -5px 15px rgba(153, 0, 255, 0.2); }
}

@keyframes glitch-text-purple {
  0% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(-1px, 1px);
  }
  40% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(1px, -1px);
  }
  60% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(-0.5px, 0.5px);
  }
  80% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0.5px, -0.5px);
  }
  100% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(0, 0);
  }
}

@keyframes pulse-glow-logo-purple {
  0% { filter: drop-shadow(0 0 8px var(--cyber-accent-purple)); }
  50% { filter: drop-shadow(0 0 15px var(--cyber-accent-purple)) drop-shadow(0 0 25px rgba(153, 0, 255, 0.5)); }
  100% { filter: drop-shadow(0 0 8px var(--cyber-accent-purple)); }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .navbar {
    flex-wrap: wrap;
    justify-content: center;
    padding: 6px 12px; /* Adjusted padding */
    transform: perspective(1000px) rotateX(0deg) translateY(0px);
    border-radius: 0 0 20px 20px; /* Adjusted rounding */
    clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px));
  }
  .navbar-left, .navbar-right {
    width: 100%;
    justify-content: center;
    margin-bottom: 6px; /* Adjusted margin */
  }
  .navbar-center {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 6px; /* Adjusted margin */
    gap: 6px; /* Adjusted gap */
  }
  .nav-link {
    padding: 5px 8px; /* Adjusted padding */
    font-size: 0.9rem; /* Adjusted font size */
  }
  .cyber-button {
    padding: 5px 10px; /* Adjusted padding */
    font-size: 0.8rem; /* Adjusted font size */
    margin-left: 6px; /* Adjusted margin */
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 6px 8px; /* Adjusted padding */
  }
  .site-title {
    font-size: 1.4rem; /* Adjusted font size */
  }
  .logo {
    height: 30px; /* Adjusted size */
    width: 30px;
  }
  .nav-link {
    padding: 4px 6px; /* Adjusted padding */
    font-size: 0.8rem; /* Adjusted font size */
  }
  .cyber-button {
    padding: 4px 8px; /* Adjusted padding */
    font-size: 0.75rem; /* Adjusted font size */
    margin-left: 5px; /* Adjusted margin */
  }
}

@media (max-width: 480px) {
  .navbar {
    flex-direction: column;
    gap: 6px; /* Adjusted gap */
    padding: 6px; /* Adjusted padding */
  }
  .navbar-left, .navbar-center, .navbar-right {
    width: 100%;
    justify-content: center;
    margin-bottom: 0;
  }
  .navbar-center {
    flex-wrap: wrap;
    gap: 3px; /* Adjusted gap */
  }
  .site-title {
    font-size: 1.2rem; /* Adjusted font size */
  }
  .logo {
    height: 25px; /* Adjusted size */
    width: 25px;
  }
  .nav-link {
    padding: 3px 5px; /* Adjusted padding */
    font-size: 0.7rem; /* Adjusted font size */
  }
  .cyber-button {
    margin: 0 3px; /* Adjusted margin */
    padding: 3px 6px; /* Adjusted padding */
    font-size: 0.7rem; /* Adjusted font size */
  }
}
</style>
