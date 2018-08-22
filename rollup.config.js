// This is a rollup configuration file.  See https://www.npmjs.com/package/rollups

import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/index.js',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs()
    ],
    output: [
        { file: 'dist/vue-state-machine.es.js', format: 'es' },
        { file: 'dist/vue-state-machine.cjs.js', format: 'cjs' },
        { file: 'dist/vue-state-machine.umd.js', format: 'umd', name: 'vueStateMachine' }
    ],
    external: [ 'xstate' ]
};