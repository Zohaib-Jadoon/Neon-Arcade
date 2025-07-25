import "./assets/main.css"
import "./assets/base.css" // Import base.css for global styles

import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store" // Import the store
import { useFsm } from "./composables/useFsm"

const app = createApp(App)

app.config.globalProperties.$fsm = useFsm()

app.use(router)
app.use(store) // Use the store

// Initialize authentication state when the app starts
store.dispatch("initializeAuth")

app.mount("#app")
