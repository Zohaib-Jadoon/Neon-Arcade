import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import LoginView from "../views/LoginView.vue"
import SignupView from "../views/SignupView.vue"
import ForgotPasswordView from "../views/ForgotPasswordView.vue"
import GamesView from "../views/GamesView.vue"
import DealsView from "../views/DealsView.vue"
import CategoriesView from "../views/CategoriesView.vue"
import CartView from "../views/CartView.vue"
import CheckoutView from "../views/CheckoutView.vue"
import ProfileView from "../views/ProfileView.vue"
import SellerDashboardView from "../views/seller/SellerDashboardView.vue"
import GameManagementView from "../views/seller/GameManagementView.vue"
import SalesTrackingView from "../views/seller/SalesTrackingView.vue"
import SellerProfileView from "../views/seller/SellerProfileView.vue"
import AboutView from "../views/AboutView.vue" // Import the AboutView
import store from "../store" // Import the Vuex store

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView, // Use the imported AboutView
    meta: { title: "About Us - Neon Arcade" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresGuest: true, title: "Login - Neon Arcade" },
  },
  {
    path: "/signup",
    name: "signup",
    component: SignupView,
    meta: { requiresGuest: true, title: "Sign Up - Neon Arcade" },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordView,
    meta: { requiresGuest: true, title: "Forgot Password - Neon Arcade" },
  },
  {
    path: "/games",
    name: "games",
    component: GamesView,
    meta: { title: "Games - Neon Arcade" },
  },
  {
    path: "/deals",
    name: "deals",
    component: DealsView,
    meta: { title: "Deals - Neon Arcade" },
  },
  {
    path: "/categories",
    name: "categories",
    component: CategoriesView,
    meta: { title: "Categories - Neon Arcade" },
  },
  {
    path: "/cart",
    name: "cart",
    component: CartView,
    meta: { requiresAuth: true, requiresRole: "gamer", title: "Cart - Neon Arcade" },
  },
  {
    path: "/checkout",
    name: "checkout",
    component: CheckoutView,
    meta: { requiresAuth: true, requiresRole: "gamer", title: "Checkout - Neon Arcade" },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true, requiresRole: "gamer", title: "Profile - Neon Arcade" },
  },
  {
    path: "/seller/dashboard",
    name: "seller-dashboard",
    component: SellerDashboardView,
    meta: { requiresAuth: true, requiresRole: "seller", title: "Seller Dashboard - Neon Arcade" },
  },
  {
    path: "/seller/games",
    name: "seller-game-management",
    component: GameManagementView,
    meta: { requiresAuth: true, requiresRole: "seller", title: "Manage Games - Neon Arcade" },
  },
  {
    path: "/seller/games/new",
    name: "seller-game-new",
    component: () => import("../components/seller/GameForm.vue"),
    meta: { requiresAuth: true, requiresRole: "seller", title: "Add New Game - Neon Arcade" },
  },
  {
    path: "/seller/games/:id/edit",
    name: "seller-game-edit",
    component: () => import("../components/seller/GameForm.vue"),
    meta: { requiresAuth: true, requiresRole: "seller", title: "Edit Game - Neon Arcade" },
  },
  {
    path: "/seller/sales",
    name: "seller-sales-tracking",
    component: SalesTrackingView,
    meta: { requiresAuth: true, requiresRole: "seller", title: "Sales Tracking - Neon Arcade" },
  },
  {
    path: "/seller/profile",
    name: "seller-profile",
    component: SellerProfileView,
    meta: { requiresAuth: true, requiresRole: "seller", title: "Seller Profile - Neon Arcade" },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.user?.role // Use optional chaining for user

  // Update document title
  document.title = to.meta.title || "Neon Arcade"

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login")
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next("/")
  } else if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
    // Redirect to home or a specific unauthorized page if role doesn't match
    alert(`Access Denied: You must be a ${to.meta.requiresRole} to view this page.`)
    next("/") // Redirect to home
  } else {
    next()
  }
})

export default router
