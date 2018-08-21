/* Large parts of the plugin technique were taken from:
**  https://github.com/dkfbasel/vuex-i18n/blob/master/src/vuex-i18n-plugin.js
*/

import {Machine} from 'xstate';
import module from './vsm-store'

let vsmPlugin = {}

vsmPlugin.install = function install(Vue, store, options) {

  // merge default options with user supplied options
  let mergedConfig = Object.assign({
    moduleName: 'vsm'
  }, options);

  // define module name and identifiers as constants to prevent any changes
  const moduleName = mergedConfig.moduleName;

  // register the vsm module in the vuex store
  store.registerModule(moduleName, module);

  // check if the plugin was correctly initialized
  if (store.state.hasOwnProperty(moduleName) === false) {
    console.error('vsm: vsm vuex module is not correctly initialized. Please check the module name:', moduleName);
    return;
  };

  // we will be transitioning the current machine's state which is stored as vsm.state.currentState.
  // ultimately we need to update vsm.state.currentState with the result so we can reactively
  // update the listeners.  note that we pass any arguments directly on to transitionMachine
  let transition = function transition() {
    console.log('vsm-plugin:transition():begin')
    let currentState = store.state[moduleName].currentState;

    return transitionMachine(currentState, ...arguments)
  }

  // here we transition a specific machine
  let transitionMachine = function transitionMachine(currentState) {

    let args = arguments

    let type = ''
    let params = {}

    if(args.length > 0)
      type = args[1]

    if(args.length > 1)
      params = args[2]

    console.log('vsm-plugin:transitionMachine():begin:currentState=' + currentState + ':type=' + type + ':params=' + params)

    let machineName = store.state[moduleName].machineName
    console.log('vsm-plugin:transitionMachine():machineName=' + machineName)

    let machine = store.state[moduleName].machines[machineName]
    console.log('vsm-plugin:transitionMachine():machine=' + machine)

    const nextState = machine.transition(currentState, type);
    console.log('vsm-plugin:transitionMachine():nextState=' + nextState)

    store.dispatch({
      type: `${moduleName}/setCurrentState`,
      currentState: nextState
    })

    nextState.actions.forEach(actionKey => {
      store.dispatch(machineName + '/' + actionKey, {type, params, history: nextState.history});
    });

  }

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
    })
  }


  // register global methods
  Vue.prototype.$vsm = {
    transition: transition,
    set: setMachine,
    add: addMachine
  };

};

export default vsmPlugin;
