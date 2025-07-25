<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFsm } from '../composables/useFsm'
import logoSvg from '@/assets/logo.svg'

const store = useStore()
const router = useRouter()
const { sendTransition, state, context, nextEvents } = useFsm()

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const cartItemCount = computed(() => store.getters.cartItemCount)

// Debug logging
const logFsmState = () => {
  console.log('=== FSM DEBUG INFO ===')
  console.log('Current state:', state.value)
  console.log('Current context:', context.value)
  console.log('Available transitions:', nextEvents.value)
  console.log('===================')
}

// Error handling with user feedback
const handleNavigation = async (transitionType, route) => {
  try {
    console.log(`Attempting navigation: ${transitionType} -> ${route}`)
    logFsmState()
    
    console.log(`Sending transition: ${transitionType}`)
    await sendTransition('globalKey', transitionType)
    
    console.log('FSM transition successful, navigating to:', route)
    router.push(route)
  } catch (error) {
    console.error('FSM transition error:', error)
    console.log('Available transitions were:', nextEvents.value)
    
    // Fallback navigation even if FSM fails
    console.log('Attempting fallback navigation to:', route)
    router.push(route)
  }
}

const logout = async () => {
  try {
    await sendTransition('globalKey', 'LOGOUT')
    store.dispatch('logout')
    router.push('/login')
  } catch (error) {
    console.error('FSM transition error:', error)
    // Fallback logout even if FSM fails
    store.dispatch('logout')
    router.push('/login')
  }
}

// Debug version of goCart
const goCart = () => {
  console.log('=== CART CLICK DEBUG ===')
  console.log('Current FSM state before cart click:', state.value)
  console.log('Available transitions:', nextEvents.value)
  console.log('Checking if GO_CART is available:', nextEvents.value?.includes('GO_CART'))
  
  // Try GO_CART first, then fallback to ADD_TO_CART
  if (nextEvents.value?.includes('GO_CART')) {
    console.log('Using GO_CART transition')
    handleNavigation('GO_CART', '/cart')
  } else if (nextEvents.value?.includes('ADD_TO_CART')) {
    console.log('Using ADD_TO_CART transition')
    handleNavigation('ADD_TO_CART', '/cart')
  } else {
    console.log('No cart transition available, forcing navigation')
    router.push('/cart')
  }
}

// Fixed navigation functions
const goHome = () => handleNavigation('GO_HOME', '/')
const goLogin = () => handleNavigation('LOGIN', '/login')
const goSignup = () => handleNavigation('GO_SIGNUP', '/signup')
const goGames = () => handleNavigation('GO_GAMES', '/games')
const goCategories = () => handleNavigation('GO_CATEGORIES', '/categories')
const goDeals = () => handleNavigation('GO_DEALS', '/deals')
const goAbout = () => handleNavigation('GO_ABOUT', '/about')
const goProfile = () => handleNavigation('GO_PROFILE', '/profile')
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <router-link to="/" class="logo-link" @click.prevent="goHome">
        <img :src="logoSvg" alt="Neon Arcade Logo - Gaming Store Homepage" class="logo" />
        <span class="site-title">Neon Arcade</span>
      </router-link>
    </div>
    <div class="navbar-center">
      <a href="#" class="nav-link" @click.prevent="goGames" aria-label="Browse Games">Games</a>
      <a href="#" class="nav-link" @click.prevent="goCategories" aria-label="Browse Categories">Categories</a>
      <a href="#" class="nav-link" @click.prevent="goDeals" aria-label="View Deals">Deals</a>
      <a href="#" class="nav-link" @click.prevent="goAbout" aria-label="About Us">About Us</a>
    </div>
    <div class="navbar-right">
      <!-- Debug info display -->
      <div class="debug-info" style="position: absolute; top: 60px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 12px; z-index: 1000;">
        <div>State: {{ state }}</div>
        <div>Available: {{ nextEvents?.join(', ') }}</div>
      </div>
      
      <a href="#" class="nav-link cart-link" @click.prevent="goCart" aria-label="Shopping Cart">
        <span class="cart-icon" aria-hidden="true">🛒</span> Cart
        <span v-if="cartItemCount > 0" class="cart-badge" :aria-label="`${cartItemCount} items in cart`">{{ cartItemCount }}</span>
      </a>
      <button v-if="!isAuthenticated" @click="goLogin" class="cyber-button auth-button" aria-label="Login to your account">Login</button>
      <button v-if="!isAuthenticated" @click="goSignup" class="cyber-button auth-button" aria-label="Create new account">Sign Up</button>
      <a v-if="isAuthenticated" href="#" class="cyber-button auth-button profile-button" @click.prevent="goProfile" aria-label="View Profile">
        <span class="profile-icon" aria-hidden="true">👤</span> Profile
      </a>
      <button v-if="isAuthenticated" @click="logout" class="cyber-button auth-button logout-button" aria-label="Logout from account">Logout</button>
    </div>
  </nav>
