import { createStore } from "vuex"

// Import images properly
import Cyberpunk2077 from "@/assets/images/Cyberpunk2077.jpeg"
import GhostintheShell from "@/assets/images/GhostintheShell.jpeg"
import NeonDrive from "@/assets/images/NeonDrive.jpeg"
import BladeRunner2049 from "@/assets/images/BladeRunner2049.jpeg"
import NeuralNetwork from "@/assets/images/NeuralNetwork.jpeg"
import DigitalWarfare from "@/assets/images/DigitalWarfare.jpeg"

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    cart: [],
    wishlist: [],
    // Combined list of all games
    allGames: [
      {
        id: 1,
        title: "Cyberpunk 2077",
        price: 16799,
        originalPrice: 22399,
        image: Cyberpunk2077,
        rating: 4.2,
        genre: "RPG",
        platform: ["PC", "PS5", "Xbox"],
        featured: true,
        description:
          "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
        releaseDate: "2020-12-10",
        developer: "CD Projekt Red",
        tags: ["Open World", "Futuristic", "Story Rich"],
        sellerId: "system", // Indicates a pre-defined game
      },
      {
        id: 2,
        title: "Ghost in the Shell",
        price: 13999,
        originalPrice: 19599,
        image: GhostintheShell,
        rating: 4.5,
        genre: "Action",
        platform: ["PC", "PS5"],
        featured: true,
        description: "Dive into a cyberpunk world where the line between human and machine blur.",
        releaseDate: "2023-03-15",
        developer: "Nexus Interactive",
        tags: ["Cyberpunk", "Action", "Sci-Fi"],
        sellerId: "system",
      },
      {
        id: 3,
        title: "Neon Drive",
        price: 8399,
        originalPrice: 11199,
        image: NeonDrive,
        rating: 4.0,
        genre: "Racing",
        platform: ["PC", "Switch"],
        featured: false,
        description: "High-speed racing through neon-lit cyberpunk cities.",
        releaseDate: "2023-01-20",
        developer: "Speed Studios",
        tags: ["Racing", "Arcade", "Neon"],
        sellerId: "system",
      },
      {
        id: 4,
        title: "Blade Runner 2049",
        price: 11199,
        originalPrice: 16799,
        image: BladeRunner2049,
        rating: 4.7,
        genre: "Adventure",
        platform: ["PC", "PS5", "Xbox"],
        featured: true,
        description: "Uncover the mysteries of a dystopian future in this narrative-driven adventure.",
        releaseDate: "2022-11-08",
        developer: "Replicant Games",
        tags: ["Story Rich", "Detective", "Atmospheric"],
        sellerId: "system",
      },
      {
        id: 5,
        title: "Neural Network",
        price: 12599,
        image: NeuralNetwork,
        rating: 4.3,
        genre: "Puzzle",
        platform: ["PC"],
        featured: false,
        description: "Hack through complex neural networks in this mind-bending puzzle game.",
        releaseDate: "2023-05-12",
        developer: "Mind Games Inc",
        tags: ["Puzzle", "Hacking", "Strategy"],
        sellerId: "system",
      },
      {
        id: 6,
        title: "Digital Warfare",
        price: 15399,
        image: DigitalWarfare,
        rating: 4.1,
        genre: "FPS",
        platform: ["PC", "PS5", "Xbox"],
        featured: false,
        description: "Intense first-person combat in a digital battlefield.",
        releaseDate: "2023-02-28",
        developer: "Combat Systems",
        tags: ["FPS", "Multiplayer", "Competitive"],
        sellerId: "system",
      },
    ],
    categories: ["RPG", "Action", "Racing", "FPS", "Puzzle", "Adventure", "Strategy", "Sports"],
    categoryColors: {
      RPG: "var(--neon-green)",
      Action: "var(--neon-red)",
      Racing: "var(--neon-cyan)",
      FPS: "var(--neon-yellow)",
      Puzzle: "var(--neon-purple)",
      Adventure: "var(--neon-green)",
      Strategy: "var(--neon-cyan)",
      Sports: "var(--neon-red)",
    },
    categoryIcons: {
      RPG: "⚔️",
      Action: "💥",
      Racing: "🏎️",
      FPS: "🔫",
      Puzzle: "🧩",
      Adventure: "🗺️",
      Strategy: "🧠",
      Sports: "⚽",
    },
    categoryDescriptions: {
      RPG: "Immersive role-playing games with deep narratives.",
      Action: "Fast-paced games focused on combat and reflexes.",
      Racing: "High-speed competitions and futuristic vehicles.",
      FPS: "First-person shooters with intense gunplay.",
      Puzzle: "Mind-bending challenges and strategic thinking.",
      Adventure: "Explore vast worlds and uncover hidden secrets.",
      Strategy: "Plan your moves and outsmart your opponents.",
      Sports: "Compete in futuristic sports and athletic challenges.",
    },
    orders: [],
    currentOrder: null,
    sellerSales: [], // To store sales data for sellers
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },

    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
    },

    ADD_TO_CART(state, game) {
      const existingItem = state.cart.find((item) => item.id === game.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cart.push({ ...game, quantity: 1 })
      }
      // Fixed: Added try-catch for localStorage
      try {
        localStorage.setItem("cart", JSON.stringify(state.cart))
      } catch (error) {
        console.warn("Could not save cart to localStorage:", error)
      }
    },

    REMOVE_FROM_CART(state, gameId) {
      state.cart = state.cart.filter((item) => item.id !== gameId)
      try {
        localStorage.setItem("cart", JSON.stringify(state.cart))
      } catch (error) {
        console.warn("Could not save cart to localStorage:", error)
      }
    },

    UPDATE_CART_QUANTITY(state, { gameId, quantity }) {
      const item = state.cart.find((item) => item.id === gameId)
      if (item) {
        item.quantity = quantity
      }
      try {
        localStorage.setItem("cart", JSON.stringify(state.cart))
      } catch (error) {
        console.warn("Could not save cart to localStorage:", error)
      }
    },

    CLEAR_CART(state) {
      state.cart = []
      try {
        localStorage.removeItem("cart")
      } catch (error) {
        console.warn("Could not clear cart from localStorage:", error)
      }
    },

    LOAD_CART(state) {
      try {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          state.cart = JSON.parse(savedCart)
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        state.cart = []
      }
    },

    ADD_TO_WISHLIST(state, game) {
      const exists = state.wishlist.find((item) => item.id === game.id)
      if (!exists) {
        state.wishlist.push(game)
        try {
          localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
        } catch (error) {
          console.warn("Could not save wishlist to localStorage:", error)
        }
      }
    },

    REMOVE_FROM_WISHLIST(state, gameId) {
      state.wishlist = state.wishlist.filter((item) => item.id !== gameId)
      try {
        localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
      } catch (error) {
        console.warn("Could not save wishlist to localStorage:", error)
      }
    },

    LOAD_WISHLIST(state) {
      try {
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) {
          state.wishlist = JSON.parse(savedWishlist)
        }
      } catch (error) {
        console.error("Error loading wishlist:", error)
        state.wishlist = []
      }
    },

    SET_ALL_GAMES(state, games) {
      state.allGames = games
    },

    ADD_GAME(state, game) {
      state.allGames.push(game)
      try {
        localStorage.setItem("allGames", JSON.stringify(state.allGames))
      } catch (error) {
        console.warn("Could not save games to localStorage:", error)
      }
    },

    UPDATE_GAME(state, updatedGame) {
      const index = state.allGames.findIndex((game) => game.id === updatedGame.id)
      if (index !== -1) {
        state.allGames.splice(index, 1, updatedGame)
        try {
          localStorage.setItem("allGames", JSON.stringify(state.allGames))
        } catch (error) {
          console.warn("Could not save games to localStorage:", error)
        }
      }
    },

    DELETE_GAME(state, gameId) {
      state.allGames = state.allGames.filter((game) => game.id !== gameId)
      try {
        localStorage.setItem("allGames", JSON.stringify(state.allGames))
      } catch (error) {
        console.warn("Could not save games to localStorage:", error)
      }
    },

    ADD_ORDER(state, order) {
      state.orders.push(order)
      try {
        localStorage.setItem("orders", JSON.stringify(state.orders))
      } catch (error) {
        console.warn("Could not save orders to localStorage:", error)
      }
    },

    SET_CURRENT_ORDER(state, order) {
      state.currentOrder = order
    },

    LOAD_ORDERS(state) {
      try {
        const savedOrders = localStorage.getItem("orders")
        if (savedOrders) {
          state.orders = JSON.parse(savedOrders)
        }
      } catch (error) {
        console.error("Error loading orders:", error)
        state.orders = []
      }
    },

    ADD_SALE_RECORD(state, sale) {
      state.sellerSales.push(sale)
      try {
        localStorage.setItem("sellerSales", JSON.stringify(state.sellerSales))
      } catch (error) {
        console.warn("Could not save seller sales to localStorage:", error)
      }
    },

    LOAD_SELLER_SALES(state) {
      try {
        const savedSales = localStorage.getItem("sellerSales")
        if (savedSales) {
          state.sellerSales = JSON.parse(savedSales)
        }
      } catch (error) {
        console.error("Error loading seller sales:", error)
        state.sellerSales = []
      }
    },

    UPDATE_USER_PROFILE(state, updatedProfile) {
      if (state.user) {
        state.user = { ...state.user, ...updatedProfile }
        try {
          localStorage.setItem("user", JSON.stringify(state.user))
        } catch (error) {
          console.warn("Could not save user to localStorage:", error)
        }
      }
    },
  },

  actions: {
    login({ commit }, userData) {
      const userDataWithRole = { ...userData, role: userData.role || "gamer" }
      // Initialize sellerProfile if role is seller and it's not already present
      if (userDataWithRole.role === "seller" && !userDataWithRole.sellerProfile) {
        userDataWithRole.sellerProfile = {
          companyName: "",
          contactEmail: userDataWithRole.email,
          contactPhone: "",
          address: "",
          gamesListed: 0,
        }
      }
      commit("SET_USER", userDataWithRole)
      try {
        localStorage.setItem("user", JSON.stringify(userDataWithRole))
      } catch (error) {
        console.warn("Could not save user to localStorage:", error)
      }
    },

    logout({ commit }) {
      commit("CLEAR_USER")
      commit("CLEAR_CART")
      // Fixed: Remove wishlist from localStorage properly
      try {
        localStorage.removeItem("user")
        localStorage.removeItem("userRole")
        localStorage.removeItem("wishlist")
      } catch (error) {
        console.warn("Could not clear localStorage:", error)
      }
    },

    initializeAuth({ commit, state }) { // Fixed: Added state parameter
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          // Ensure sellerProfile is initialized if user is a seller
          if (user.role === "seller" && !user.sellerProfile) {
            user.sellerProfile = {
              companyName: "",
              contactEmail: user.email,
              contactPhone: "",
              address: "",
              gamesListed: 0,
            }
          }
          commit("SET_USER", { ...user, role: user.role || "gamer" })
        }
      } catch (error) {
        console.error("Error loading user:", error)
        try {
          localStorage.removeItem("user")
          localStorage.removeItem("userRole")
        } catch (e) {
          console.warn("Could not clear invalid user data:", e)
        }
      }

      commit("LOAD_CART")
      commit("LOAD_ORDERS")
      commit("LOAD_SELLER_SALES")
      commit("LOAD_WISHLIST")

      // Fixed: Proper reference to state
      try {
        const savedGames = localStorage.getItem("allGames")
        if (savedGames) {
          const loadedGames = JSON.parse(savedGames)
          const initialGames = state.allGames.filter((game) => game.sellerId === "system")
          const mergedGames = [...initialGames]

          loadedGames.forEach((loadedGame) => {
            if (!mergedGames.some((game) => game.id === loadedGame.id)) {
              mergedGames.push(loadedGame)
            }
          })
          commit("SET_ALL_GAMES", mergedGames)
        }
      } catch (error) {
        console.error("Error loading all games:", error)
        try {
          localStorage.removeItem("allGames")
        } catch (e) {
          console.warn("Could not clear invalid games data:", e)
        }
      }
    },

    addToCart({ commit }, game) {
      commit("ADD_TO_CART", game)
    },

    removeFromCart({ commit }, gameId) {
      commit("REMOVE_FROM_CART", gameId)
    },

    updateCartQuantity({ commit }, payload) {
      commit("UPDATE_CART_QUANTITY", payload)
    },

    addToWishlist({ commit }, game) {
      commit("ADD_TO_WISHLIST", game)
    },

    removeFromWishlist({ commit }, gameId) {
      commit("REMOVE_FROM_WISHLIST", gameId)
    },

    createOrder({ commit, getters }, orderData) {
      const order = {
        id: "ORD-" + Date.now(),
        ...orderData,
        createdAt: new Date().toISOString(),
        status: "pending",
      }
      commit("ADD_ORDER", order)
      commit("SET_CURRENT_ORDER", order)

      orderData.items.forEach((item) => {
        const game = getters.allGames.find((g) => g.id === item.id)
        if (game && game.sellerId) {
          commit("ADD_SALE_RECORD", {
            saleId: "SALE-" + Date.now() + "-" + item.id,
            gameId: item.id,
            gameTitle: item.title,
            sellerId: game.sellerId,
            quantity: item.quantity,
            pricePerUnit: item.price,
            totalRevenue: item.price * item.quantity,
            orderId: order.id,
            saleDate: new Date().toISOString(),
          })
        }
      })

      return order
    },

    updateOrderStatus({ commit, state }, { orderId, status, paymentDetails }) {
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
        order.paymentDetails = paymentDetails
        order.updatedAt = new Date().toISOString()
        try {
          localStorage.setItem("orders", JSON.stringify(state.orders))
        } catch (error) {
          console.warn("Could not save orders to localStorage:", error)
        }
        commit("SET_CURRENT_ORDER", order)
      }
    },

    addGame({ commit, state }, gameData) {
      const newGame = {
        id: Date.now(),
        ...gameData,
        rating: 0,
        featured: false,
        releaseDate: new Date().toISOString().split("T")[0],
        sellerId: state.user?.id || "unknown", // Fixed: Added null check
      }
      commit("ADD_GAME", newGame)
      if (state.user && state.user.sellerProfile) {
        const updatedUser = { ...state.user }
        updatedUser.sellerProfile.gamesListed = (updatedUser.sellerProfile.gamesListed || 0) + 1
        commit("UPDATE_USER_PROFILE", updatedUser)
      }
      return newGame
    },

    updateGame({ commit }, gameData) {
      commit("UPDATE_GAME", gameData)
    },

    deleteGame({ commit, state }, gameId) {
      commit("DELETE_GAME", gameId)
      if (state.user && state.user.sellerProfile) {
        const updatedUser = { ...state.user }
        updatedUser.sellerProfile.gamesListed = Math.max(0, (updatedUser.sellerProfile.gamesListed || 0) - 1)
        commit("UPDATE_USER_PROFILE", updatedUser)
      }
    },
  },

  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    isSeller: (state) => state.user && state.user.role === "seller",
    cartItems: (state) => state.cart,
    cartTotal: (state) => {
      return state.cart.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    },
    cartItemCount: (state) => {
      return state.cart.reduce((count, item) => count + item.quantity, 0)
    },
    wishlistItems: (state) => state.wishlist,
    isInWishlist: (state) => (gameId) => {
      return state.wishlist.some((item) => item.id === gameId)
    },
    isInCart: (state) => (gameId) => {
      return state.cart.some((item) => item.id === gameId)
    },
    userOrders: (state) => state.orders,
    currentOrder: (state) => state.currentOrder,
    allGames: (state) => state.allGames,
    getGameById: (state) => (id) => state.allGames.find((game) => game.id === id),
    getGamesBySeller: (state) => (sellerId) => state.allGames.filter((game) => game.sellerId === sellerId),
    getSalesBySeller: (state) => (sellerId) => state.sellerSales.filter((sale) => sale.sellerId === sellerId),
    getSellerTotalRevenue: (state) => (sellerId) => {
      return state.sellerSales
        .filter((sale) => sale.sellerId === sellerId)
        .reduce((total, sale) => total + sale.totalRevenue, 0)
    },
    getSellerTotalUnitsSold: (state) => (sellerId) => {
      return state.sellerSales
        .filter((sale) => sale.sellerId === sellerId)
        .reduce((total, sale) => total + sale.quantity, 0)
    },
  },
})