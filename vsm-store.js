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
      state.currentState = payload.currentState
    },

    // set the current machine
    SET_MACHINE(state, payload) {
      state.machineName = payload.machineName
      state.currentState = state.machines[payload.machineName].currentState
    },

    // add a machine
    ADD_MACHINE(state, payload) {
      state.machines[payload.machineName] = payload.machine
    }
  },

  actions: {

    // set the current state
    setCurrentState(context, payload) {
      console.log('vsm-store:actions:setCurrentState():currentState=' + payload.currentState)
      context.commit({
        type: 'SET_CURRENT_STATE',
        currentState: payload.currentState.value
      })
    },

    // set the current machine
    setMachine(context, payload) {
      console.log('vsm-store:actions:setMachine():machineName=' + payload.machineName)
      if (context.state.machines.hasOwnProperty(payload.machineName) === false) {
        console.error('vsm: machine is not found. Please check the machine name:', payload.machineName);
        return
      }

      context.commit({
        type: 'SET_MACHINE',
        machineName: payload.machineName
      })
    },

    // add a machine
    addMachine(context, payload) {
      console.log('vsm-store:actions:addMachine():machineName=' + payload.machineName + ':machine=' +  payload.machine)
      payload.machine.currentState = payload.machine.initial
      console.log('vsm-store:actions:addMachine():currentState=' + payload.machine.currentState)
      context.commit({
        type: 'ADD_MACHINE',
        machineName: payload.machineName,
        machine: payload.machine
      })
    }
  }
}

export default vsmVuexModule;