</template>

<style scoped>
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

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.85) 100%);
  border-bottom: 3px solid var(--cyber-border-color);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8), inset 0 -8px 20px rgba(0, 240, 255, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(8px);
  animation: border-pulse 5s infinite alternate;
  border-radius: 0 0 20px 20px;
  clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px));
  transform: perspective(1000px) rotateX(2deg) translateY(0px);
  transition: all 0.5s ease;
  will-change: transform, box-shadow;
  font-family: 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar:hover {
  transform: perspective(1000px) rotateX(0deg) translateY(-2px);
  box-shadow: 0 0 40px rgba(0, 240, 255, 1), inset 0 -10px 25px rgba(0, 240, 255, 0.4);
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo {
  height: 40px;
  width: 40px;
  filter: drop-shadow(0 0 8px var(--cyber-accent-green));
  animation: pulse-glow-logo 3s infinite alternate;
  will-change: filter;
}

.site-title {
  font-family: inherit;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
  will-change: text-shadow, transform;
}

.nav-link {
  color: var(--cyber-text-primary);
  text-decoration: none;
  padding: 8px 18px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease, text-shadow 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
  will-change: color, text-shadow, transform;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--cyber-accent-green), transparent);
  box-shadow: var(--cyber-glow-green);
  transform: scaleX(0);
  transform-origin: center;
  transition: width 0.3s ease, left 0.3s ease, transform 0.3s ease;
  will-change: width, left, transform;
}

.nav-link:hover {
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  transform: translateY(-2px) translateZ(5px);
}

.nav-link:hover::before {
  width: 100%;
  left: 0;
  transform: scaleX(1);
}

.nav-link.router-link-exact-active {
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

.nav-link.router-link-exact-active::before {
  width: 100%;
  left: 0;
  transform: scaleX(1);
}

.cart-link {
  position: relative;
  margin-right: 15px;
}

.cart-icon {
  font-size: 1.2rem;
  margin-right: 5px;
  color: var(--cyber-border-color);
  text-shadow: 0 0 8px var(--cyber-border-color);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff3366;
  color: white;
  border-radius: 50%;
  padding: 3px 7px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 22px;
  text-align: center;
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.7);
  animation: pulse-badge 1.5s infinite alternate;
  will-change: transform, box-shadow;
}

/* Cyber Button Styling for Auth Buttons */
.cyber-button {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  border: 2px solid var(--cyber-accent-purple);
  padding: 8px 18px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  box-shadow: var(--cyber-glow-purple);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%);
  margin-left: 12px;
  will-change: background-color, border-color, color, box-shadow, transform;
}

/* Fallback for browsers that don't support clip-path */
@supports not (clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)) {
  .cyber-button {
    clip-path: none;
    border-radius: 4px;
  }
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
  will-change: left;
}

