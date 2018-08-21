import { Machine } from 'xstate';

/* vsm-store defines a vuex module to store the current state for a state machine.
 */

const vsmVuexModule = {
  namespaced: true,

  state: {
    machineName: null,
    currentState: null,
    machines: {}
  },

  getters: {
  },

  mutations: {

    // set the current state
    SET_CURRENT_STATE(state, payload) {
      state.currentState = payload.currentState;
    },

    // set the current machine
    SET_MACHINE(state, payload) {
      state.machineName = payload.machineName;
      state.currentState = state.machines[payload.machineName].currentState;
    },

    // add a machine
    ADD_MACHINE(state, payload) {
      state.machines[payload.machineName] = payload.machine;
    }
  },

  actions: {

    // set the current state
    setCurrentState(context, payload) {
      console.log('vsm-store:actions:setCurrentState():currentState=' + payload.currentState);
      context.commit({
        type: 'SET_CURRENT_STATE',
        currentState: payload.currentState.value
      });
    },

    // set the current machine
    setMachine(context, payload) {
      console.log('vsm-store:actions:setMachine():machineName=' + payload.machineName);
      if (context.state.machines.hasOwnProperty(payload.machineName) === false) {
        console.error('vsm: machine is not found. Please check the machine name:', payload.machineName);
        return
      }

      context.commit({
        type: 'SET_MACHINE',
        machineName: payload.machineName
      });
    },

    // add a machine
    addMachine(context, payload) {
      console.log('vsm-store:actions:addMachine():machineName=' + payload.machineName + ':machine=' +  payload.machine);
      payload.machine.currentState = payload.machine.initial;
      console.log('vsm-store:actions:addMachine():currentState=' + payload.machine.currentState);
      context.commit({
        type: 'ADD_MACHINE',
        machineName: payload.machineName,
        machine: payload.machine
      });
    }
  }
};

/* Large parts of the plugin technique were taken from:
**  https://github.com/dkfbasel/vuex-i18n/blob/master/src/vuex-i18n-plugin.js
*/

let vsmPlugin = {};

vsmPlugin.install = function install(Vue, store, options) {

  // merge default options with user supplied options
  let mergedConfig = Object.assign({
    moduleName: 'vsm'
  }, options);

  // define module name and identifiers as constants to prevent any changes
  const moduleName = mergedConfig.moduleName;

  // register the vsm module in the vuex store
  store.registerModule(moduleName, vsmVuexModule);

  // check if the plugin was correctly initialized
  if (store.state.hasOwnProperty(moduleName) === false) {
    console.error('vsm: vsm vuex module is not correctly initialized. Please check the module name:', moduleName);
    return;
  }
  // we will be transitioning the current machine's state which is stored as vsm.state.currentState.
  // ultimately we need to update vsm.state.currentState with the result so we can reactively
  // update the listeners.  note that we pass any arguments directly on to transitionMachine
  let transition = function transition() {
    console.log('vsm-plugin:transition():begin');
    let currentState = store.state[moduleName].currentState;

    return transitionMachine(currentState, ...arguments)
  };

  // here we transition a specific machine
  let transitionMachine = function transitionMachine(currentState) {

    let args = arguments;

    let type = '';
    let params = {};

    if(args.length > 0)
      type = args[1];

    if(args.length > 1)
      params = args[2];

    console.log('vsm-plugin:transitionMachine():begin:currentState=' + currentState + ':type=' + type + ':params=' + params);

    let machineName = store.state[moduleName].machineName;
    console.log('vsm-plugin:transitionMachine():machineName=' + machineName);

    let machine = store.state[moduleName].machines[machineName];
    console.log('vsm-plugin:transitionMachine():machine=' + machine);

    const nextState = machine.transition(currentState, type);
    console.log('vsm-plugin:transitionMachine():nextState=' + nextState);

    store.dispatch({
      type: `${moduleName}/setCurrentState`,
      currentState: nextState
    });

    nextState.actions.forEach(actionKey => {
      store.dispatch(machineName + '/' + actionKey, {type, params, history: nextState.history});
    });

  };

/*
  export function transition (machine, {commit, state, dispatch}, {type, params, extState}) {
    const nextState = machine.transition(state.state, {type, params}, extState);
    commit(`update${machine.config.id}State`, nextState.value);
    nextState.actions.forEach(actionKey => {
      dispatch(actionKey, {type, params, history: nextState.history});
    });
  }
*/


  // add a state machine to the store
  let addMachine = function addMachine(storeName, machine) {
    return store.dispatch({
      type: `${moduleName}/addMachine`,
      machineName: storeName,
      machine: Machine(machine)
    });
  };

  let setMachine = function setMachine(machineName) {
    store.dispatch({
      type: `${moduleName}/setMachine`,
      machineName: machineName
    });
  };


  // register global methods
  Vue.prototype.$vsm = {
    transition: transition,
    set: setMachine,
    add: addMachine
  };

};

var index = {
    store: vsmVuexModule,
    plugin: vsmPlugin
};

export default index;
