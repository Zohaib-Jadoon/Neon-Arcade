<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import SellerNavBar from './components/SellerNavBar.vue'

const store = useStore()
const userRole = computed(() => store.getters.user?.role)
const error = ref(null)

onMounted(() => {
  store.dispatch('initializeAuth')
})

// Global error handler
const errorHandler = (err, vm, info) => {
  console.error('Global error handler:', err, info)
  error.value = err.message || 'An unexpected error occurred.'
}

</script>

<template>
  <header>
    <NavBar v-if="userRole !== 'seller'" />
    <SellerNavBar v-else />
  </header>

  <main>
    <RouterView v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" @errorCaptured="errorHandler" />
      </transition>
    </RouterView>
    <div v-if="error" class="error-message">
      <h2>Error</h2>
      <p>{{ error }}</p>
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

.error-message {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  background-color: #ffdddd;
  border: 1px solid #ff0000;
  padding: 15px;
  border-radius: 5px;
  z-index: 1000;
}
</style>