.cyber-button:hover {
  background-color: var(--cyber-border-color);
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
  border-color: var(--cyber-border-color);
  color: var(--cyber-border-color);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.auth-button:hover {
  background-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
}

.profile-button {
  border-color: var(--cyber-accent-green);
  color: var(--cyber-accent-green);
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
}

.profile-button:hover {
  background-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
}

.profile-icon {
  margin-right: 5px;
}

.logout-button {
  border-color: #ff3366;
  color: #ff3366;
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
}

.logout-button:hover {
  background-color: #ff3366;
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
}

/* Debug info styling */
.debug-info {
  border: 1px solid var(--cyber-accent-green);
  border-radius: 4px;
  max-width: 200px;
  word-wrap: break-word;
  font-family: monospace;
}

/* Animations */
@keyframes border-pulse {
  0% { 
    border-color: var(--cyber-border-color); 
    box-shadow: 0 0 25px rgba(0, 240, 255, 0.6), inset 0 -5px 15px rgba(0, 240, 255, 0.2); 
  }
  50% { 
    border-color: var(--cyber-accent-green); 
    box-shadow: 0 0 25px rgba(0, 255, 102, 0.6), inset 0 -5px 15px rgba(0, 255, 102, 0.2); 
  }
  100% { 
    border-color: var(--cyber-border-color); 
    box-shadow: 0 0 25px rgba(0, 240, 255, 0.6), inset 0 -5px 15px rgba(0, 240, 255, 0.2); 
  }
}

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

@keyframes pulse-glow-logo {
  0% { filter: drop-shadow(0 0 8px var(--cyber-accent-green)); }
  50% { filter: drop-shadow(0 0 15px var(--cyber-accent-green)) drop-shadow(0 0 25px rgba(0, 255, 102, 0.5)); }
  100% { filter: drop-shadow(0 0 8px var(--cyber-accent-green)); }
}

@keyframes pulse-badge {
  0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 51, 102, 0.7); }
  50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 51, 102, 1); }
  100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 51, 102, 0.7); }
}

/* Reduce animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .navbar,
  .site-title,
  .logo,
  .cart-badge,
  .nav-link,
  .cyber-button,
  .cyber-button::before {
    animation: none;
    transition: none;
  }
  
  .navbar:hover,
  .nav-link:hover,
  .cyber-button:hover {
    transform: none;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .navbar {
    flex-wrap: wrap;
    justify-content: center;
    padding: 8px 15px;
    transform: perspective(1000px) rotateX(0deg) translateY(0px);
    border-radius: 0 0 15px 15px;
    clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px));
  }
  
  @supports not (clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px))) {
    .navbar {
      clip-path: none;
      border-radius: 0 0 15px 15px;
    }
  }
  
  .navbar-left, .navbar-right {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }
  .navbar-center {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 8px;
    gap: 8px;
  }
  .nav-link {
    padding: 6px 10px;
    font-size: 0.95rem;
  }
  .cyber-button {
    padding: 6px 12px;
    font-size: 0.85rem;
    margin-left: 8px;
  }
  
  .debug-info {
    position: fixed;
    top: 120px;
    right: 10px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 8px 10px;
  }
  .site-title {
    font-size: 1.5rem;
  }
  .logo {
    height: 32px;
    width: 32px;
  }
  .nav-link {
    padding: 5px 8px;
    font-size: 0.85rem;
  }
  .cart-link {
    margin-right: 8px;
  }
  .cart-icon {
    font-size: 1rem;
  }
  .cart-badge {
    top: -4px;
    right: -4px;
    padding: 2px 5px;
    font-size: 0.7rem;
    min-width: 16px;
  }
  .cyber-button {
    padding: 5px 10px;
    font-size: 0.8rem;
    margin-left: 6px;
  }
  
  .debug-info {
    font-size: 10px;
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .navbar {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  .navbar-left, .navbar-center, .navbar-right {
    width: 100%;
    justify-content: center;
    margin-bottom: 0;
  }
  .navbar-center {
    flex-wrap: wrap;
    gap: 4px;
  }
  .site-title {
    font-size: 1.3rem;
  }
  .logo {
    height: 28px;
    width: 28px;
  }
  .nav-link {
    padding: 4px 6px;
    font-size: 0.75rem;
  }
  .cyber-button {
    margin: 0 4px;
    padding: 4px 8px;
    font-size: 0.75rem;
  }
  
  .debug-info {
    position: fixed;
    top: 140px;
    right: 5px;
    font-size: 9px;
    max-width: 120px;
    padding: 5px;
  }
}
</style>