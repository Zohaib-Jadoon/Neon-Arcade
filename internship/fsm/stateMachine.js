// ===== UPDATED FSM CONFIGURATION (fsm.js) =====
import { createMachine } from 'xstate';

export const superAppMachine = createMachine({
  id: 'superApp',
  initial: 'idle',
  context: {
    user: null,
    errorMessage: null
  },
  states: {
    idle: {
      on: {
        LOGIN: 'login',
        GO_SIGNUP: 'signup',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle'
      }
    },
    login: {
      on: {
        LOGIN: 'login',
        CHOOSE_CUSTOMER: 'authenticatingCustomer',
        CHOOSE_SELLER: 'authenticatingSeller',
        GO_SIGNUP: 'signup',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
      }
    },
    authenticatingCustomer: {
      on: {
        SUCCESS: {
          target: 'customerView',
          actions: () => {
            console.log('Customer logged in');
          }
        },
        FAILURE: {
          target: 'login',
          actions: () => {
            console.log('Customer login failed');
          }
        },
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle'
      }
    },
    authenticatingSeller: {
      on: {
        SUCCESS: {
          target: 'sellerDashboard',
          actions: () => {
            console.log('Seller logged in');
          }
        },
        FAILURE: {
          target: 'login',
          actions: () => {
            console.log('Seller login failed');
          }
        },
        LOGOUT: 'idle'
      }
    },
    customerView: {
      on: {
        LOGOUT: 'idle',
        BROWSE_GAMES: 'browseGames',
        ADD_TO_CART: 'cart',
        GO_CART: 'cart', // This should work
        GO_CHECKOUT: 'checkout',
        GO_PROFILE: 'profileForm',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
      }
    },
    browseGames: {
      on: {
        LOGOUT: 'idle',
        ADD_TO_CART: 'cart',
        GO_CART: 'cart', // Added missing transition
        BACK: 'customerView',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        EXPLORE_GAMES: 'games'
      }
    },
    cart: {
      on: {
        LOGOUT: 'idle',
        PROCEED_TO_CHECKOUT: 'checkout',
        BACK: 'browseGames',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Allow self-transition
        GO_PROFILE: 'profileForm', // Customer profile
        UPDATE_QUANTITY: { target: 'cart', actions: () => {} },
        REMOVE_ITEM: { target: 'cart', actions: () => {} },
        APPLY_PROMO: { target: 'cart', actions: () => {} },
        CONTINUE_SHOPPING: 'browseGames'
      }
    },
    sellerDashboard: {
      on: {
        LOGOUT: 'idle',
        GO_GAME_MANAGEMENT: 'sellerGameManagement',
        GO_SALES_TRACKING: 'sellerSalesTracking',
        GO_PROFILE: 'sellerProfile', // Seller profile
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        // Note: Sellers don't have cart access typically
      }
    },
    sellerGameManagement: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            ADD_GAME: 'addGame',
            EDIT_GAME: 'editGame',
            DELETE_GAME: 'deleteGame',
            SUBMIT: '#superApp.sellerDashboard',
            CANCEL: '#superApp.sellerDashboard',
          }
        },
        addGame: {
          on: {
            SAVE: 'idle',
            CANCEL: 'idle',
            LOGOUT: '#superApp.idle',
          }
        },
        editGame: {
          on: {
            SAVE: 'idle',
            CANCEL: 'idle',
            LOGOUT: '#superApp.idle',
          }
        },
        deleteGame: {
          on: {
            CONFIRM_DELETE: 'idle',
            CANCEL: 'idle',
            LOGOUT: '#superApp.idle',
          }
        }
      },
      on: {
        LOGOUT: 'idle',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_PROFILE: 'sellerProfile', // Seller profile
      }
    },
    sellerSalesTracking: {
      on: {
        BACK: 'sellerDashboard',
        LOGOUT: 'idle',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_PROFILE: 'sellerProfile', // Seller profile
      }
    },
    sellerProfile: {
      on: {
        SUBMIT_PROFILE: 'sellerDashboard',
        CANCEL: 'sellerDashboard',
        SAVE_PROFILE: 'sellerProfile',
        BACK: 'sellerDashboard',
        LOGOUT: 'idle',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
      }
    },
    checkout: {
      on: {
        BACK: 'cart', // Back to cart instead of customerView
        LOGOUT: 'idle',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        GO_PROFILE: 'profileForm', // Customer profile
      }
    },
    profileForm: {
      on: {
        SUBMIT_PROFILE: 'customerView',
        CANCEL: 'customerView',
        SAVE_PROFILE: 'profileForm',
        BACK: 'customerView',
        LOGOUT: 'idle',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Customer can access cart
      }
    },
    // FIXED: Added self-transitions for all navigation states
    about: {
      on: {
        GO_HOME: 'home',
        GO_ABOUT: 'about', // Allow self-transition
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
      }
    },
    categories: {
      on: {
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories', // Allow self-transition
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
      }
    },
    deals: {
      on: {
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals', // Allow self-transition
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
      }
    },
    forgotPassword: {
      on: {
        GO_LOGIN: 'login',
        GO_SIGNUP: 'signup',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle'
      }
    },
    games: {
      on: {
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games', // Allow self-transition
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
        ADD_TO_CART: 'cart', // Can add to cart from games page
      }
    },
    home: {
      on: {
        GO_HOME: 'home', // Allow self-transition
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle',
        LOGIN: 'login',
        GO_SIGNUP: 'signup',
      }
    },
    signup: {
      on: {
        SIGNUP: 'login',
        LOGIN: 'login',
        GO_FORGOT_PASSWORD: 'forgotPassword',
        GO_LOGIN: 'login',
        GO_HOME: 'home',
        GO_ABOUT: 'about',
        GO_CATEGORIES: 'categories',
        GO_DEALS: 'deals',
        GO_GAMES: 'games',
        GO_CART: 'cart', // Added missing transition
        LOGOUT: 'idle'
      }
    },
  }
});