// This is a rollup configuration file.  See https://www.npmjs.com/package/rollups

import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    plugins: [
        commonjs()
    ],
    output: [
        { file: 'dist/vue-state-machine.es.js', format: 'es' },
        { file: 'dist/vue-state-machine.cjs.js', format: 'cjs' },
        { file: 'dist/vue-state-machine.umd.js', format: 'umd', name: 'vueStateMachine' }
    ],
    external: [ 'xstate' ]
};