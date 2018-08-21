# Vue State Machine

This plugin is intended to be an easy to use state machine for vue 
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


... complete documentation coming soon ...