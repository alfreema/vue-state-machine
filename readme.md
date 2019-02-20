# Vue State Machine

This plugin is intended to be an easy to use state machine for vue, 
based on vuex and David Khourshid's xstate package.  It allows 
you to have one state machine per vuex module.  

## Requirements

The vue-state-machine plugin is intended to be used for applications that 
use vuex as a store and xstate as a state machine processor. Make sure that 
both vuex and xstate have been loaded beforehand.

- Vue ^2.0.0
- Vuex ^2.0.0
- davidkpiano/xstate ^3.3.3

## Installation
```
$ npm install vue-state-machine
```

## Setup

The plugin provides a vuex module to store each machine, each machine's
current state, and to provide reactive access to state changes.  The plugin also
provides easy access to xstate's transition functionality.

Below is a simple example of a two-state machine that hides/displays a password
that is stored as a vuex state.

#### Load the plugin

In your main.js (for example), you can load the plugin with:
```
import store from './store'
import vsm from 'vue-state-machine'

// vsm requires a reference to a vuex store
Vue.use(vsm.plugin, store)
```

#### Create a vuex store that also holds a state machine

Create a store.js file (or ./store/index.js) that contains all of the usual
getters, actions, mutations, but which also contains a state machine.  In this
example the machine is inline, but usually you would want to import the machine
so that you aren't cluttering up the store.js file.

```
export default {

  namespaced: true,

  state: {
    password: 'sesame',
  
    /* state machine flags */
    showPassword: false
  },

  machine: {
    initial: 'password_hidden',
    strict: true,
    states: {
  
      password_hidden: {
        on: {
          SHOW_PASSWORD_CLICKED: {
            password_visible: {
              actions: ['SHOW_PASSWORD']
            }
          }
  
        }
      },
  
      password_visible: {
        on: {
          HIDE_PASSWORD_CLICKED: {
            password_hidden: {
              actions: ['HIDE_PASSWORD']
            }
          }
  
        }
      }
    }
  },

  getters: {
    password(state) {
      return state.password;
    },

    /* state machine flags */
    showPassword(state) {
      return state.showPassword
    }
  },

  mutations: {
    /* state machine flags */
    showPassword(state, value) {
      state.showPassword = value
    }
  },

  actions: {
    /* State machine flags */
    SHOW_PASSWORD({commit}) {
      console.log('user/actions:SHOW_PASSWORD')
      commit('showPassword', true);
    },

    HIDE_PASSWORD({commit}) {
      console.log('user/actions:HIDE_PASSWORD')
      commit('showPassword', false);
    },

  }

}
```

#### Use the state machine

Next, create vue component that registers the store (and state machine) 
above, and makes use of it.

```
<template>
  <div id="userDetails">
    <div v-show="!showPassword">
      <button @click="showClicked">Show password</button>
    </div>
    <div v-show="showPassword">
      {{password}}<button @click="hideClicked">Hide password</button>
    </div>
  </div>
</template>

<script>
  import Store from './store'

  export default {
    components: {
      Store
    },
    data() {
      return {
      }
    },

    methods: {
      showClicked() {
        this.$vsm.transition('SHOW_PASSWORD_CLICKED')
      },

      hideClicked() {
        this.$vsm.transition('HIDE_PASSWORD_CLICKED')
      }
    },

    computed: {
      password() {
        return this.$store.getters['user/password']
      },
      showPassword() {
        return this.$store.getters['user/showPassword']
      }
    },

    created() {
      this.$store.registerModule('user', Store)
      this.$vsm.add('user', Store.machine)
      this.$vsm.set('user')
    }
  }
</script>

```

## Other thoughts

It's not uncommon to need to make API calls (for example with axios) as part of
the state machine.  With this machine plugin, I have found it easiest to place
those calls within the actions of my vuex store.  From there, it's easy to change
the state of your state machine, based on the results of the calls.